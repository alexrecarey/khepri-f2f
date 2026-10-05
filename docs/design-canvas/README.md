---
title: Design canvases — archived source
date: 2026-09-27
status: archive, not a build input
---

# Design canvases

The working files behind design explorations for the calculator, recovered from the Claude Design
sessions that produced them. **Nothing here is imported by the app** — it is the record of how a
direction was arrived at, kept so the reasoning and the alternates survive the session.

| Directory | Canvas | Covers |
|---|---|---|
| `range-band-selectors/` | *Range Band Selector Directions* | Five directions for the Range control in `src/units/RangeInput.jsx`: showing each band's modifier instead of its inches, a final-modifier readout on the left (like Fireteam Purity), and the reciprocal link between the Active and Reactive columns |
| `mobile-ux-redesign/` | *Infinity the Calculator* | Mobile-first redesign, Oct 2026. Two canvas pages: **Exploration** (unit picker, results sheet, ledger placement, results peek, range selector, app chrome) and **Final** (the chosen screens: picker prototype, matchup screen with results peek and range selector, swipe-up results, menu, saved rolls, settings, about, classic calculator and its results) |

Each is also a live, editable Artifact — they did not stop when this copy was taken:

- *Range Band Selector Directions* — <https://claude.ai/artifact/SHCsqEroKXQmw4sUPhfyfr>
- *Infinity the Calculator* — <https://claude.ai/artifact/Ki3XWPgrkwNu9zARuS6YnY>

So this directory is the archive of a moving thing, not a mirror of it. When the two disagree the
Artifact is newer.

## How to look at them

Each `.dc.html` is plain HTML with inline styles wrapped in an `<x-dc>` element — open one directly
in a browser and it renders without the canvas runtime. `canvas.json` is the manifest: which
artboard sits where, plus the **notes** arguing each direction's motivation and tradeoff.

## Provenance

Recovered from the session scratchpad under `/private/tmp/claude-501/…`, which is temporary and
would have been cleared. Every file under `range-band-selectors/project/` is a byte-identical copy
of what was written there. `mobile-ux-redesign/project/` is a byte-identical copy of the published
Artifact (version 1791238911-4a0f), pulled on 2026-10-05.
