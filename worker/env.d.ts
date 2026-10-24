// What the Worker touches of the Workers runtime and its bindings
// (wrangler.jsonc), declared here for `yarn typecheck` instead of pulling in
// @cloudflare/workers-types: the R2 bucket's get, the assets binding's fetch,
// waitUntil, the default cache, HTMLRewriter and the bundled modules.

/** An object in the crests bucket, as worker/index.js serves it and worker/card.js reads it. */
interface R2ObjectLike {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/** The R2 bucket binding (CRESTS). `onlyIf` takes the request headers (If-None-Match). */
interface R2BucketLike {
  get(key: string, options?: {onlyIf?: Headers}): Promise<R2ObjectLike | null>;
}

/** The Worker's bindings. */
interface Env {
  ASSETS: {fetch(request: Request): Promise<Response>};
  CRESTS: R2BucketLike;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

// Workers' cache: caches.default on top of the standard CacheStorage.
interface CacheStorage {
  default: Cache;
}

/** An element as HTMLRewriter hands it to a handler (worker/preview.js). */
interface HTMLRewriterElement {
  getAttribute(name: string): string | null;
  remove(): void;
  setInnerContent(content: string): void;
  append(content: string, options?: {html?: boolean}): void;
}

declare class HTMLRewriter {
  on(selector: string, handlers: {element?(el: HTMLRewriterElement): void}): HTMLRewriter;
  transform(response: Response): Response;
}

// wrangler bundles .wasm as a compiled module and the fonts (a Data rule) as bytes.
declare module 'satori/yoga.wasm' {
  const mod: WebAssembly.Module;
  export default mod;
}
declare module '@resvg/resvg-wasm/index_bg.wasm' {
  const mod: WebAssembly.Module;
  export default mod;
}
