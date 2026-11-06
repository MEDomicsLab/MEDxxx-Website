import { useRef, useState } from "react";
import { cx } from "../../../lib/cx.js";
import { plain } from "../../../lib/text.js";
import { fill } from "../../../lib/tokens.js";
import useHighlight from "../../../lib/useHighlight.js";
import useIsoLayoutEffect from "../../../lib/useIsoLayoutEffect.js";
import RichText from "../../ui/RichText/RichText.jsx";
import Section from "../../ui/Section/Section.jsx";
import SectionHeader from "../../ui/SectionHeader/SectionHeader.jsx";
import styles from "./Steps.module.css";

export default function Steps({ id, index: order = 0, title, text, items = [], align = "center" }) {
  const uid = id ?? `steps-${order}`;
  const [active, setActive] = useState(0);
  const list = useRef(null);
  const words = useRef([]);
  const { highlight, spot } = useHighlight();
  const values = { count: items.length };

  useIsoLayoutEffect(() => {
    const measure = () => {
      if (words.current[active]) spot(words.current[active]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (list.current) observer.observe(list.current);
    return () => observer.disconnect();
  }, [active, spot]);

  const reset = () => {
    const focused = words.current.findIndex(
      (word) => word === document.activeElement && word.matches(":focus-visible")
    );
    setActive(focused < 0 ? 0 : focused);
  };

  const onKey = (event, index) => {
    const next = {
      ArrowDown: (index + 1) % items.length,
      ArrowRight: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      ArrowLeft: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    words.current[next]?.focus({ preventScroll: true });
  };

  return (
    <Section id={id}>
      <SectionHeader title={title} text={text} values={values} align={align} />
      <div
        className={styles.board}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setActive(0);
        }}
      >
        <div ref={list} className={styles.list} onMouseLeave={reset}>
          <span ref={highlight} className={cx(styles.highlight, "paper")} aria-hidden="true" />
          <ul
            className={styles.words}
            role="tablist"
            aria-orientation="vertical"
            aria-label={plain(title, values)}
          >
            {items.map((item, index) => (
              <li key={item.title} role="presentation">
                <button
                  ref={(node) => {
                    words.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${index}`}
                  aria-selected={index === active}
                  aria-controls={`${uid}-panel-${index}`}
                  tabIndex={index === active ? 0 : -1}
                  className={styles.word}
                  data-active={index === active || undefined}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => onKey(event, index)}
                >
                  {fill(item.title)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.details}>
          {items.map((item, index) => (
            <div
              key={item.title}
              id={`${uid}-panel-${index}`}
              role="tabpanel"
              aria-hidden={index !== active}
              inert={index !== active ? "" : undefined}
              aria-labelledby={`${uid}-tab-${index}`}
              tabIndex={index === active ? 0 : -1}
              className={styles.detail}
              data-active={index === active || undefined}
            >
              <p>
                <RichText text={item.text} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
