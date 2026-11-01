#!/usr/bin/env python3
"""와이어프레임 점검 스크립트.

사용법:
    python3 scripts/check-wireframes.py [와이어프레임.html ...]

인자가 없으면 docs/02-screens/*-wireframes.html 전부를 점검한다.
규칙은 docs/02-screens/README.md 참고. 문제가 있으면 종료 코드 1.
"""

import datetime
import glob
import html
import re
import sys

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
WEEKDAYS = "월화수목금토일"
# 프레임 안에 있으면 설명문·생략 표시로 의심되는 문구
ANNOTATION_PATTERNS = [
    r"^\(",  # 괄호로 시작하는 문장
    r"꼴",  # "CM ②와 같은 꼴"
    r"생략",
    r"…",
    r"화면 내용",
    r"\bsafe area\b",
    r"(?<!니)다\.?$",  # 한다체 문장(명세 문체). UI 문구는 합니다체라 "니다"로 끝난다
]


def strip_tags(text):
    return html.unescape(re.sub(r"<[^>]+>", " ", text))


def remove_allowed(fragment):
    """빗금(.omit)과 프레임 밖 설명(.fr-note) 안의 내용은 점검에서 뺀다."""
    for cls in ("omit", "fr-note"):
        fragment = re.sub(
            rf'<(div|span) class="{cls}"[^>]*>.*?</\1>', " ", fragment, flags=re.S
        )
    return fragment


def check_file(path):
    src = open(path, encoding="utf-8").read()
    problems = []

    blocks = re.split(r'<div class="screen" id="', src)[1:]
    for block in blocks:
        bid = block.split('"')[0]
        block = block.split("<section", 1)[0]  # 마지막 블록 뒤 부록·변경 이력 제외
        canvas, _, spec = block.partition('<table class="spec">')

        # 1. 콜아웃 번호 = 명세표 번호 (1부터 빠짐없이)
        callouts = sorted({int(n) for n in re.findall(r'class="c">(\d+)</i>', canvas)})
        rows = [int(n) for n in re.findall(r'<tr><td><i class="c">(\d+)</i></td>', spec)]
        if rows != list(range(1, len(rows) + 1)):
            problems.append(f"[{bid}] 명세표 번호가 1부터 이어지지 않는다: {rows}")
        if callouts != sorted(set(rows)):
            problems.append(f"[{bid}] 콜아웃 {callouts} 과 명세표 {rows} 가 다르다")

        frames = re.split(r'<div class="fr"><div class="fr-l">', canvas)[1:]
        labels = []
        for frame in frames:
            label_html, _, body = frame.partition("</div>")
            label = strip_tags(label_html).strip()
            labels.append(label)

            # 2. 프레임 안 설명문·생략 표시 (빗금·설명 캡션 밖)
            inner = remove_allowed(body)
            for text in re.split(r"<[^>]+>", inner):
                text = html.unescape(text).strip()
                if not text:
                    continue
                for pattern in ANNOTATION_PATTERNS:
                    if re.search(pattern, text):
                        problems.append(f"[{bid}] {label[:24]}: 프레임 안 설명·생략 의심 → {text!r}")
                        break

            # 3. 스켈레톤 모양은 로딩 프레임에서만
            if "LOADING" not in label and 'class="skel"' in body:
                problems.append(f"[{bid}] {label[:24]}: 로딩 프레임이 아닌데 스켈레톤(.skel)을 쓴다 (생략은 .omit)")

        # 4. 명세표가 가리키는 프레임 번호(①②…)가 실제 있는지
        frame_marks = {label[label.find(c)] for label in labels for c in CIRCLED if c in label[:12]}
        # "CG ⑨", "CM ⑤·⑥", "SC-04 ⑦"처럼 다른 블록을 가리키는 참조는 뺀다
        own_refs = re.sub(
            rf"(CG|CM|RT|SC-\d\d)\s*[{CIRCLED}](\s*[·,]\s*[{CIRCLED}])*", " ", strip_tags(spec)
        )
        for mark in set(re.findall(f"[{CIRCLED}]", own_refs)):
            if frame_marks and mark not in frame_marks:
                problems.append(f"[{bid}] 명세표가 없는 프레임 {mark}을 가리킨다")

    problems += check_weekdays(src, path)
    return problems


def check_weekdays(text, path):
    """'2026년 10월 18일 (일)' 꼴 날짜의 요일이 맞는지."""
    problems = []
    for y, m, d, w in re.findall(r"(\d{4})년 (\d{1,2})월 (\d{1,2})일 \(([월화수목금토일])\)", text):
        try:
            actual = WEEKDAYS[datetime.date(int(y), int(m), int(d)).weekday()]
        except ValueError:
            problems.append(f"[{path}] 없는 날짜: {y}-{m}-{d}")
            continue
        if actual != w:
            problems.append(f"[{path}] 요일 틀림: {y}년 {m}월 {d}일 ({w}) → ({actual})")
    return problems


def main(argv):
    paths = argv[1:] or sorted(glob.glob("docs/02-screens/*-wireframes.html"))
    md_paths = sorted(glob.glob("docs/02-screens/*.md"))
    all_problems = []
    for path in paths:
        all_problems += check_file(path)
    for path in md_paths:
        all_problems += check_weekdays(open(path, encoding="utf-8").read(), path)

    for problem in all_problems:
        print(problem)
    print(f"점검: {', '.join(paths)} (+ 요일: {len(md_paths)}개 md)")
    print("ALL OK" if not all_problems else f"문제 {len(all_problems)}건")
    return 1 if all_problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
