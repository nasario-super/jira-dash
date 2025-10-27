import { useState, useEffect, useCallback } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  announceChanges: boolean;
}

export interface AccessibilityAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: Date;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      return { ...getDefaultSettings(), ...JSON.parse(saved) };
    }
    return getDefaultSettings();
  });

  const [announcements, setAnnouncements] = useState<
    AccessibilityAnnouncement[]
  >([]);
  const [focusVisible, setFocusVisible] = useState(false);

  // Default accessibility settings
  function getDefaultSettings(): AccessibilitySettings {
    return {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: false,
      focusVisible: true,
      announceChanges: true,
    };
  }

  // Detect system preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    setSettings(prev => ({
      ...prev,
      reducedMotion: mediaQuery.matches,
      highContrast: highContrastQuery.matches,
    }));

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    highContrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      highContrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Screen reader
    if (settings.screenReader) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }, [settings]);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
        setSettings(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Announce changes to screen readers
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!settings.announceChanges) return;

      const announcement: AccessibilityAnnouncement = {
        id: Date.now().toString(),
        message,
        priority,
        timestamp: new Date(),
      };

      setAnnouncements(prev => [...prev, announcement]);

      // Create live region for screen readers
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.textContent = message;

      document.body.appendChild(liveRegion);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);

      // Remove from announcements after 5 seconds
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
      }, 5000);
    },
    [settings.announceChanges]
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<AccessibilitySettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));

      // Announce changes
      if (newSettings.highContrast !== undefined) {
        announce(
          `Alto contraste ${
            newSettings.highContrast ? 'ativado' : 'desativado'
          }`
        );
      }
      if (newSettings.fontSize) {
        announce(`Tamanho da fonte alterado para ${newSettings.fontSize}`);
      }
      if (newSettings.screenReader !== undefined) {
        announce(
          `Modo leitor de tela ${
            newSettings.screenReader ? 'ativado' : 'desativado'
          }`
        );
      }
    },
    [announce]
  );

  // Focus management
  const focusElement = useCallback(
    (selector: string) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
        announce(
          `Foco movido para ${
            element.textContent ||
            element.getAttribute('aria-label') ||
            'elemento'
          }`
        );
      }
    },
    [announce]
  );

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Skip to content
  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector(
      'main, [role="main"]'
    ) as HTMLElement;
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
      announce('Pulou para o conteúdo principal');
    }
  }, [announce]);

  // Get accessibility classes
  const getAccessibilityClasses = useCallback(() => {
    const classes = [];

    if (settings.highContrast) classes.push('high-contrast');
    if (settings.reducedMotion) classes.push('reduced-motion');
    if (settings.fontSize !== 'medium')
      classes.push(`font-${settings.fontSize}`);
    if (settings.screenReader) classes.push('screen-reader-mode');
    if (focusVisible) classes.push('focus-visible');

    return classes.join(' ');
  }, [settings, focusVisible]);

  // Get ARIA attributes
  const getAriaAttributes = useCallback(
    (options: {
      label?: string;
      describedBy?: string;
      expanded?: boolean;
      selected?: boolean;
      hidden?: boolean;
      live?: 'polite' | 'assertive' | 'off';
    }) => {
      const attrs: Record<string, string | boolean> = {};

      if (options.label) attrs['aria-label'] = options.label;
      if (options.describedBy) attrs['aria-describedby'] = options.describedBy;
      if (options.expanded !== undefined)
        attrs['aria-expanded'] = options.expanded;
      if (options.selected !== undefined)
        attrs['aria-selected'] = options.selected;
      if (options.hidden !== undefined) attrs['aria-hidden'] = options.hidden;
      if (options.live) attrs['aria-live'] = options.live;

      return attrs;
    },
    []
  );

  return {
    settings,
    announcements,
    focusVisible,
    updateSettings,
    announce,
    focusElement,
    trapFocus,
    skipToContent,
    getAccessibilityClasses,
    getAriaAttributes,
  };
};

export default useAccessibility;












