export const browserChromeColors = {
  light: '#f7f8f8',
  dark: '#090b10'
} as const;

export const applyTheme = (isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', isDark ? browserChromeColors.dark : browserChromeColors.light);
};

export const persistTheme = (isDark: boolean) => {
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};
