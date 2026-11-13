import { useEffect, useState } from "react";
import { theme, ui } from "../../../lib/content.js";
import { cx } from "../../../lib/cx.js";
import { keys, write } from "../../../lib/storage.js";
import { fill } from "../../../lib/tokens.js";
import Icon from "../../ui/Icon/Icon.jsx";
import styles from "./ThemeToggle.module.css";

const lightQuery = "(prefers-color-scheme: light)";

const resolve = () => {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  if (theme.mode === "system") {
    return window.matchMedia(lightQuery).matches ? "light" : "dark";
  }
  return theme.mode === "light" ? "light" : "dark";
};

export default function ThemeToggle({ className, ...props }) {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    setMode(resolve());
    const media = window.matchMedia(lightQuery);
    const update = () => setMode(resolve());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    media.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);

  const next = mode === "dark" ? "light" : "dark";
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    write(keys.theme, next);
    setMode(next);
  };

  return (
    <button
      type="button"
      className={cx(styles.toggle, className)}
      onClick={toggle}
      aria-label={fill(ui.a11y.toggleTheme, { mode: ui.themeNames[next] })}
      data-mode={mode ?? undefined}
      {...props}
    >
      <Icon name="sun" size={17} className={styles.sun} />
      <Icon name="moon" size={16} className={styles.moon} />
      <span className={styles.star} aria-hidden="true" />
    </button>
  );
}
