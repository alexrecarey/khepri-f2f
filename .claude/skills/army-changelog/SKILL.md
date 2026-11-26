---
name: army-changelog
description: Build a shareable, unofficial changelog page of an Infinity Army data update (what changed in units, profiles, loadouts, points, SWC, stats, skills, equipment and weapons between two army.json snapshots), filterable by faction, with unit crests and army logos, published as an Artifact. Use whenever the user wants a changelog, patch notes, "what changed", a diff or a summary of a Corvus Belli Army release / army.json update to post or share with the Infinity community, or wants to refresh last time's changelog page after a new `yarn fetch-army`.
---

# Army changelog

Turns two `src/army/army.json` snapshots into one page: a facet per top-level
faction (PanOceania, Yu Jing, ... JSA; not per sectorial), one card per unit
with its crest, the logos of the armies it applies to, and its changes grouped
by profile or loadout. "Copy as text" gives Markdown for forums and Discord.

## Steps

Work in the scratchpad; `S` below is a scratchpad folder, `K` is this skill's
folder (`.claude/skills/army-changelog`).

1. **Pick the two snapshots.** New = `src/army/army.json` after `yarn fetch-army`.
   Old = the version before the update, usually `git show main:src/army/army.json > $S/army.old.json`
   (on main after the update merged: `git show <commit before it>:src/army/army.json`).
   Check `generatedAt` in both so you are not diffing a file against itself.
2. **Diff:** `node $K/scripts/changelog.mjs $S/army.old.json src/army/army.json $S/changelog.json`.
   It prints the entry count and changes per kind. Spot-check a few units
   against the git diff of army.json before going on: a mass of
   "Loadout removed" + "New loadout" pairs usually means CB renumbered
   options, which is still accurate but worth knowing before you describe it.
3. **Build:** `node $K/scripts/build.mjs $S/changelog.json src/army/army.json $S/out`.
   It writes `index.html`, copies crests from `.cache/crests` (fills in from
   CB's asset host when missing), downloads army logos, rejects any SVG with
   scripts or handlers, and writes `files.json`. Read its `problems:` lines.
4. **Publish** with the Artifact tool: `file_path` = `$S/out/index.html`,
   `root` = `$S/out`, `files` = the array in `$S/out/files.json`, `icon` "list" on a first
   publish. To refresh an existing page keep its URL (`url`, after a `read`).
   Tell the user the page is private until they share it from its Share menu.

## Why it is built this way (don't undo these)

- **Images are published beside the page.** The artifact frame's CSP blocks
  images from other hosts, so hotlinking CB's crests or logos shows nothing.
- **No top-level `const top` (or `name`, `parent`, `self`, `location`...) in the page script.**
  `window.top` is non-configurable, so redeclaring it is a SyntaxError and the
  page renders empty. The template uses `factionOf`.
- **Loadouts are labelled by points, SWC and kit,** not name alone: one unit
  often has several loadouts with the same name.
- **Armies with identical changes are merged into one card;** a unit appears
  on several cards when its changes differ between armies (e.g. different points).
- **The page says it is unofficial** and not affiliated with Corvus Belli.
  Keep that footer; the page uses CB's logos and crests for a fan summary.
- **Versions are shown as a range:** each army carries its own version number.

## Scope

army.json is the calculator's subset of the Army data, so the changelog covers
what it holds: stats, skills, equipment, weapons, loadouts, points, SWC, AVA,
FTO flags, and weapon profiles. Mercenary pools, Reinforcements, fireteam
charts and rules text are not covered; the footer says so. Weapon PS/burst
tweaks usually appear as a weapon swapped on the loadout (`Chain Rifle (+1B)`
→ `Chain Rifle (PS=6)`), since they live on the loadout's weapon entry.

## Changing the page

The template is `assets/template.html` (`__DATA__` is replaced with the
changelog JSON). Its design tokens are at the top of the `<style>`. The
facets and every army's name and logo come from the data's `factions` (army.json),
so a new or renamed army needs no edit here. After an
edit, re-run step 3 and republish to the same URL.

The scripts are JSDoc-typed against `src/types.js` and type-checked with the
tests (`tsconfig.tests.json`).
