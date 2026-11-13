import site from "../data/site.json";
import theme from "../data/_shared/theme.json";
import ui from "../data/_shared/ui.json";
import hero from "../data/sections/hero.json";
import discover from "../data/sections/discover.json";
import paper from "../data/sections/paper.json";
import features from "../data/sections/features.json";
import download from "../data/sections/download.json";
import learn from "../data/sections/learn.json";

const fields = ({ $schema: _schema, ...content }) => content;

export const sections = {
  hero: fields(hero),
  discover: fields(discover),
  paper: fields(paper),
  features: fields(features),
  download: fields(download),
  learn: fields(learn),
};

export const homePage = { key: "home", path: "/", title: site.seo.homeTitle };

export const notFoundPage = { key: "404", noindex: true, ...ui.notFound };

export { site, theme, ui };
