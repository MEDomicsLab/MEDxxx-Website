import { useId, useRef, useState } from "react";
import { plain } from "../../../lib/text.js";
import Logo from "../../brand/Logo/Logo.jsx";
import NavLabel from "../NavLabel/NavLabel.jsx";
import styles from "./Tabs.module.css";

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Tabs({ items, label, brand, inline, renderContent }) {
  const id = useId();
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const triggers = useRef([]);

  const select = (index) => {
    setActive(index);
    if (reducedMotion()) setShown(index);
  };

  const navigate = (event, index) => {
    const next = {
      ArrowRight: (index + 1) % items.length,
      ArrowLeft: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    triggers.current[next]?.focus();
  };

  return (
    <div className={styles.tabs} data-inline={inline || undefined}>
      <div className={styles.bar}>
        {brand && <Logo className={styles.logo} />}
        <div role="tablist" aria-label={label} className={styles.list}>
          {items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              ref={(node) => {
                triggers.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-controls={`${id}-panel-${index}`}
              aria-selected={index === active}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              data-mark-host=""
              data-active={index === active || undefined}
              onClick={() => select(index)}
              onKeyDown={(event) => navigate(event, index)}
            >
              <NavLabel marked>{plain(item.label)}</NavLabel>
            </button>
          ))}
        </div>
      </div>
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== shown}
          data-leaving={index === shown && index !== active ? "" : undefined}
          tabIndex={0}
          className={styles.panel}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && index !== active) setShown(active);
          }}
        >
          {renderContent(item, index === shown)}
        </div>
      ))}
    </div>
  );
}
