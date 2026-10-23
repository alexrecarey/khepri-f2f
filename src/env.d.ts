// Ambient declarations for `yarn typecheck`: what Vite provides at build time.
/// <reference types="vite/client" />

// vite.config.js `define`: the build's commit and the army data's date (AboutPage.jsx),
// and whether this is a PR preview build (devTools.js).
declare const __APP_VERSION__: string;
declare const __ARMY_DATE__: string | null;
declare const __PREVIEW__: boolean;
