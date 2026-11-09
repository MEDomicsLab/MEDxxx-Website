<div align="center">
   <p align="center">
      <br>
      <a href="https://www.figma.com/design/zwqoYBu3y8ETmrjNTJbYKV/Branding?node-id=4452-316">
         <img src="docs/assets/brand/medxxx-website-blue.webp" alt="MEDxxx-Website" width="240">
      </a>
   </p>
   <h1 align="center">MEDxxx-Website</h1>
   <h4 align="center">
      The website template for MEDomicsLab apps.
   </h4>
</div>

## <a id="make-your-website"></a><img src="docs/assets/icons/lucide/rocket.svg" width="32" alt="" /> Make your website

Required Node.js 20+.

1. **Run it:** `npm ci`, then `npm run dev` ([localhost:5176](http://localhost:5176)).
2. **Name your app** in [`src/data/site.json`](./src/data/site.json): name, version, logos, links, menu and footer. See [App settings](#app-settings).
3. **Write the seven sections**, one JSON file each, in [`src/data/sections/`](./src/data/sections). See [The page](#the-page).
4. **Add your screenshots and logos** to [`assets/`](./assets), then `npm run assets`. See [Images](#images).
5. **Check and build:** `npm run check`, then `npm run build`, and deploy `dist/`.

You only edit `site.json` and `sections/`:

```
src/data/
├── site.json   your app: name, links, menu, footer, SEO
├── sections/   the seven sections of the page
└── _shared/    the MEDomicsLab look, interface words and schemas: leave as is
```

## <a id="the-page"></a><img src="docs/assets/icons/lucide/house.svg" width="32" alt="" /> The page

Seven fixed sections, in this order.

| Section     | File                                                 | What it shows                                   |
| ----------- | ---------------------------------------------------- | ----------------------------------------------- |
| 1. Hero     | [`hero.json`](./src/data/sections/hero.json)         | Title, buttons, screenshots and partner logos   |
| 2. Discover | [`discover.json`](./src/data/sections/discover.json) | An introduction video beside a short list       |
| 3. Paper    | [`paper.json`](./src/data/sections/paper.json)       | Your publications in tabs, with their PDFs      |
| 4. Features | [`features.json`](./src/data/sections/features.json) | Screenshots that change as visitors scroll      |
| 5. Steps    | [`steps.json`](./src/data/sections/steps.json)       | How your app works, step by step                |
| 6. Download | [`download.json`](./src/data/sections/download.json) | Installers for each system and troubleshooting  |
| 7. Learn    | [`learn.json`](./src/data/sections/learn.json)       | Video playlists, install commands and tutorials |

Every section has a `title`, a `text` and an `id` (its anchor, such as `/#paper`). All but the hero accept `align`, the layout of the title and its text: `"split"` side by side (default for discover, download and learn) or `"center"` stacked and centred (default for paper, features and steps). The `$schema` line at the top of each file links it to its rules, so VS Code and JetBrains IDEs autocomplete the fields and underline typos.

<details>
<summary><strong>1. Hero</strong></summary>

- `title`: `\n` starts a new line, `*word*` sets the italic accent.
- `actions`: the buttons. See [Links and buttons](#links-and-buttons).
- `media`: the main screenshot, then an optional smaller one floating over it.
- `badges`: up to four short labels around the screenshots.
- `layout`: `"split"` puts the text beside the screenshots, `"center"` above them.
- `expansion`: the animation `duration` in seconds and the `label` below the screenshots.
- `partners`: a `label` and the logos, each with `name`, `logo`, optional `logoDark` (for dark mode) and optional `href`.

Click the screenshots or their label to expand, then click the expanded image to collapse. Enter and Space also work. The split layout expands on large screens; small screens and reduced motion keep the static layout. Scrolling leaves the image still, and the navbar starts hiding as visitors reach it.

```json
"expansion": {
  "duration": 0.6,
  "label": "Expand!"
}
```

The template uses `"label": "Expand!"`. Change the text to customise it. Set `"label": ""` or remove `label` to hide both the text and cursor; the image still expands when clicked.

The label and its cursor hide while expanded. The cursor moves when the image or label is hovered or focused.

</details>

<details>
<summary><strong>2. Discover</strong></summary>

- `video`: a YouTube video (`youtube`: its id) or playlist (`playlist`: its id), with a `title` and a short `caption`. Use `image` instead for a still picture.
- `items`: the list beside it, each with a `title`, a `text` and an optional `href` or `to` that makes it a link.

</details>

<details>
<summary><strong>3. Paper</strong></summary>

`papers` lists your publications in tab order:

```json
{
  "label": "Software paper",
  "title": "Paper title",
  "reference": "arXiv:0000.00000",
  "authors": "Authors",
  "venue": "Subject or journal",
  "abstract": "Abstract.",
  "blocks": [{ "title": "Datasets", "content": "3" }],
  "actions": [{ "label": "Download PDF", "href": "@paperPdf", "variant": "primary" }],
  "pdf": { "src": "@paperPdf", "name": "paper.pdf" }
}
```

`label` is the tab name. `blocks` are optional facts under the abstract. Leave out `pdf` to show text only.

</details>

<details>
<summary><strong>4. Features</strong></summary>

`steps` lists the screenshots in order. Each has a `title`, a `text`, an `image` (see [Images](#images)) and optional `links`.

</details>

<details>
<summary><strong>5. Steps</strong></summary>

- `items`: each step's `title` and `text`. `{count}` in the section title becomes the number of steps.

The first step is selected by default. Hover a row to preview its description; leaving the list returns to the first step. Keyboard users can select with the arrow keys, and touch users can tap a row. On small screens, the description sits below the list.

</details>

<details>
<summary><strong>6. Download</strong></summary>

- `download`: a `title`, a `release` label and the installers in `items`, each with a `label`, an `href`, an optional `file` name and an optional `os` (`windows`, `mac` or `linux`). The visitor's system is highlighted.
- `help`: a troubleshooting `title` and `items`, each with a `title`, a `text` and optional `code`.

Set the version once in `site.json → brand.version`: every `{version}` follows it.

</details>

<details>
<summary><strong>7. Learn</strong></summary>

`tracks` are the columns. Each has a `title`, a short `meta` label, a `text` and one or more of: a `video`, an `install` command (`code`), tutorial `items` (`title`, `text`, `href`) and an `action` button. `linkLabel` sets the text of the item links.

`tabs` splits a column into switchable panels, shown below the column's own content. Each tab has a `label` (the tab name) and the same fields as a column:

```json
"tabs": [
  {
    "label": "Guided Videos",
    "text": "Short introduction.",
    "video": { "youtube": "aqz-KE-bpKQ", "title": "Video title", "caption": "Caption" },
    "action": { "label": "Watch on YouTube", "href": "@playlist", "icon": "youtube" }
  },
  {
    "label": "Proof of Concept",
    "text": "Short introduction.",
    "linkLabel": "Open guide",
    "items": [{ "title": "Step 1", "text": "What it covers.", "href": "@docsApp/guide-1" }],
    "action": { "label": "Start the guide", "href": "@docsApp/guide", "icon": "book" }
  }
]
```

</details>

## <a id="app-settings"></a><img src="docs/assets/icons/lucide/map.svg" width="32" alt="" /> App settings

| To change                                         | Edit                                                 |
| ------------------------------------------------- | ---------------------------------------------------- |
| App name, version, logos and browser-tab icon     | [`site.json`](./src/data/site.json) → `brand`        |
| URLs used in several places                       | `site.json` → `links`                                |
| The announcement above the menu                   | `site.json` → `banner` (`"enabled": false` hides it) |
| The menu, its dropdowns and the buttons beside it | `site.json` → `nav`                                  |
| The footer                                        | `site.json` → `footer`                               |
| Web address, tab titles and search description    | `site.json` → `seo`                                  |

[`_shared/theme.json`](./src/data/_shared/theme.json) (colours, blue paper, fonts) and [`_shared/ui.json`](./src/data/_shared/ui.json) (interface words, 404 page) are the same for every MEDomicsLab site: change them only to change the look.

## <a id="links-and-buttons"></a><img src="docs/assets/icons/lucide/square-pen.svg" width="32" alt="" /> Writing text, links and buttons

| Write                                | To get                                       |
| ------------------------------------ | -------------------------------------------- |
| `{name}`, `{version}`                | `site.json → brand.name` and `brand.version` |
| `**bold**`, `*italic*`, `` `code` `` | Bold, italic and code                        |
| `[label](@docsApp)`                  | A link inside a sentence                     |
| `\n`                                 | A new line                                   |

A link or button is `{ "label": "Get started", "href": "@docsApp" }`. Write a URL once in `site.json → links` and use it anywhere as `@name`, for example `@releases/installer-{version}.exe`. Use `to` instead of `href` for anchors on the page, such as `/#download`.

Buttons also accept `"variant"`: `"primary"` (solid), `"secondary"` (outlined, the default) or `"link"` (underlined), and an `"icon"` such as `"download"` or `"github"`. The icon names are listed in [`common.schema.json`](./src/data/_shared/schemas/common.schema.json).

## <a id="images"></a><img src="docs/assets/icons/lucide/image.svg" width="32" alt="" /> Images

1. Put your files in [`assets/`](./assets):
   - `assets/brand/logo.png` (black logo), `logo-white.png` (white logo) and `icon.png` (browser tab).
   - Screenshots and partner logos anywhere under `assets/images/`.
2. Run `npm run assets`. It writes WebP copies to `public/`, the favicons and the social image (`og.png`).
3. Use the new path in your JSON, with the original size:

   ```json
   {
     "src": "/images/screens/viewer.webp",
     "alt": "What the screenshot shows",
     "width": 1600,
     "height": 1000
   }
   ```

Keep screenshots plain: the site adds the blue paper behind them.

## <a id="updating-the-ui"></a><img src="docs/assets/icons/lucide/refresh-cw.svg" width="32" alt="" /> Updating the UI

```bash
npm run update-ui
```

It copies the latest UI from the template in `package.json → template.repository` (code, styles, `_shared/`, scripts, fonts) and leaves your `site.json`, `sections/` and images alone. Changes come staged: review them, run `npm run check`, then commit. `npm run update-ui -- v1.2.0` pins a tag instead of `main`. The template cuts tags from **Actions → Release** (patch, minor or major), or locally with `npm version minor -m "chore(release): bump version to %s"` and `git push --follow-tags`. Keep your edits outside the paths listed in `template.ui`, or they are overwritten.

## <a id="license"></a><img src="docs/assets/icons/lucide/scale.svg" width="32" alt="" /> License

[MIT](./LICENSE).
