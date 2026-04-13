import * as React from "react";

/** Breakpoint below which the device is considered mobile (px) */
const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses `window.matchMedia` and listens for resize events.
 *
 * @returns `true` if viewport width < 768px, `false` otherwise
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
