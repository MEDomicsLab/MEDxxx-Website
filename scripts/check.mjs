import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = fileURLToPath(new URL("..", import.meta.url));
const data = path.join(root, "src/data");
const shared = path.join(data, "_shared");
const schemas = path.join(shared, "schemas");
const relative = (file) => path.relative(root, file);
const read = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
const exists = (file) =>
  fs.access(file).then(
    () => true,
    () => false
  );

const problems = [];
const report = (file, message) => problems.push(`${relative(file)}: ${message}`);

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true, strict: false });
addFormats(ajv);
for (const name of await fs.readdir(schemas)) {
  if (name.endsWith(".json")) ajv.addSchema(await read(path.join(schemas, name)), name);
}
const sectionNames = [];
const deprecatedSections = [];
for (const name of await fs.readdir(path.join(schemas, "sections"))) {
  const schema = await read(path.join(schemas, "sections", name));
  ajv.addSchema(schema, `sections/${name}`);
  const names = schema.deprecated ? deprecatedSections : sectionNames;
  names.push(name.replace(/\.schema\.json$/, ""));
}

async function validate(file, schema) {
  let json;
  try {
    json = await read(file);
  } catch (error) {
    report(file, `is not valid JSON (${error.message})`);
    return null;
  }
  const check = ajv.getSchema(schema);
  if (!check(json)) {
    for (const error of check.errors) {
      const where = error.instancePath || "(root)";
      const extra = error.params?.additionalProperty ? ` "${error.params.additionalProperty}"` : "";
      report(file, `${where} ${error.message}${extra}`);
    }
  }
  return json;
}

const site = await validate(path.join(data, "site.json"), "site.schema.json");
const theme = await validate(path.join(shared, "theme.json"), "theme.schema.json");
const ui = await validate(path.join(shared, "ui.json"), "ui.schema.json");

const sectionDir = path.join(data, "sections");
const sections = {};
for (const name of sectionNames) {
  const file = path.join(sectionDir, `${name}.json`);
  if (await exists(file)) sections[name] = await validate(file, `sections/${name}.schema.json`);
  else report(file, "is missing, and the page needs it");
}
for (const name of await fs.readdir(sectionDir)) {
  if (![...sectionNames, ...deprecatedSections].includes(name.replace(/\.json$/, ""))) {
    report(path.join(sectionDir, name), `is not used: the page shows ${sectionNames.join(", ")}`);
  }
}

const links = site?.links ?? {};
const local = new Set();

function scan(value, file, trail = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scan(item, file, `${trail}/${index}`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) scan(item, file, `${trail}/${key}`);
    return;
  }
  if (typeof value !== "string") return;
  for (const match of value.matchAll(/(?:^|\()@([A-Za-z0-9_-]+)/g)) {
    if (!(match[1] in links))
      report(file, `${trail} points to @${match[1]}, which is not in site.json → links`);
  }
  if (/^\/(images|textures|fonts|docs)\/|^\/[\w-]+\.(png|ico|svg|webp)$/.test(value))
    local.add(`${value}\u0000${file}\u0000${trail}`);
}

if (site) scan(site, path.join(data, "site.json"));
if (theme) scan(theme, path.join(shared, "theme.json"));
if (ui) scan(ui, path.join(shared, "ui.json"));
for (const [name, json] of Object.entries(sections)) {
  if (json) scan(json, path.join(sectionDir, `${name}.json`));
}

for (const entry of local) {
  const [asset, file, trail] = entry.split("\u0000");
  if (!(await exists(path.join(root, "public", asset)))) {
    report(file, `${trail} uses ${asset}, which is missing from public/ (run npm run assets?)`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? "s" : ""} found:\n`);
  problems.forEach((problem) => console.error(`  • ${problem}`));
  console.error("");
  process.exit(1);
}

console.log(
  `content ok: ${Object.keys(sections).length} sections, ${Object.keys(links).length} links, ${local.size} local assets`
);
