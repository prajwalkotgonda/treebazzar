import { useEffect } from 'react';

/**
 * Locks body scroll when a modal/popup is open.
 * Automatically restores scroll on unmount.
 */
export function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}
