// Ambient declarations for `yarn typecheck`: what Vite provides at build time.
/// <reference types="vite/client" />

// vite.config.js `define`: the build's commit and the army data's date (AboutPage.jsx),
// and whether this is a PR preview build (devTools.js).
declare const __APP_VERSION__: string;
declare const __ARMY_DATE__: string | null;
declare const __PREVIEW__: boolean;

// Dev and preview-only hooks on window (src/devTools.js DEV_TOOLS).
interface Window {
  /** The store and dispatch, to inspect or replace the whole document (main.jsx). */
  __app?: {store: import('@tanstack/store').Store<import('./types.js').AppState>, dispatch: (action: import('./types.js').Action) => void};
  /** ?debug=touch: a readout of the drag guard's decisions (ui/useVisualViewport.js). */
  __touchDebug?: (line: string) => void;
}

// vite.config.js armyModules(): army.json split into the language-neutral core
// and the English names (src/army/localize.js splitNames).
declare module 'virtual:army-core' {
  const core: import('./types.js').ArmyCore;
  export default core;
}
declare module 'virtual:army-names-en' {
  const names: import('./types.js').NamesFile;
  export default names;
}
