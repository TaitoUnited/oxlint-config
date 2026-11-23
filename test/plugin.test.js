import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import base from '../configs/base.js';
import graphql from '../configs/graphql.js';
import lingui from '../configs/lingui.js';
import node from '../configs/node.js';
import panda from '../configs/panda.js';
import playwright from '../configs/playwright.js';
import react from '../configs/react.js';
import vitest from '../configs/vitest.js';
import plugin, { rules } from '../plugin/index.js';

const presets = {
  base,
  node,
  react,
  vitest,
  playwright,
  lingui,
  panda,
  graphql,
};

const ruleDirectories = readdirSync(
  fileURLToPath(new URL('../plugin/rules', import.meta.url))
);

const docsDirectory = fileURLToPath(new URL('../docs/', import.meta.url));

const ruleReference = readdirSync(docsDirectory)
  .filter(file => file.endsWith('.md'))
  .map(file => readFileSync(`${docsDirectory}${file}`, 'utf8'))
  .join('\n');

const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);

describe('taito plugin', () => {
  it('exports every rule directory', () => {
    expect(Object.keys(rules).toSorted()).toEqual(ruleDirectories.toSorted());

    expect(plugin.meta).toEqual({
      name: 'taito',
      version: packageJson.version,
    });
  });

  it.each(Object.entries(rules))('%s has metadata', (_name, rule) => {
    expect(rule.meta.docs.description).toMatch(/\.$/);
    expect(Object.keys(rule.meta.messages).length).toBeGreaterThan(0);
  });

  it.each(Object.keys(rules))('%s has unit tests', name => {
    const testFile = new URL(
      `../plugin/rules/${name}/rule.test.js`,
      import.meta.url
    );

    expect(existsSync(testFile)).toBe(true);
  });

  it.each(Object.keys(rules))('%s is documented', name => {
    expect(ruleReference).toContain(`### \`taito/${name}\``);
  });
});

describe('presets', () => {
  it.each(Object.entries(presets))(
    '%s only enables existing taito rules',
    (_name, preset) => {
      const taitoRules = Object.keys(preset.rules)
        .filter(rule => rule.startsWith('taito/'))
        .map(rule => rule.slice('taito/'.length));

      for (const rule of taitoRules) {
        expect(rules).toHaveProperty(rule);
      }

      const registersPlugin = (preset.jsPlugins ?? []).some(
        entry => typeof entry === 'object' && entry.name === 'taito'
      );

      expect(registersPlugin).toBe(taitoRules.length > 0);
    }
  );

  it.each(Object.keys(presets))('%s is exported by the package', name => {
    expect(packageJson.exports).toHaveProperty(`./${name}`);
  });
});
