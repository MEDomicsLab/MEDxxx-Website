import { useCallback, useRef, useState } from "react";
import { ui } from "../../../lib/content.js";
import { cx } from "../../../lib/cx.js";
import { fitFor } from "../../../lib/media.js";
import { fill } from "../../../lib/tokens.js";
import useScrollSequence from "../../../lib/useScrollSequence.js";
import ActionLinks from "../../ui/ActionLinks/ActionLinks.jsx";
import RichText from "../../ui/RichText/RichText.jsx";
import Mat, { Screen } from "../../ui/Screen/Screen.jsx";
import Section from "../../ui/Section/Section.jsx";
import SectionHeader from "../../ui/SectionHeader/SectionHeader.jsx";
import styles from "./Walkthrough.module.css";

const pad = (value) => String(value).padStart(2, "0");

export default function Walkthrough({
  id,
  title,
  text,
  steps = [],
  align = "center",
  interaction = "hover",
}) {
  const scrolling = interaction === "scroll";
  const [{ active, previous }, setSelection] = useState({ active: 0, previous: null });
  const tabs = useRef([]);
  const select = useCallback((index) => {
    setSelection((current) =>
      current.active === index ? current : { active: index, previous: current.active }
    );
  }, []);

  const progress = useCallback((position) => {
    const index = Math.floor(position);
    tabs.current.forEach((tab, step) => {
      const amount = step < index ? 1 : step > index ? 0 : position - index;
      tab?.style.setProperty("--fill", amount.toFixed(3));
    });
  }, []);
  const { scroller, go } = useScrollSequence({
    count: steps.length,
    enabled: scrolling,
    onSelect: select,
    onProgress: progress,
  });

  const reset = () => {
    if (scrolling) return;
    const focused = tabs.current.findIndex((tab) => tab?.querySelector(":focus-visible"));
    select(focused < 0 ? 0 : focused);
  };

  const onKey = (event, index) => {
    const next = {
      ArrowDown: (index + 1) % steps.length,
      ArrowRight: (index + 1) % steps.length,
      ArrowUp: (index - 1 + steps.length) % steps.length,
      ArrowLeft: (index - 1 + steps.length) % steps.length,
      Home: 0,
      End: steps.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabs.current[next]?.querySelector("button")?.focus({ preventScroll: true });
    go(next);
  };

  return (
    <Section id={id}>
      <SectionHeader title={title} text={text} align={align} />

      <div
        ref={scroller}
        className={cx(styles.scroller, scrolling && styles.scroll)}
        style={{ "--count": steps.length }}
      >
        <div className={styles.sticky}>
          <div
            className={styles.layout}
            onMouseLeave={reset}
            onBlur={(event) => {
              if (!scrolling && !event.currentTarget.contains(event.relatedTarget)) select(0);
            }}
          >
            <nav className={styles.tabs} aria-label={ui.a11y.steps}>
              {steps.map((step, index) => {
                const on = index === active;
                return (
                  <div
                    key={step.title}
                    ref={(node) => {
                      tabs.current[index] = node;
                    }}
                    className={styles.tab}
                    data-active={on || undefined}
                    style={scrolling ? undefined : { "--fill": on ? 1 : 0 }}
                  >
                    <span className={styles.rule} aria-hidden="true">
                      <span className={cx(styles.fill, "paper")} />
                    </span>
                    <button
                      type="button"
                      className={styles.trigger}
                      onClick={() => go(index)}
                      onMouseEnter={() => {
                        if (!scrolling) select(index);
                      }}
                      onFocus={() => {
                        if (!scrolling) select(index);
                      }}
                      onKeyDown={(event) => onKey(event, index)}
                      aria-current={on ? "step" : undefined}
                    >
                      <span className={styles.index}>{pad(index + 1)}</span>
                      <span className={styles.name}>{fill(step.title)}</span>
                    </button>
                    <div className={styles.body} inert={on ? undefined : ""}>
                      <div className={styles.bodyInner}>
                        <p className={styles.text}>
                          <RichText text={step.text} />
                        </p>
                        <ActionLinks links={step.links} variant="link" className={styles.links} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
            <div className={cx(styles.stage, "paper")}>
              {steps.map(
                (step, index) =>
                  step.image && (
                    <div
                      key={step.title}
                      className={styles.slide}
                      data-active={index === active || undefined}
                      data-previous={index === previous || undefined}
                      data-past={index < active || undefined}
                      aria-hidden={index !== active}
                    >
                      <Screen image={step.image} fit={fitFor(step.image)} />
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>

      <ol className={styles.stack}>
        {steps.map((step, index) => (
          <li key={step.title} className={styles.item} data-reveal="">
            {step.image && <Mat image={step.image} />}
            <div className={styles.copy}>
              <span className={styles.index}>{pad(index + 1)}</span>
              <h3 className={styles.name}>{fill(step.title)}</h3>
              <p className={styles.text}>
                <RichText text={step.text} />
              </p>
              <ActionLinks links={step.links} variant="link" className={styles.links} />
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
