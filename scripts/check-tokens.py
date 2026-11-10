#!/usr/bin/env python3
"""디자인 토큰 점검 스크립트.

사용법:
    python3 scripts/check-tokens.py

토큰 문서(정본, docs/02-screens/*-design-tokens.md)의 값을 다음 두 곳과 비교한다.
- src/app/globals.css의 @theme: 색(라이트·다크), 카테고리 색, 크기 단계, 모서리, 그림자, 움직임
- 견본 html(docs/02-screens/*-design-tokens.html)의 T·CAT: 색, 카테고리 색, 그림자
문제가 있으면 종료 코드 1.
"""

import glob
import re
import sys

CSS_PATH = "src/app/globals.css"
DATA_DOC_GLOB = "docs/03-data/*-data-architecture.md"
COLOR_SECTIONS = ("### 2-1.", "### 2-2.", "### 2-3.")
# 문서 이름 → globals.css 이름 (4-1 코드 이름)
RADIUS_NAMES = {"radius-sm": "sm", "radius-md": "md", "radius-lg": "lg", "radius-sheet": "sheet"}
TEXT_NAMES = {"버튼 lg": "button-lg"}
DURATION_NAMES = {"시트 열림·닫힘": "sheet", "다이얼로그": "dialog", "드롭다운": "dropdown"}


def section(text, start):
    """'### 2-1.'처럼 시작하는 절의 본문 (다음 같은 수준 이하 제목 전까지)."""
    i = text.index(start)
    level = start.split(" ")[0]
    rest = text[i + len(start):]
    m = re.search(rf"^#{{1,{len(level)}}} ", rest, re.M)
    return rest[: m.start()] if m else rest


def table_rows(text):
    """마크다운 표의 데이터 행을 칸 목록으로."""
    rows = []
    for line in text.splitlines():
        if not line.startswith("|") or re.match(r"^\|[\s\-|]+\|$", line):
            continue
        rows.append([c.strip() for c in line.strip("|").split("|")])
    return rows[1:] if rows else rows


def unquote(cell):
    return cell.strip("`")


def norm_color(value):
    """#1DB954 · #1db954, rgba(0,0,0,.40) · rgba(0, 0, 0, 0.4)를 같은 값으로."""
    v = value.strip().lower().replace(" ", "")
    m = re.fullmatch(r"rgba\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)", v)
    if m:
        return "rgba({},{},{},{})".format(*(f"{float(x):g}" for x in m.groups()))
    return v


def norm_shadow(value):
    v = value.strip()
    colors = re.findall(r"rgba\([^)]*\)", v)
    for c in colors:
        v = v.replace(c, norm_color(c))
    return re.sub(r"\s+", " ", v)


def px(value):
    """'1.25rem' → 20, '250ms' 같은 값은 그대로 숫자."""
    m = re.fullmatch(r"([\d.]+)(rem|px|ms)?", value.strip())
    if not m:
        return None
    n = float(m.group(1))
    return n * 16 if m.group(2) == "rem" else n


def read_doc(path, data_doc):
    text = open(path, encoding="utf-8").read()
    colors = {}
    for start in COLOR_SECTIONS:
        for row in table_rows(section(text, start)):
            colors[unquote(row[0])] = (norm_color(unquote(row[1])), norm_color(unquote(row[2])))

    enum = {}
    for row in table_rows(section(open(data_doc, encoding="utf-8").read(), "### 4-4.")):
        enum[row[1]] = unquote(row[0]).lower()
    cats = {}
    for row in table_rows(section(text, "### 2-4.")):
        cats[f"cat-{enum[row[0]]}"] = (norm_color(unquote(row[1])), norm_color(unquote(row[2])))

    texts = {}
    for row in table_rows(section(text, "### 3-2.")):
        name = TEXT_NAMES.get(row[0], unquote(row[0]))
        size, line, weight = (float(x) for x in re.findall(r"\d+", row[1])[:3])
        texts[name] = (size, line, weight)

    radii, shadows, durations = {}, {}, {}
    for row in table_rows(section(text, "## 4.")):
        key, value = unquote(row[0]), row[1]
        if key in RADIUS_NAMES:
            radii[RADIUS_NAMES[key]] = float(re.match(r"\d+", value).group())
        elif key.startswith("shadow-"):
            shadows[key[len("shadow-"):]] = norm_shadow(re.match(r"`([^`]+)`", value).group(1))
        elif key in DURATION_NAMES:
            durations[DURATION_NAMES[key]] = float(re.match(r"(\d+)ms", value).group(1))
    return colors, cats, texts, radii, shadows, durations


def read_css(path):
    text = open(path, encoding="utf-8").read()
    v = dict(re.findall(r"--([\w-]+):\s*([^;]+);", text))
    colors = {}
    for name, value in v.items():
        if name.startswith("color-") and value != "initial":
            m = re.fullmatch(r"light-dark\((.+)\)", value.strip())
            light, dark = re.split(r",\s*(?![^(]*\))", m.group(1)) if m else (value, value)
            colors[name[len("color-"):]] = (norm_color(light), norm_color(dark))
    texts = {}
    for name, value in v.items():
        m = re.fullmatch(r"text-([\w-]+)", name)
        if m and "--" not in name and value != "initial":
            n = m.group(1)
            texts[n] = (px(value), px(v.get(f"text-{n}--line-height", "")), float(v.get(f"text-{n}--font-weight", 0)))
    radii = {n[len("radius-"):]: px(val) for n, val in v.items() if n.startswith("radius-") and val != "initial"}
    shadows = {}
    for n, val in v.items():
        if n.startswith("shadow-") and val != "initial":
            # 다크는 그림자 대신 transparent. 라이트 값만 꺼낸다
            m = re.search(r"light-dark\(([^,]+\([^)]*\)|[^,]+),\s*([^)]+)\)", val)
            light = val.replace(m.group(0), m.group(1)) if m else val
            dark_none = bool(m) and m.group(2).strip() == "transparent"
            shadows[n[len("shadow-"):]] = (norm_shadow(light), dark_none)
    durations = {n[len("duration-"):]: px(val) for n, val in v.items() if n.startswith("duration-")}
    return colors, texts, radii, shadows, durations


def read_sample(path):
    text = open(path, encoding="utf-8").read()
    t = re.search(r"const T = \{(.*?)\n\};", text, re.S).group(1)
    light = dict(re.findall(r'"?([\w-]+)"?:\s*"([^"]+)"', re.search(r"light:\s*\{(.*?)\}", t, re.S).group(1)))
    dark = dict(re.findall(r'"?([\w-]+)"?:\s*"([^"]+)"', re.search(r"dark:\s*\{(.*?)\}", t, re.S).group(1)))
    c = re.search(r"const CAT = \{(.*?)\n\};", text, re.S).group(1)
    cat_light = dict(re.findall(r'([가-힣]+):\s*"([^"]+)"', re.search(r"light:\s*\{(.*?)\}", c, re.S).group(1)))
    cat_dark = dict(re.findall(r'([가-힣]+):\s*"([^"]+)"', re.search(r"dark:\s*\{(.*?)\}", c, re.S).group(1)))
    return light, dark, cat_light, cat_dark


def fmt(label, value):
    """문서 표기에 가깝게: 색 '라이트 #fff · 다크 #000', 크기 '20/28/700'."""
    if label == "색":
        return f"라이트 {value[0]} · 다크 {value[1]}"
    if label == "크기":
        return "/".join(f"{x:g}" for x in value)
    if label == "그림자":
        return value[0] + ("" if value[1] else " (다크에 그림자 남음)")
    return f"{value:g}"


def compare(problems, where, label, doc, actual, prefix=""):
    for name in sorted(doc.keys() - actual.keys()):
        problems.append(f"[{where}] {label} {prefix}{name}: 없음")
    for name in sorted(actual.keys() - doc.keys()):
        problems.append(f"[{where}] {label} {prefix}{name}: 문서에 없음")
    for name in sorted(doc.keys() & actual.keys()):
        if doc[name] != actual[name]:
            problems.append(
                f"[{where}] {label} {prefix}{name}: 문서 {fmt(label, doc[name])}, 실제 {fmt(label, actual[name])}"
            )


def main():
    doc_path = sorted(glob.glob("docs/02-screens/*-design-tokens.md"))[0]
    sample_path = sorted(glob.glob("docs/02-screens/*-design-tokens.html"))[0]
    data_doc = sorted(glob.glob(DATA_DOC_GLOB))[0]
    colors, cats, texts, radii, shadows, durations = read_doc(doc_path, data_doc)
    problems = []

    css_colors, css_texts, css_radii, css_shadows, css_durations = read_css(CSS_PATH)
    compare(problems, CSS_PATH, "색", {**colors, **cats}, css_colors)
    compare(problems, CSS_PATH, "크기", texts, css_texts)
    compare(problems, CSS_PATH, "모서리", radii, css_radii, "radius-")
    compare(problems, CSS_PATH, "그림자", {n: (s, True) for n, s in shadows.items()}, css_shadows, "shadow-")
    compare(problems, CSS_PATH, "움직임", durations, css_durations, "duration-")

    light, dark, cat_light, cat_dark = read_sample(sample_path)
    sample_colors = {n: (norm_color(light[n]), norm_color(dark.get(n, ""))) for n in light if n in colors}
    compare(problems, sample_path, "색", colors, sample_colors)
    korean = {f"cat-{k}": name for name, k in ((r[1], unquote(r[0]).lower()) for r in table_rows(section(open(data_doc, encoding="utf-8").read(), "### 4-4.")))}
    sample_cats = {k: (norm_color(cat_light.get(name, "")), norm_color(cat_dark.get(name, ""))) for k, name in korean.items()}
    compare(problems, sample_path, "색", cats, sample_cats)
    sample_shadows = {n[len("shadow-"):]: (norm_shadow(light[n]), dark.get(n) == "none") for n in light if n.startswith("shadow-")}
    compare(problems, sample_path, "그림자", {n: (s, True) for n, s in shadows.items()}, sample_shadows, "shadow-")

    for problem in problems:
        print(problem)
    print(f"점검: {doc_path} ↔ {CSS_PATH}, {sample_path}")
    print("ALL OK" if not problems else f"문제 {len(problems)}건")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
