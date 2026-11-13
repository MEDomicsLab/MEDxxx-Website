import { homePage, site, theme } from "./content.js";
import { resolveHref } from "./links.js";
import { plain } from "./text.js";
import { fill } from "./tokens.js";

const { seo, brand } = site;

export const absolute = (path) => new URL(path, seo.siteUrl).href;

export const canonicalUrl = (path) => absolute(path);

export const pageTitle = (page) => plain(fill(seo.titleTemplate).replace("%s", fill(page.title)));

export const pageDescription = (page) => plain(page.description ?? seo.description);

function structuredData(page) {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${absolute("/")}#website`,
      name: seo.siteName,
      url: absolute("/"),
    },
  ];
  if (seo.application && page.path === "/") {
    graph.push({
      "@type": "SoftwareApplication",
      name: brand.name,
      description: pageDescription(page),
      url: absolute("/"),
      image: absolute(seo.image.src),
      softwareVersion: brand.version,
      applicationCategory: seo.application.category,
      operatingSystem: seo.application.operatingSystem,
      ...(seo.application.offer && { offers: { "@type": "Offer", ...seo.application.offer } }),
      ...(seo.application.codeRepository && {
        sameAs: [resolveHref(seo.application.codeRepository)],
      }),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function headTags(page) {
  const title = pageTitle(page);
  const description = pageDescription(page);
  const url = canonicalUrl(page.path);
  const image = absolute(seo.image.src);
  const meta = (attrs) => ({ tag: "meta", attrs });
  const themeColors =
    theme.mode === "system"
      ? ["dark", "light"].map((mode) =>
          meta({
            name: "theme-color",
            media: `(prefers-color-scheme: ${mode})`,
            content: theme[mode].bg,
          })
        )
      : [
          meta({
            name: "theme-color",
            content: theme[theme.mode === "light" ? "light" : "dark"].bg,
          }),
        ];
  return [
    { tag: "title", children: title },
    meta({ name: "description", content: description }),
    ...(page.noindex ? [meta({ name: "robots", content: "noindex, follow" })] : []),
    { tag: "link", attrs: { rel: "canonical", href: url } },
    ...themeColors,
    meta({ property: "og:type", content: "website" }),
    meta({ property: "og:site_name", content: seo.siteName }),
    meta({ property: "og:locale", content: seo.locale }),
    meta({ property: "og:url", content: url }),
    meta({ property: "og:title", content: title }),
    meta({ property: "og:description", content: description }),
    meta({ property: "og:image", content: image }),
    meta({ property: "og:image:width", content: String(seo.image.width) }),
    meta({ property: "og:image:height", content: String(seo.image.height) }),
    meta({ property: "og:image:alt", content: plain(seo.image.alt) }),
    meta({ name: "twitter:card", content: "summary_large_image" }),
    meta({ name: "twitter:title", content: title }),
    meta({ name: "twitter:description", content: description }),
    meta({ name: "twitter:image", content: image }),
    {
      tag: "script",
      attrs: { type: "application/ld+json" },
      children: JSON.stringify(structuredData(page)),
    },
  ];
}

const escape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function renderHead(tags) {
  return tags
    .map(({ tag, attrs = {}, children }) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => ` ${key}="${escape(value)}"`)
        .join("");
      if (tag === "meta" || tag === "link") return `<${tag} data-seo${attributes} />`;
      const body = tag === "script" ? children.replace(/</g, "\\u003c") : escape(children);
      return `<${tag} data-seo${attributes}>${body}</${tag}>`;
    })
    .join("\n    ");
}

export function applyHead(tags) {
  document.head.querySelectorAll("[data-seo]").forEach((node) => node.remove());
  for (const { tag, attrs = {}, children } of tags) {
    if (tag === "title") {
      document.title = children;
      continue;
    }
    const node = document.createElement(tag);
    node.setAttribute("data-seo", "");
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (children) node.textContent = children;
    document.head.append(node);
  }
}

export function siteFiles(today = new Date().toISOString().slice(0, 10)) {
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${canonicalUrl(homePage.path)}</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>`,
    "</urlset>",
    "",
  ].join("\n");
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absolute("/sitemap.xml")}\n`;
  return { "sitemap.xml": sitemap, "robots.txt": robots };
}
