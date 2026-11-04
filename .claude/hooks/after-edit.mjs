// Claude가 Edit·Write로 파일을 고친 직후 실행된다 (PostToolUse).
// 1. 고친 파일을 Prettier로 정리한다 (.prettierignore 대상은 Prettier가 건너뛴다)
// 2. docs/02-screens/**를 고쳤으면 와이어프레임 점검 결과를 Claude에게 돌려준다
// 3. 토큰 문서·견본·globals.css를 고쳤으면 토큰 점검 결과를 Claude에게 돌려준다
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const input = JSON.parse(readFileSync(0, "utf8"));
const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd;
const filePath = input.tool_input?.file_path;
if (!filePath) process.exit(0);

const relative = path.relative(root, path.resolve(root, filePath));
if (relative.startsWith("..")) process.exit(0);

const run = (command, args) =>
  spawnSync(command, args, { cwd: root, encoding: "utf8" });

const notes = [];

const prettier = run(path.join(root, "node_modules/.bin/prettier"), [
  "--write",
  "--ignore-unknown",
  "--log-level",
  "warn",
  relative,
]);
if (prettier.status !== 0) {
  notes.push(`Prettier 실패 (${relative}):\n${prettier.stderr.trim()}`);
}

let failed = false;
const check = (name, script) => {
  const result = run("python3", [script]);
  const output = `${result.stdout}${result.stderr}`.trim();
  const ok = result.status === 0;
  failed ||= !ok;
  notes.push(`${name} ${ok ? "통과" : "실패"}:\n${output}`);
};
if (relative.startsWith(`docs${path.sep}02-screens${path.sep}`)) {
  check("와이어프레임 점검", "scripts/check-wireframes.py");
}
if (
  /-design-tokens\.(md|html)$/.test(relative) ||
  relative === path.join("src", "app", "globals.css")
) {
  check("토큰 점검", "scripts/check-tokens.py");
}

if (notes.length === 0) process.exit(0);

const message = notes.join("\n\n");
console.log(
  JSON.stringify(
    failed
      ? { decision: "block", reason: message }
      : {
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: message,
          },
        },
  ),
);
