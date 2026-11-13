import { useRef } from "react";
import { ui } from "../../../lib/content.js";
import { cx } from "../../../lib/cx.js";
import { lines, plain } from "../../../lib/text.js";
import { fill } from "../../../lib/tokens.js";
import useHeroMotion from "../../../lib/useHeroMotion.js";
import ActionLinks from "../../ui/ActionLinks/ActionLinks.jsx";
import Icon from "../../ui/Icon/Icon.jsx";
import Marquee from "../../ui/Marquee/Marquee.jsx";
import RichText from "../../ui/RichText/RichText.jsx";
import { Screen } from "../../ui/Screen/Screen.jsx";
import SmartLink from "../../ui/SmartLink/SmartLink.jsx";
import styles from "./Hero.module.css";

function Partner({ partner }) {
  const name = plain(partner.name);
  const image = (
    <>
      <img
        className={cx(styles.logo, partner.logoDark ? styles.lightOnly : styles.adaptive)}
        src={partner.logo}
        alt={name}
        loading="lazy"
        decoding="async"
      />
      {partner.logoDark && (
        <img
          className={cx(styles.logo, styles.darkOnly)}
          src={partner.logoDark}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      )}
    </>
  );
  return partner.href ? (
    <SmartLink href={partner.href} className={styles.partner} title={name}>
      {image}
    </SmartLink>
  ) : (
    <span className={styles.partner}>{image}</span>
  );
}

export default function Hero({
  id,
  layout = "split",
  expansion,
  title,
  text,
  actions = [],
  badges = [],
  media = [],
  partners,
}) {
  const scene = useRef(null);
  const copy = useRef(null);
  const stage = useRef(null);
  const label = useRef(null);
  const [main, inset] = media;
  const expand = layout === "split" && !!main;
  const expandLabel = expansion?.label ?? ui.expand;

  const { clickable, expanded, toggle } = useHeroMotion({
    scene,
    copy,
    stage,
    label,
    expand,
    duration: expansion?.duration ?? 0.6,
    classes: styles,
  });

  return (
    <section
      id={id}
      className={cx(styles.hero, styles[layout], expand && styles.expanding)}
      aria-labelledby="hero-title"
    >
      <div ref={scene} className={styles.inner}>
        <div ref={copy} className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>
            {lines(title).map((line, index) => (
              <span key={index} className={styles.line}>
                <span className={styles.lineInner} style={{ "--line": index }}>
                  <RichText text={line} />
                </span>
              </span>
            ))}
          </h1>
          {text && (
            <p className={styles.text} data-reveal="" style={{ "--reveal-delay": "260ms" }}>
              <RichText text={text} />
            </p>
          )}
          <ActionLinks
            links={actions}
            size="lg"
            className={styles.actions}
            data-hero-actions=""
            data-reveal=""
            style={{ "--reveal-delay": "380ms" }}
          />
        </div>

        {main && (
          <div
            className={styles.stageWrap}
            data-nav-release={layout === "split" ? "" : undefined}
            data-reveal=""
            style={{ "--reveal-delay": "300ms" }}
          >
            <div ref={stage} className={cx(styles.stage, "paper")}>
              <Screen
                image={main}
                className={styles.main}
                priority
                sizes={expand ? "100vw" : "(min-width: 1012px) 60vw, 100vw"}
              />
              {inset && <Screen image={inset} className={styles.inset} />}
              {badges.map((badge, index) => (
                <span key={badge} className={cx(styles.badge, styles[`badge${index % 4}`])}>
                  <span className={styles.badgeDot} aria-hidden="true" />
                  {fill(badge)}
                </span>
              ))}
              {clickable && (
                <button
                  type="button"
                  className={styles.expandControl}
                  aria-label={expanded ? ui.a11y.collapseHero : ui.a11y.expandHero}
                  aria-expanded={expanded}
                  onClick={toggle}
                />
              )}
            </div>
            {expand && expandLabel && (
              <button
                ref={label}
                type="button"
                className={styles.expandLabel}
                hidden={!clickable}
                aria-expanded={expanded}
                onClick={toggle}
              >
                <Icon name="cursor" size={14} className={styles.expandCursor} />
                {fill(expanded ? (expansion?.collapseLabel ?? ui.collapse) : expandLabel)}
              </button>
            )}
          </div>
        )}
      </div>

      {partners?.items?.length > 0 && (
        <div className={styles.partners} data-nav-release="" data-reveal="">
          {partners.label && <p className={styles.partnersLabel}>{fill(partners.label)}</p>}
          <Marquee
            className={styles.marquee}
            items={partners.items}
            label={ui.a11y.partners}
            render={(partner) => <Partner partner={partner} />}
          />
        </div>
      )}
    </section>
  );
}
