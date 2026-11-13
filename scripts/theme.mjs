import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ID = "virtual:theme.css";
const RESOLVED = `\0${ID}`;
const dataFile = (name) => fileURLToPath(new URL(`../src/data/${name}.json`, import.meta.url));
const themeFile = dataFile("_shared/theme");
const siteFile = dataFile("site");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const block = (selector, lines) => `${selector} {\n${lines.map((l) => `  ${l}`).join("\n")}\n}`;
const colorLines = (colors = {}, mode = "light") => [
  `--show-light: ${mode === "light" ? "block" : "none"};`,
  `--show-dark: ${mode === "dark" ? "block" : "none"};`,
  `--invert: ${mode === "dark" ? 1 : 0};`,
  ...Object.entries(colors).map(([key, value]) => `--color-${kebab(key)}: ${value};`),
];

export function themeCss(theme) {
  const mode = theme.mode === "light" ? "light" : "dark";
  const other = mode === "dark" ? "light" : "dark";
  const { accent = {}, fonts = {} } = theme;
  const base = [
    `color-scheme: ${mode};`,
    ...Object.entries(fonts).map(([key, value]) => `--font-${kebab(key)}: ${value};`),
    `--accent-color: ${accent.color};`,
    `--accent-tint: ${accent.tint};`,
    `--accent-texture: url("${accent.texture}");`,
    `--accent-paper: url("${accent.paper}");`,
    ...colorLines(theme[mode], mode),
  ];
  const css = [
    ...theme.fontFaces.map((face) =>
      block("@font-face", [
        `font-family: ${JSON.stringify(face.family)};`,
        `src: url(${JSON.stringify(face.src)}) format(${JSON.stringify(face.format)});`,
        `font-weight: ${face.weight};`,
        `font-style: ${face.style};`,
        "font-display: swap;",
      ])
    ),
    block(":root", base),
    block(`:root[data-theme="${mode}"]`, [
      `color-scheme: ${mode};`,
      ...colorLines(theme[mode], mode),
    ]),
    block(`:root[data-theme="${other}"]`, [
      `color-scheme: ${other};`,
      ...colorLines(theme[other], other),
    ]),
  ];
  if (theme.mode === "system") {
    css.push(
      `@media (prefers-color-scheme: light) {\n${block(':root:not([data-theme="dark"])', [
        "color-scheme: light;",
        ...colorLines(theme.light, "light"),
      ])}\n}`
    );
  }
  return `${css.join("\n\n")}\n`;
}

const storageKey = (site, suffix) =>
  `${site.brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${suffix}`;

export function themeScript(site) {
  const banner = site.banner ?? {};
  const theme = JSON.stringify(storageKey(site, "theme"));
  const dismissed = JSON.stringify(storageKey(site, "banner"));
  const off = banner.enabled ? "" : 'd.dataset.notice="off";';
  return [
    `(function(){var d=document.documentElement;d.classList.add("js");${off}try{`,
    `var t=localStorage.getItem(${theme});if(t==="light"||t==="dark")d.dataset.theme=t;`,
    `if(localStorage.getItem(${dismissed})===${JSON.stringify(banner.id ?? "")})d.dataset.notice="off";`,
    `}catch(e){}})();`,
  ].join("");
}

export default function themePlugin() {
  return {
    name: "medxxx-theme",
    resolveId: (id) => (id === ID ? RESOLVED : null),
    load(id) {
      if (id !== RESOLVED) return null;
      this.addWatchFile(themeFile);
      return themeCss(read(themeFile));
    },
    transformIndexHtml(html) {
      const site = read(siteFile);
      const theme = read(themeFile);
      const fonts = theme.preload ?? [];
      const fontType = (src) => {
        const format = theme.fontFaces.find((face) => face.src === src)?.format;
        return {
          opentype: "font/otf",
          truetype: "font/ttf",
          woff: "font/woff",
          woff2: "font/woff2",
        }[format];
      };
      return {
        html: html.replace("<html>", `<html lang="${site.seo.locale.replaceAll("_", "-")}">`),
        tags: [
          { tag: "script", children: themeScript(site), injectTo: "head-prepend" },
          ...fonts.map((href) => ({
            tag: "link",
            attrs: { rel: "preload", href, as: "font", type: fontType(href), crossorigin: "" },
            injectTo: "head",
          })),
          {
            tag: "link",
            attrs: { rel: "icon", href: site.brand.favicon },
            injectTo: "head",
          },
          {
            tag: "link",
            attrs: { rel: "apple-touch-icon", href: site.brand.touchIcon },
            injectTo: "head",
          },
        ],
      };
    },
    handleHotUpdate({ file, server, modules }) {
      if (path.resolve(file) === siteFile) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
      if (path.resolve(file) !== themeFile) return undefined;
      const css = server.moduleGraph.getModuleById(RESOLVED);
      if (!css) return undefined;
      server.moduleGraph.invalidateModule(css);
      return [...modules, css];
    },
  };
}
