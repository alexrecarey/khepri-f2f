import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {dispatch, store} from './state/store.js';
import {startSync} from './state/sync.js';
import {DEV_TOOLS} from './devTools.js';
import {loadFixture} from './ui/fixtures/index.js';

// ?fixture=FinalPeek: the state a design-canvas board shows (src/ui/fixtures).
// Dev and previews only, and never saved over the visitor's own state.
const fixture = DEV_TOOLS ? new URLSearchParams(window.location.search).get('fixture') : null;
if (fixture) loadFixture(fixture).then((state) => state && dispatch({type: 'replace', state}));

// URL, history and localStorage follow the state document from here on.
let storage = null;
try { storage = fixture ? null : window.localStorage; } catch { /* storage blocked: nothing persists */ }
startSync(store, dispatch, {storage});

// The store on window, to inspect or replace the whole document.
if (DEV_TOOLS) window.__app = {store, dispatch};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)
