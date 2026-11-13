import Hero from "../components/sections/Hero/Hero.jsx";
import Install from "../components/sections/Install/Install.jsx";
import Learn from "../components/sections/Learn/Learn.jsx";
import Overview from "../components/sections/Overview/Overview.jsx";
import Paper from "../components/sections/Paper/Paper.jsx";
import Walkthrough from "../components/sections/Walkthrough/Walkthrough.jsx";
import { homePage, sections } from "../lib/content.js";
import usePageHead from "../lib/usePageHead.js";

export default function Home() {
  usePageHead(homePage);
  return (
    <>
      <Hero {...sections.hero} />
      <Overview {...sections.discover} />
      <Paper {...sections.paper} />
      <Walkthrough {...sections.features} />
      <Install {...sections.download} />
      <Learn {...sections.learn} />
    </>
  );
}
