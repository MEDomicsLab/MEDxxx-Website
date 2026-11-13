import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = fileURLToPath(new URL("..", import.meta.url));
const escape = (key) => String(key).replaceAll("~", "~0").replaceAll("/", "~1");

function locations(source) {
  const tokens = [...source.matchAll(/"(?:\\.|[^"\\])*"|[{}[\]:,]|[^\s{}[\]:,]+/g)];
  const offsets = new Map();
  let cursor = 0;
  const visit = (pointer) => {
    const token = tokens[cursor++];
    if (!offsets.has(pointer)) offsets.set(pointer, token.index);
    if (token[0] === "{") {
      while (tokens[cursor][0] !== "}") {
        const key = tokens[cursor++];
        const child = `${pointer}/${escape(JSON.parse(key[0]))}`;
        offsets.set(child, key.index);
        cursor++;
        visit(child);
        if (tokens[cursor][0] === ",") cursor++;
      }
      cursor++;
    } else if (token[0] === "[") {
      let index = 0;
      while (tokens[cursor][0] !== "]") {
        visit(`${pointer}/${index++}`);
        if (tokens[cursor][0] === ",") cursor++;
      }
      cursor++;
    }
  };
  visit("");
  return offsets;
}

export async function findDeprecations(directory = root) {
  const data = path.join(directory, "src/data");
  const schemas = path.join(data, "_shared/schemas");
  const warnings = [];
  let detected;
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true, strict: false });
  addFormats(ajv);
  ajv.removeKeyword("deprecated");
  ajv.addKeyword({
    keyword: "deprecated",
    validate(deprecated, value, schema, context) {
      if (deprecated && (!schema.enum || schema.enum.includes(value))) {
        detected.set(context.instancePath, schema.description);
      }
      return true;
    },
    errors: false,
  });
  const entries = await fs.readdir(schemas, { recursive: true });
  for (const entry of entries.filter((entry) => entry.endsWith(".json"))) {
    ajv.addSchema(JSON.parse(await fs.readFile(path.join(schemas, entry), "utf8")), entry);
  }
  const files = [
    "site.json",
    ...(await fs.readdir(path.join(data, "sections"))).map((name) => `sections/${name}`),
  ];
  for (const file of files.filter((file) => file.endsWith(".json"))) {
    const schema = ajv.getSchema(file.replace(/\.json$/, ".schema.json"));
    if (!schema) continue;
    const source = await fs.readFile(path.join(data, file), "utf8");
    let json;
    try {
      json = JSON.parse(source);
    } catch {
      continue;
    }
    detected = new Map();
    schema(json);
    const offsets = locations(source);
    for (const [pointer, description] of detected) {
      const line = source.slice(0, offsets.get(pointer) ?? 0).split("\n").length;
      warnings.push({ file: `src/data/${file}`, line, pointer, description });
    }
  }
  return warnings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

export async function reportDeprecations(directory = root) {
  const warnings = await findDeprecations(directory);
  for (const { file, line, pointer, description } of warnings) {
    console.warn(
      `⚠️ Detected ${pointer || file} at line ${line} of ${file}: deprecated. ${description ?? ""} Remove it in the long term; existing JSON remains compatible.`
    );
  }
  return warnings;
}

const deferred =
  process.env.npm_lifecycle_event === "postinstall" &&
  process.env.MEDXXX_DEFER_DEPRECATIONS === "1";

if (
  !deferred &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await reportDeprecations();
}
