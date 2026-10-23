// The source hash behind src/engine/wasm/BUILD.json: what the committed WASM was built from. build-engine.sh
// writes it at build time; engineBuild.test.mjs recomputes it so `yarn test` fails when engine-rs/ changed but
// the WASM was not rebuilt. tests/ and target/ are left out: they don't change the build.
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('../engine-rs/', import.meta.url));
const INPUTS = ['Cargo.toml', 'Cargo.lock', 'rust-toolchain.toml', 'src'];

/**
 * @param {string} path
 * @returns {string[]}
 */
function files(path) {
  try {
    return readdirSync(path, {withFileTypes: true})
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap((e) => files(join(path, e.name)));
  } catch (e) {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === 'ENOTDIR') return [path];
    throw e;
  }
}

export function engineSourceHash() {
  const hash = createHash('sha256');
  for (const file of INPUTS.flatMap((p) => files(join(ROOT, p)))) {
    // Name and contents, so a rename counts too.
    hash.update(relative(ROOT, file).split('\\').join('/') + '\0');
    hash.update(readFileSync(file));
    hash.update('\0');
  }
  return hash.digest('hex');
}

// node scripts/engine-stamp.mjs OUT.json key=value ...: writes the stamp with the build details given.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [out, ...pairs] = process.argv.slice(2);
  const stamp = {source: engineSourceHash(), ...Object.fromEntries(pairs.map((p) => p.split(/=(.*)/s).slice(0, 2)))};
  writeFileSync(out, JSON.stringify(stamp, null, 2) + '\n');
}
