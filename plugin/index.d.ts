/** An Oxlint JS plugin rule (ESLint-compatible rule object). */
export type TaitoRule = {
  meta: {
    type: 'problem' | 'suggestion' | 'layout';
    docs: { description: string };
    fixable?: 'code' | 'whitespace';
    schema?: unknown[];
    messages: Record<string, string>;
  };
  create: (context: unknown) => Record<string, (node: unknown) => void>;
};

export declare const rules: Record<string, TaitoRule>;

declare const plugin: {
  meta: { name: 'taito'; version: string };
  rules: Record<string, TaitoRule>;
};

export default plugin;
