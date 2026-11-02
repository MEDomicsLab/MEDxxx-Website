import { plain } from "../../../lib/text.js";
import Button from "../../ui/Button/Button.jsx";
import ColumnHeader from "../../ui/ColumnHeader/ColumnHeader.jsx";
import CodeBlock from "../../ui/CodeBlock/CodeBlock.jsx";
import LinkRows from "../../ui/LinkRows/LinkRows.jsx";
import RichText from "../../ui/RichText/RichText.jsx";
import Section from "../../ui/Section/Section.jsx";
import SectionHeader from "../../ui/SectionHeader/SectionHeader.jsx";
import VideoEmbed from "../../ui/VideoEmbed/VideoEmbed.jsx";
import Tabs from "../../ui/Tabs/Tabs.jsx";
import styles from "./Learn.module.css";

function Body({ content }) {
  return (
    <>
      {content.text && (
        <p className={styles.text}>
          <RichText text={content.text} />
        </p>
      )}
      {content.video && <VideoEmbed video={content.video} className={styles.video} />}
      {content.install && (
        <CodeBlock code={content.install.code} language={content.install.language} compact />
      )}
      {content.items?.length > 0 && (
        <LinkRows items={content.items} label={content.linkLabel} className={styles.rows} />
      )}
      {content.action && (
        <div className={styles.action}>
          <Button link={content.action} variant={content.action.variant ?? "primary"} />
        </div>
      )}
    </>
  );
}

function Track({ track, index }) {
  return (
    <article
      className={styles.track}
      data-reveal=""
      style={{ "--reveal-delay": `${index * 120}ms` }}
    >
      <ColumnHeader title={track.title} meta={track.meta} />
      <Body content={track} />
      {track.tabs?.length > 0 && (
        <Tabs
          inline
          items={track.tabs}
          label={plain(track.title)}
          renderContent={(tab) => (
            <div className={styles.panel}>
              <Body content={tab} />
            </div>
          )}
        />
      )}
    </article>
  );
}

export default function Learn({ id, title, text, tracks = [], align = "split" }) {
  return (
    <Section id={id}>
      <SectionHeader title={title} text={text} align={align} />
      <div className={styles.tracks}>
        {tracks.map((track, index) => (
          <Track key={track.title} track={track} index={index} />
        ))}
      </div>
    </Section>
  );
}
