import type { OxlintConfig } from 'oxlint';

declare const config: OxlintConfig & Required<Pick<OxlintConfig, 'rules'>>;

export default config;
