#!/usr/bin/env node
import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const PATHS_TO_DIR = ["packages", "packages/utils"];

const BUMP_BY_TYPE = {
  feat: "minor",
  fix: "patch",
  perf: "patch",
  refactor: "patch",
};

const CHANGESET_DIR = path.resolve(".changeset");
const SUBJECT_RE =
  /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<desc>.+)$/;

function loadScopeToPackage() {
  const map = {};

  PATHS_TO_DIR.forEach((dirPath) => {
    const packagesDir = path.resolve(dirPath);
    if (!existsSync(packagesDir)) return map;

    for (const dir of readdirSync(packagesDir, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const pkgPath = path.join(packagesDir, dir.name, "package.json");
      if (!existsSync(pkgPath)) continue;

      const { name } = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (!name) continue;

      const scope = dir.name.replace(/^medusa-/, "");
      map[scope] = name;
    }
  });
  return map;
}

function getBaseRef() {
  try {
    const hash = execSync(
      'git log --format=%H --grep="^chore: release packages$" -1',
      { encoding: "utf8" }
    ).trim();
    if (hash) return hash;
  } catch {}

  try {
    return execSync("git describe --tags --abbrev=0", {
      encoding: "utf8",
    }).trim();
  } catch {}

  return null;
}

function getCommitsSince(ref) {
  const range = ref ? `${ref}..HEAD` : "HEAD";
  const raw = execSync(
    `git log ${range} --format="---COMMIT---%n%H%n%s%n%b%n---END---"`,
    { encoding: "utf8" }
  );
  return raw
    .split("---COMMIT---")
    .filter((b) => b.includes("---END---"))
    .map((block) => {
      const lines = block.replace("---END---", "").trim().split("\n");
      const [hash, subject, ...bodyLines] = lines;
      const body = bodyLines.join("\n").trim();
      const match = subject?.match(SUBJECT_RE);
      if (!match) return null;

      const { type, scope, breaking, desc } = match.groups;
      const hasBreakingFooter = /^BREAKING CHANGE:/m.test(body);
      console.log(scope);
      return {
        hash: hash?.trim(),
        type: type?.trim(),
        scope: scope?.trim() ?? null,
        desc: desc?.trim(),
        body: body || null,
        isBreaking: !!breaking || hasBreakingFooter,
        breakingNote: hasBreakingFooter
          ? body.match(/^BREAKING CHANGE:\s*(.+)/m)?.[1]
          : null,
      };
    })
    .filter(Boolean);
}

function getProcessedHashes() {
  const hashes = new Set();
  if (!existsSync(CHANGESET_DIR)) return hashes;
  for (const file of readdirSync(CHANGESET_DIR)) {
    const m = file.match(/^auto-([0-9a-f]{7})\.md$/);
    if (m) hashes.add(m[1]);
  }
  return hashes;
}

function main() {
  if (!existsSync(CHANGESET_DIR)) mkdirSync(CHANGESET_DIR, { recursive: true });

  const scopeToPackage = loadScopeToPackage();
  const baseRef = getBaseRef();
  const commits = getCommitsSince(baseRef);
  const processed = getProcessedHashes();

  console.log(
    `Base: ${baseRef ?? "(all history)"}, commits: ${
      commits.length
    }, processed: ${processed.size}`
  );

  let generated = 0;

  for (const commit of commits) {
    const shortHash = commit.hash?.slice(0, 7) ?? "";
    if (processed.has(shortHash)) continue;

    const bump = commit.isBreaking
      ? "major"
      : BUMP_BY_TYPE[commit.type] ?? null;
    if (!bump) continue;

    const packageName = commit.scope ? scopeToPackage[commit.scope] : null;
    if (!packageName) {
      console.log(`  skip: unknown scope "${commit.scope}" — ${commit.desc}`);
      continue;
    }

    const content = [
      "---",
      `"${packageName}": ${bump}`,
      "---",
      "",
      `commit: ${commit.hash}`,
      commit.desc,
      ...(commit.body ? ["", commit.body] : []),
      ...(commit.breakingNote
        ? ["", `BREAKING CHANGE: ${commit.breakingNote}`]
        : []),
      "",
    ].join("\n");

    const filename = path.join(CHANGESET_DIR, `auto-${shortHash}.md`);
    writeFileSync(filename, content, "utf8");
    console.log(`  ✔ ${filename} [${packageName}: ${bump}]`);
    generated++;
  }

  console.log(`Generated ${generated} changeset(s).`);
}

main();
