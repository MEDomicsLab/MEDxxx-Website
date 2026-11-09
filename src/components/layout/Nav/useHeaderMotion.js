import { useEffect, useRef } from "react";

const DRIFT = 120;
const GLIDE = 6.5;
const INTENT = 8;
const PEEK = 40;

const clamp = (value) => Math.min(1, Math.max(0, value));
const approach = (from, to, k) => {
  const next = from + (to - from) * k;
  return Math.abs(to - next) < 0.001 ? to : next;
};
const releasePoint = () =>
  document.querySelector("main [data-nav-release]") ||
  [...document.querySelectorAll("main h1, main h2")].find((node) => node.offsetHeight > 1);

export default function useHeaderMotion({ root, dock, notice, bar, held, pathname, onHide }) {
  const motion = useRef({ tuck: null, hide: 0 });
  const hideRef = useRef(onHide);
  hideRef.current = onHide;

  useEffect(() => {
    const state = motion.current;
    const host = root.current;
    const node = bar.current;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let hidden = false;
    let hovering = false;
    let travel = 0;
    let lastY = window.scrollY;
    let frame = 0;
    let last = 0;

    const tuckGoal = () => clamp(window.scrollY / DRIFT);
    const paint = () => {
      notice.current?.style.setProperty("--tuck", state.tuck.toFixed(4));
      dock.current.style.setProperty("--hide", state.hide.toFixed(4));
    };

    const step = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = still.matches ? 1 : 1 - Math.exp(-GLIDE * dt);
      const tuck = tuckGoal();
      const hide = Number(hidden);
      state.tuck = approach(state.tuck, tuck, k);
      state.hide = approach(state.hide, hide, k);
      paint();
      frame = state.tuck === tuck && state.hide === hide ? 0 : requestAnimationFrame(step);
      if (!frame) last = 0;
    };

    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    const reveal = () => {
      travel = 0;
      if (!hidden) return;
      hidden = false;
      kick();
    };

    const released = () => {
      const anchor = releasePoint();
      return (
        !!anchor &&
        (anchor.hasAttribute("data-nav-release")
          ? anchor.getBoundingClientRect().top < host.offsetHeight + 96
          : anchor.getBoundingClientRect().bottom < host.offsetHeight)
      );
    };

    const isHeld = () => held.current || hovering || !!host.querySelector(":focus-visible");

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      travel = Math.sign(dy) === Math.sign(travel) ? travel + dy : dy;
      if (!released() || isHeld() || travel < -INTENT) reveal();
      else if (travel > INTENT && !hidden) {
        hidden = true;
        hideRef.current?.();
      }
      kick();
    };

    const onFocus = () => {
      if (host.querySelector(":focus-visible")) reveal();
    };
    const onEnter = () => {
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };
    const onPointer = (event) => {
      if (hidden && event.clientY < PEEK) reveal();
    };

    if (state.tuck === null) state.tuck = tuckGoal();
    paint();
    kick();
    window.addEventListener("scroll", onScroll, { passive: true });
    host.addEventListener("focusin", onFocus);
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointerleave", onLeave);
    if (fine.matches) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      host.removeEventListener("focusin", onFocus);
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [root, dock, notice, bar, held, pathname]);
}
