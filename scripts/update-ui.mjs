import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ref = process.argv[2] ?? "main";
const { repository } = JSON.parse(readFileSync("package.json", "utf8")).template;
const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const run = (command, ...args) => execFileSync(command, args, { stdio: "inherit" });
const lines = (text) => text.split("\n").filter(Boolean);

run("git", "fetch", "--quiet", "--depth=1", repository, ref);
const { ui } = JSON.parse(git("show", "FETCH_HEAD:package.json")).template;
const files = lines(
  git("ls-files", "--", ...ui) + git("ls-tree", "-r", "--name-only", "FETCH_HEAD", "--", ...ui)
);
const paths = ui.filter((path) =>
  files.some((file) => file === path || file.startsWith(`${path}/`))
);

const pending = git("status", "--short", "--", ...paths);
if (pending) {
  console.error(`Commit or stash these UI changes first:\n${pending}`);
  process.exit(1);
}

run("git", "restore", "--source=FETCH_HEAD", "--staged", "--worktree", "--", ...paths);
const changed = lines(git("diff", "--staged", "--name-only", "--", ...paths));
if (!changed.length) {
  console.log(`The UI already matches ${repository} (${ref}).`);
} else {
  if (changed.includes("package-lock.json")) execSync("npm ci", { stdio: "inherit" });
  run("git", "diff", "--staged", "--stat", "--", ...paths);
  console.log(`\nUI updated from ${repository} (${ref}). Run npm run check, then commit.`);
}
run(process.execPath, "scripts/deprecations.mjs");
