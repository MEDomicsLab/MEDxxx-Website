import { useCallback, useRef } from "react";

export default function useHighlight() {
  const highlight = useRef(null);
  const current = useRef(null);

  const spot = useCallback((cell) => {
    const node = highlight.current;
    if (!node) return;
    const snap = !current.current;
    current.current?.removeAttribute("data-lit");
    current.current = cell;
    cell.setAttribute("data-lit", "");
    node.toggleAttribute("data-snap", snap);
    node.style.setProperty("--hl-x", `${cell.offsetLeft}px`);
    node.style.setProperty("--hl-y", `${cell.offsetTop}px`);
    node.style.setProperty("--hl-w", `${cell.offsetWidth}px`);
    node.style.setProperty("--hl-h", `${cell.offsetHeight}px`);
    if (snap) node.getBoundingClientRect();
    node.removeAttribute("data-snap");
    node.setAttribute("data-on", "");
  }, []);

  const unspot = useCallback(() => {
    current.current?.removeAttribute("data-lit");
    current.current = null;
    highlight.current?.removeAttribute("data-on");
  }, []);

  const handlers = {
    onMouseEnter: (event) => spot(event.currentTarget),
    onFocus: (event) => event.currentTarget.matches(":focus-visible") && spot(event.currentTarget),
    onBlur: unspot,
  };

  return { highlight, spot, unspot, handlers };
}
