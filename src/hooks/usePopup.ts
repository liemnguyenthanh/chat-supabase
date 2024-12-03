import { useState, useCallback, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UsePopupReturn {
  isOpen: boolean;
  position: Position;
  open: (e: React.MouseEvent) => void;
  close: () => void;
  popupRef: React.RefObject<HTMLDivElement>;
}

export const usePopup = (
  trigger: 'click' | 'contextmenu' = 'click',
  initialPosition: Position = { x: 0, y: 0 }
): UsePopupReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(initialPosition);
  const popupRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout>();

  const adjustPosition = (x: number, y: number): Position => {
    if (!popupRef.current) return { x, y };

    const popup = popupRef.current;
    const rect = popup.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position if popup would overflow viewport
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 8;
    }

    // Adjust vertical position if popup would overflow viewport
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 8;
    }

    return {
      x: Math.max(8, adjustedX),
      y: Math.max(8, adjustedY),
    };
  };

  const open = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (trigger === 'contextmenu') {
      e.preventDefault();
    }

    const initialPos = { x: e.clientX, y: e.clientY };
    setPosition(initialPos);
    setIsOpen(true);

    // Adjust position after the popup is rendered
    requestAnimationFrame(() => {
      setPosition(prev => adjustPosition(prev.x, prev.y));
    });
  }, [trigger]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!popupRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    // Delay adding the click listener to prevent immediate closure
    clickTimeoutRef.current = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [isOpen, close]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    position,
    open,
    close,
    popupRef
  };
};