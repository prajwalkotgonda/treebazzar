import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let prevStyles = null;

function lockScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    const html = document.documentElement;
    const body = document.body;

    prevStyles = {
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
  }
  lockCount += 1;
}

function unlockScroll() {
  if (lockCount <= 0) return;
  lockCount -= 1;
  if (lockCount === 0 && prevStyles) {
    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = prevStyles.htmlOverflow;
    html.style.overscrollBehavior = prevStyles.htmlOverscroll;
    body.style.overflow = prevStyles.bodyOverflow;
    body.style.position = prevStyles.bodyPosition;
    body.style.top = prevStyles.bodyTop;
    body.style.left = prevStyles.bodyLeft;
    body.style.right = prevStyles.bodyRight;
    body.style.width = prevStyles.bodyWidth;
    body.style.overscrollBehavior = prevStyles.bodyOverscroll;

    const scrollY = savedScrollY;
    prevStyles = null;
    window.scrollTo(0, scrollY);
  }
}

/**
 * Locks page scroll (both html and body) when a modal/popup is open.
 * Preserves scroll position and restores it cleanly on close/unmount.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
