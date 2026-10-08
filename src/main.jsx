import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as Sentry from "@sentry/react";
import {dispatch, store} from './state/store.js';
import {startSync} from './state/sync.js';
import {loadFixture} from './ui/fixtures/index.js';


Sentry.init({
  dsn: "https://43af9393fc55104e36288fc1844716be@o4506078646239232.ingest.sentry.io/4506078647943168",
  integrations: [
    Sentry.browserTracingIntegration({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [/^https:\/\/infinitythecalculator\.com\//],
    }),
    Sentry.replayIntegration()
  ],
  // Performance Monitoring
  // tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  enabled: false// import.meta.env.MODE !== 'development'
});

// ?fixture=FinalPeek: the state a design-canvas board shows (src/ui/fixtures).
const fixture = new URLSearchParams(window.location.search).get('fixture');
if (fixture) loadFixture(fixture).then((state) => state && dispatch({type: 'replace', state}));

// URL, history and localStorage follow the state document from here on.
let storage = null;
try { storage = window.localStorage; } catch { /* storage blocked: nothing persists */ }
startSync(store, dispatch, {storage});

// Development: the store on window, to inspect or replace the whole document.
if (import.meta.env.DEV) window.__app = {store, dispatch};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)
