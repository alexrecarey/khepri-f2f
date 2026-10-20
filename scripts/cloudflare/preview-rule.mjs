// The zone's URL rewrite rule for link previews (worker/preview.js): a
// link-preview bot asking for the app's address (/?mode=matchup&...) gets
// /s with the same query, which the Worker answers with the matchup's card.
// People get / as a static file; only the bots in preview-rule.json reach
// the Worker. (iMessage's fetcher says facebookexternalhit and Twitterbot.)
//
// The rule lives in this repo and the deploy workflow applies it on main;
// wrangler can't manage zone rules, so this talks to the Rulesets API. It
// only touches its own rule (found by description), never the zone's other
// Transform Rules. Needs CLOUDFLARE_API_TOKEN with Zone Read and Zone
// Transform Rules Edit on the zone.
//
//   node scripts/cloudflare/preview-rule.mjs           apply it
//   node scripts/cloudflare/preview-rule.mjs --check   print it, change nothing
import {readFileSync} from 'node:fs';

const config = JSON.parse(readFileSync(new URL('./preview-rule.json', import.meta.url), 'utf8'));
const PHASE = 'http_request_transform';
const API = 'https://api.cloudflare.com/client/v4';

// contains is case sensitive: the names are as the bots send them.
const quote = (s) => JSON.stringify(s);
const expression = ({zone, bots}) => [
  `http.host eq ${quote(zone)}`,
  'http.request.uri.path eq "/"',
  'http.request.uri.query ne ""',
  `(${bots.map((b) => `http.user_agent contains ${quote(b)}`).join(' or ')})`,
].join(' and ');

// Only the path changes; the query (the setup) goes along as it is.
const rule = {
  description: config.description,
  expression: expression(config),
  action: 'rewrite',
  action_parameters: {uri: {path: {value: config.path}}},
  enabled: true,
};

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, 'content-type': 'application/json'},
    body: body && JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return {status: res.status, json};
}

const fail = (what, {status, json}) => {
  throw new Error(`${what}: HTTP ${status} ${JSON.stringify(json.errors ?? json)}`);
};

async function apply() {
  if (!process.env.CLOUDFLARE_API_TOKEN) throw new Error('CLOUDFLARE_API_TOKEN is not set');
  const zones = await api('GET', `/zones?name=${encodeURIComponent(config.zone)}`);
  const zoneId = zones.json.result?.[0]?.id;
  if (!zoneId) fail(`zone ${config.zone}`, zones);

  const entry = await api('GET', `/zones/${zoneId}/rulesets/phases/${PHASE}/entrypoint`);
  if (entry.status === 404) {
    const made = await api('POST', `/zones/${zoneId}/rulesets`, {name: 'default', kind: 'zone', phase: PHASE, rules: [rule]});
    if (!made.json.success) fail('create the ruleset', made);
    return 'created the ruleset with the rule';
  }
  if (!entry.json.success) fail('read the ruleset', entry);
  const {id, rules = []} = entry.json.result;
  const mine = rules.find((r) => r.description === rule.description);
  if (mine && mine.expression === rule.expression && mine.enabled
    && mine.action_parameters?.uri?.path?.value === config.path) return 'already up to date';
  const res = mine
    ? await api('PATCH', `/zones/${zoneId}/rulesets/${id}/rules/${mine.id}`, rule)
    : await api('POST', `/zones/${zoneId}/rulesets/${id}/rules`, rule);
  if (!res.json.success) fail('write the rule', res);
  return mine ? 'updated the rule' : 'added the rule';
}

if (process.argv.includes('--check')) console.log(JSON.stringify(rule, null, 2));
else console.log(`preview rule: ${await apply()}`);
