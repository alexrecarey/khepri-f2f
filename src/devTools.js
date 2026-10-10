// Dev and preview-only tools (?fixture=, ?debug=touch, window.__app): on in
// `yarn dev` and on Netlify deploy previews (where Alex tests), off on the
// live site. __PREVIEW__ is set by vite.config.js from Netlify's CONTEXT.
/* global __PREVIEW__ */
export const DEV_TOOLS = import.meta.env.DEV || (typeof __PREVIEW__ !== 'undefined' && __PREVIEW__);
