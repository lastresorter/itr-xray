import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

const STORAGE_DARK = 'dark-mode';
const STORAGE_ULTRA = 'isUltraDarkThemeEnabled';

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

function applyDom(isDark: boolean, isUltra: boolean) {
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(isDark ? 'dark' : 'light');
  // Native scrollbars read color-scheme, not the body class.
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  if (isUltra) {
    document.documentElement.setAttribute('data-theme', 'ultra-dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const msg = document.getElementById('message');
  if (msg) {
    msg.classList.remove('dark', 'light');
    msg.classList.add(isDark ? 'dark' : 'light');
  }
}

// module load so the document is in the right theme before React mounts.
const initialDark = readBool(STORAGE_DARK, true);
// itr-xray: ultra-dark is the default theme for new browsers.
const initialUltra = readBool(STORAGE_ULTRA, true);
applyDom(initialDark, initialUltra);

// IT_RUNNER palette (see README.md, раздел «Фирменный стиль»): navy surfaces taken from the
// brand deck's gradient, violet #5956B1 as the primary, magenta #B455AD as a
// rare accent. Dark-mode primaries are lifted so text keeps WCAG AA contrast.
const BRAND_FONT_TOKENS = {
  fontFamily:
    "'Inter Variable', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  borderRadius: 8,
  borderRadiusLG: 14,
};
const DARK_TOKENS = {
  ...BRAND_FONT_TOKENS,
  colorPrimary: '#6966C9',
  colorLink: '#8F8CEB',
  colorLinkHover: '#A9A7F2',
  colorInfo: '#6966C9',
  colorBgBase: '#1C1B3A',
  colorBgLayout: '#1C1B3A',
  colorBgContainer: '#262550',
  colorBgElevated: '#302E60',
};
const ULTRA_DARK_TOKENS = {
  ...BRAND_FONT_TOKENS,
  colorPrimary: '#6966C9',
  colorLink: '#8F8CEB',
  colorLinkHover: '#A9A7F2',
  colorInfo: '#6966C9',
  colorBgBase: '#0B0A18',
  colorBgLayout: '#0B0A18',
  colorBgContainer: '#151430',
  colorBgElevated: '#1D1C3A',
};
const DARK_LAYOUT_TOKENS = {
  bodyBg: '#1C1B3A',
  headerBg: '#17162F',
  headerColor: '#ffffff',
  footerBg: '#1C1B3A',
  siderBg: '#17162F',
  triggerBg: '#262550',
  triggerColor: '#ffffff',
};
const ULTRA_DARK_LAYOUT_TOKENS = {
  bodyBg: '#0B0A18',
  headerBg: '#0E0D1E',
  headerColor: '#ffffff',
  footerBg: '#0B0A18',
  siderBg: '#0E0D1E',
  triggerBg: '#1D1C3A',
  triggerColor: '#ffffff',
};
const DARK_MENU_TOKENS = {
  darkItemBg: '#17162F',
  darkSubMenuItemBg: '#1C1B3A',
  darkPopupBg: '#262550',
  darkItemSelectedBg: '#5956B1',
};
const ULTRA_DARK_MENU_TOKENS = {
  darkItemBg: '#0E0D1E',
  darkSubMenuItemBg: '#0B0A18',
  darkPopupBg: '#151430',
  darkItemSelectedBg: '#4B48A3',
};
const DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(206, 208, 226, 0.08)',
};
const ULTRA_DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(206, 208, 226, 0.05)',
};
const STATISTIC_TOKENS = {
  contentFontSize: 17,
  titleFontSize: 11,
};
const LIGHT_CONTRAST_TOKENS = {
  ...BRAND_FONT_TOKENS,
  colorPrimary: '#5956B1',
  colorInfo: '#5956B1',
  colorLink: '#4B48A3',
  colorBgLayout: '#EEEEF6',
  colorTextDescription: 'rgba(0, 0, 0, 0.58)',
  colorTextTertiary: 'rgba(0, 0, 0, 0.58)',
  colorTextPlaceholder: '#767676',
  colorError: '#cf1322',
  colorErrorText: '#cf1322',
  colorSuccessText: '#237804',
};
const LIGHT_BUTTON_TOKENS = {
  colorPrimary: '#5956B1',
  colorPrimaryHover: '#6966C9',
  colorPrimaryActive: '#4B48A3',
};
const LIGHT_MENU_TOKENS = {
  itemSelectedBg: 'rgba(89, 86, 177, 0.12)',
  itemSelectedColor: '#4B48A3',
};

// hashed:false drops the `:where(.css-<hash>)` wrapper antd puts around every
// rule. It costs nothing in specificity — `:where()` contributes zero, so the
// panel's own `.ant-*` overrides still win — and it removes roughly 5,700
// wrappers, 16% of the generated stylesheet, from what the browser has to parse.
//
// cssVar.key pins the CSS-variable scope. Every panel page mounts its own
// ConfigProvider (there is no root one), and without a fixed key each mints a
// fresh useId-derived scope, so navigating re-serialises and re-injects the whole
// token block under a new class instead of reusing the one already in the head.
const SHARED_STYLE_CONFIG = {
  hashed: false,
  cssVar: { key: 'xui' },
} as const;

export function buildAntdThemeConfig(isDark: boolean, isUltra: boolean): ThemeConfig {
  if (!isDark) {
    return {
      ...SHARED_STYLE_CONFIG,
      algorithm: antdTheme.defaultAlgorithm,
      token: LIGHT_CONTRAST_TOKENS,
      components: {
        Statistic: STATISTIC_TOKENS,
        Button: LIGHT_BUTTON_TOKENS,
        Menu: LIGHT_MENU_TOKENS,
      },
    };
  }
  return {
    ...SHARED_STYLE_CONFIG,
    algorithm: antdTheme.darkAlgorithm,
    token: isUltra ? ULTRA_DARK_TOKENS : DARK_TOKENS,
    components: {
      Layout: isUltra ? ULTRA_DARK_LAYOUT_TOKENS : DARK_LAYOUT_TOKENS,
      Menu: isUltra ? ULTRA_DARK_MENU_TOKENS : DARK_MENU_TOKENS,
      Card: isUltra ? ULTRA_DARK_CARD_TOKENS : DARK_CARD_TOKENS,
      Statistic: STATISTIC_TOKENS,
    },
  };
}

export function pauseAnimationsUntilLeave(elementId: string): void {
  document.documentElement.setAttribute('data-theme-animations', 'off');
  const el = document.getElementById(elementId);
  if (!el) return;
  const restore = () => {
    document.documentElement.removeAttribute('data-theme-animations');
    el.removeEventListener('mouseleave', restore);
    el.removeEventListener('touchend', restore);
  };
  el.addEventListener('mouseleave', restore);
  el.addEventListener('touchend', restore);
}

interface ThemeContextValue {
  isDark: boolean;
  isUltra: boolean;
  toggleTheme: () => void;
  toggleUltra: () => void;
  antdThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(initialDark);
  const [isUltra, setIsUltra] = useState<boolean>(initialUltra);

  useLayoutEffect(() => {
    applyDom(isDark, isUltra);
    localStorage.setItem(STORAGE_DARK, String(isDark));
    localStorage.setItem(STORAGE_ULTRA, String(isUltra));
  }, [isDark, isUltra]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);
  const toggleUltra = useCallback(() => setIsUltra((v) => !v), []);

  const antdThemeConfig = useMemo(() => buildAntdThemeConfig(isDark, isUltra), [isDark, isUltra]);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig }),
    [isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
