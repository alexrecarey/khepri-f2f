import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {bootStore, dispatch, store} from './state/store.js';
import {browserStorage} from './state/storage.js';
import {startSync} from './state/sync.js';
import {DEV_TOOLS} from './devTools.js';
import {loadFixture} from './ui/fixtures/index.js';

// The first state: the defaults, what this device saved, then the URL.
bootStore({search: window.location.search, storage: browserStorage()});

// ?fixture=FinalPeek: the state a design-canvas board shows (src/ui/fixtures).
// Dev and previews only, and never saved over the visitor's own state.
const fixture = DEV_TOOLS ? new URLSearchParams(window.location.search).get('fixture') : null;
// A fixture is a partial state document (src/ui/fixtures).
if (fixture) loadFixture(fixture).then((state) => state && dispatch({type: 'replace', state: /** @type {Partial<import('./types.js').AppState>} */ (state)}));

// URL, history and localStorage follow the state document from here on.
startSync(store, dispatch, {storage: fixture ? null : browserStorage()});

// The store on window, to inspect or replace the whole document.
if (DEV_TOOLS) window.__app = {store, dispatch};

// index.html has #root.
ReactDOM.createRoot(/** @type {HTMLElement} */ (document.getElementById('root'))).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)
