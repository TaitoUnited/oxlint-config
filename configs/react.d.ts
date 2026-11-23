import type { OxlintConfig } from 'oxlint';

/** `no-restricted-imports` entries of the React preset, for extending the rule. */
export declare const reactRestrictedImports: Array<{
  name: string;
  importNames: string[];
  message: string;
}>;

declare const config: OxlintConfig & Required<Pick<OxlintConfig, 'rules'>>;

export default config;
