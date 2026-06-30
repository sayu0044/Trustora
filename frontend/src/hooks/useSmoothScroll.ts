import { useEffect } from "react";
import Lenis from "lenis";

const HEADER_OFFSET = -76;


export function useSmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      return;
    }

    const lenis = new Lenis({
      anchors: { offset: HEADER_OFFSET },
      duration: 1.05
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}
