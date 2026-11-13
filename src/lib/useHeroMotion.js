import { useRef, useState } from "react";
import { gsap } from "gsap";
import useIsoLayoutEffect from "./useIsoLayoutEffect.js";

export default function useHeroMotion({ scene, copy, stage, label, expand, duration, classes }) {
  const animation = useRef(null);
  const [clickable, setClickable] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useIsoLayoutEffect(() => {
    const canvas = stage.current;
    const container = scene.current;
    const content = copy.current;
    if (!canvas || !container || !content) return undefined;

    const main = canvas.querySelector(`.${classes.main}`);
    const inset = canvas.querySelector(`.${classes.inset}`);
    const controls = [
      ...content.querySelectorAll("[data-hero-actions] a, [data-hero-actions] button"),
    ];
    const media = gsap.matchMedia();

    media.add(
      {
        supported:
          "(min-width: 1012px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)",
        all: "all",
      },
      ({ conditions }) => {
        const enabled = expand && conditions.supported;
        setClickable(enabled);
        setExpanded(false);
        if (!enabled) return undefined;

        const frame = canvas.parentElement;
        const timeline = gsap.timeline({
          paused: true,
          defaults: { ease: "power2.inOut", duration },
          onUpdate() {
            const cover = canvas.getBoundingClientRect();
            controls.forEach((control) => {
              const bounds = control.getBoundingClientRect();
              const covered =
                bounds.right > cover.left &&
                bounds.left < cover.right &&
                bounds.bottom > cover.top &&
                bounds.top < cover.bottom;
              if (control.inert !== covered) control.inert = covered;
            });
          },
        });
        animation.current = timeline;

        timeline.fromTo(
          content,
          { x: 0, y: 0, scale: 1, opacity: 1, transformOrigin: "right center" },
          {
            x: () => container.clientWidth * 0.42,
            y: () => container.clientHeight * 0.06,
            scale: 0.78,
            opacity: 0,
            duration: duration * 0.75,
          },
          0
        );
        timeline.fromTo(
          canvas,
          {
            x: 0,
            y: 0,
            width: () => frame.clientWidth,
            height: () => frame.clientHeight,
          },
          {
            x: () => container.getBoundingClientRect().left - frame.getBoundingClientRect().left,
            y: () => -frame.offsetTop,
            width: () => container.clientWidth,
            height: () => container.clientHeight,
          },
          0
        );
        if (label.current) {
          timeline.fromTo(
            label.current,
            { x: 0, y: 0 },
            {
              x: () =>
                container.getBoundingClientRect().left -
                frame.getBoundingClientRect().left +
                (container.clientWidth - frame.clientWidth) / 2,
              y: () => container.clientHeight - frame.clientHeight - frame.offsetTop,
            },
            0
          );
        }
        if (main) {
          timeline.fromTo(
            main,
            { left: "20%", top: "14%", width: "96%", yPercent: 0 },
            { left: "21%", top: "13%", width: "72%", yPercent: 0 },
            0
          );
        }
        if (inset) {
          timeline.fromTo(
            inset,
            { left: "6%", width: "36%", yPercent: 0 },
            { left: "5.5%", width: "25%", yPercent: -3 },
            0
          );
        }

        const resize = () => {
          const progress = timeline.progress();
          const paused = timeline.paused();
          const reversed = timeline.reversed();
          timeline.invalidate().restart().progress(progress).reversed(reversed).paused(paused);
        };
        window.addEventListener("resize", resize);

        return () => {
          window.removeEventListener("resize", resize);
          animation.current = null;
          controls.forEach((control) => {
            control.inert = false;
          });
        };
      }
    );

    return () => media.revert();
  }, [scene, copy, stage, label, expand, duration, classes]);

  useIsoLayoutEffect(() => {
    if (expanded) animation.current?.play();
    else animation.current?.reverse();
  }, [expanded]);

  return { clickable, expanded, toggle: () => setExpanded((value) => !value) };
}
