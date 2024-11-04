import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  createBrowserRouter, Navigate,
  RouterProvider,
} from "react-router-dom";
import * as Sentry from "@sentry/react";


Sentry.init({
  dsn: "https://43af9393fc55104e36288fc1844716be@o4506078646239232.ingest.sentry.io/4506078647943168",
  integrations: [
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost", /^https:\/\/infinitythecalculator\.com\//],
    }),
    new Sentry.Replay(),
  ],
  // Performance Monitoring
  // tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  enabled: false// import.meta.env.MODE !== 'development'
});

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

const router = sentryCreateBrowserRouter([ 
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
