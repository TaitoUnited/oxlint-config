/**
 * Resolve a JS plugin from this package's location, so that the plugin
 * versions in this package's `dependencies` are used and consumers never
 * reference files inside `node_modules` themselves.
 */
export function resolvePlugin({ name, specifier }) {
  return { name, specifier: import.meta.resolve(specifier) };
}

export const taitoPlugin = resolvePlugin({
  name: 'taito',
  specifier: '../plugin/index.js',
});
