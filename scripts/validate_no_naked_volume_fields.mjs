import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const SCAN_TARGETS = [
  { root: "data/global_resource_atlas", extensions: new Set([".json"]) },
  { root: "app", extensions: new Set([".tsx"]) },
  { root: "components", extensions: new Set([".tsx"]) },
  { root: "core", extensions: new Set([".ts"]) }
];

const FORBIDDEN_TOKENS = ["surgeryVolume", "patientVolume", "annualPatients", "annualSurgeries"];
// Zero-tolerance guardrail: scanned product files may not include these tokens
// in fields, identifiers, string literals, or comments. Use VolumeMetric instead.
const TOKEN_PATTERN = new RegExp(`(^|[^A-Za-z0-9_$])(${FORBIDDEN_TOKENS.join("|")})(?![A-Za-z0-9_$])`, "g");

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function collectFiles(root, extensions) {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, extensions)));
      continue;
    }
    if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function lineColumnForIndex(text, index) {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: lines.at(-1).length + 1
  };
}

async function findViolations(filePath) {
  const text = await readFile(filePath, "utf8");
  const violations = [];

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const tokenStart = match.index + match[1].length;
    const { line, column } = lineColumnForIndex(text, tokenStart);
    violations.push({ filePath, token: match[2], line, column });
  }

  return violations;
}

const files = (
  await Promise.all(SCAN_TARGETS.map((target) => collectFiles(target.root, target.extensions)))
).flat();

const violations = (await Promise.all(files.map(findViolations))).flat();

if (violations.length > 0) {
  console.error("Naked volume field guardrail failed:");
  for (const violation of violations) {
    console.error(`- ${violation.filePath}:${violation.line}:${violation.column} ${violation.token}`);
  }
  process.exit(1);
}

console.log(`naked volume field guardrail passed (${files.length} files scanned)`);
