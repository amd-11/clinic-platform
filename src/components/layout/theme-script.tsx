export const THEME_STORAGE_KEY = "theme";

/**
 * Server component rendered inside <head>. It runs before first paint,
 * so the page never flashes the wrong theme.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
