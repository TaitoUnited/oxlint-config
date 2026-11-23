import { resolvePlugin, taitoPlugin } from './utils.js';

const manualMemoizationMessage =
  'React Compiler handles memoization. Justify an exception with a disable comment.';

/** Restricted React imports, shared with presets that extend the same rule. */
export const reactRestrictedImports = [
  {
    name: 'react',
    importNames: ['useCallback', 'useMemo', 'memo'],
    message: manualMemoizationMessage,
  },
];

const jsxA11yRules = {
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-ambiguous-text': 'error',
  'jsx-a11y/anchor-has-content': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/autocomplete-valid': 'error',
  'jsx-a11y/click-events-have-key-events': 'error',
  'jsx-a11y/heading-has-content': 'error',
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',
  'jsx-a11y/interactive-supports-focus': [
    'error',
    {
      tabbable: [
        'button',
        'checkbox',
        'link',
        'searchbox',
        'spinbutton',
        'switch',
        'textbox',
      ],
    },
  ],
  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/media-has-caption': 'error',
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-autofocus': 'error',
  'jsx-a11y/no-distracting-elements': 'error',
  'jsx-a11y/no-interactive-element-to-noninteractive-role': [
    'error',
    {
      tr: ['none', 'presentation'],
      canvas: ['img'],
    },
  ],
  'jsx-a11y/no-noninteractive-element-interactions': [
    'error',
    {
      handlers: [
        'onClick',
        'onError',
        'onLoad',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
      alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      body: ['onError', 'onLoad'],
      dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
      iframe: ['onError', 'onLoad'],
      img: ['onError', 'onLoad'],
    },
  ],
  'jsx-a11y/no-noninteractive-element-to-interactive-role': [
    'error',
    {
      ul: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      ol: [
        'listbox',
        'menu',
        'menubar',
        'radiogroup',
        'tablist',
        'tree',
        'treegrid',
      ],
      li: [
        'menuitem',
        'menuitemradio',
        'menuitemcheckbox',
        'option',
        'row',
        'tab',
        'treeitem',
      ],
      table: ['grid'],
      td: ['gridcell'],
      fieldset: ['radiogroup', 'presentation'],
    },
  ],
  'jsx-a11y/no-noninteractive-tabindex': [
    'error',
    {
      tags: [],
      roles: ['tabpanel'],
      allowExpressionValues: true,
    },
  ],
  'jsx-a11y/no-redundant-roles': 'error',
  'jsx-a11y/no-static-element-interactions': [
    'error',
    {
      allowExpressionValues: true,
      handlers: [
        'onClick',
        'onMouseDown',
        'onMouseUp',
        'onKeyPress',
        'onKeyDown',
        'onKeyUp',
      ],
    },
  ],
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/scope': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',
};

const reactRules = {
  'react/button-has-type': 'error',
  'react/capitalized-calls': 'error',
  'react/checked-requires-onchange-or-readonly': 'error',
  'react/error-boundaries': 'error',
  // React deps array related lint rules are often unhelpful as they report false positives
  'react/exhaustive-deps': 'off',
  'react/exhaustive-effect-dependencies': 'off',
  'react/globals': 'error',
  'react/iframe-missing-sandbox': 'error',
  'react/immutability': 'error',
  'react/incompatible-library': 'error',
  'react/jsx-boolean-value': ['error', 'never'],
  'react/jsx-curly-brace-presence': [
    'warn',
    { props: 'never', children: 'never', propElementValues: 'always' },
  ],
  'react/jsx-fragments': 'error',
  'react/jsx-no-comment-textnodes': 'error',
  'react/jsx-no-script-url': 'error',
  'react/jsx-no-target-blank': 'error',
  'react/jsx-no-useless-fragment': 'error',
  'react/jsx-pascal-case': 'error',
  'react/memo-dependencies': 'error',
  'react/no-array-index-key': 'error',
  'react/no-danger': 'error',
  'react/no-deriving-state-in-effects': 'error',
  'react/no-namespace': 'error',
  'react/no-object-type-as-default-prop': 'error',
  'react/no-react-children': 'error',
  'react/no-unknown-property': 'error',
  'react/preserve-manual-memoization': 'error',
  'react/purity': 'error',
  'react/refs': 'error',
  'react/rules-of-hooks': 'error',
  'react/self-closing-comp': ['error', { component: true, html: false }],
  'react/set-state-in-effect': 'error',
  'react/set-state-in-render': 'error',
  'react/static-components': 'error',
  'react/style-prop-object': 'error',
  'react/unsupported-syntax': 'error',
  'react/use-memo': 'error',
  'react/void-use-memo': 'error',
  'react-dom/no-dangerously-set-innerhtml': 'error',
  'react-dom/no-dangerously-set-innerhtml-with-children': 'error',
  'react-dom/no-find-dom-node': 'error',
  'react-dom/no-flush-sync': 'error',
  'react-dom/no-hydrate': 'error',
  'react-dom/no-missing-button-type': 'error',
  'react-dom/no-missing-iframe-sandbox': 'error',
  'react-dom/no-render': 'error',
  'react-dom/no-render-return-value': 'error',
  'react-dom/no-script-url': 'error',
  'react-dom/no-unknown-property': 'off',
  'react-dom/no-unsafe-iframe-sandbox': 'error',
  'react-dom/no-unsafe-target-blank': 'error',
  'react-dom/no-use-form-state': 'error',
  'react-dom/no-void-elements-with-children': 'error',
  'react-jsx/no-children-prop': 'error',
  'react-jsx/no-children-prop-with-children': 'error',
  'react-jsx/no-comment-textnodes': 'error',
  'react-jsx/no-key-after-spread': 'error',
  'react-jsx/no-leaked-dollar': 'error',
  'react-jsx/no-leaked-semicolon': 'error',
  'react-jsx/no-namespace': 'error',
  'react-jsx/no-useless-fragment': 'error',
  'react-naming-convention/context-name': 'error',
  'react-web-api/no-leaked-event-listener': 'error',
  'react-web-api/no-leaked-interval': 'error',
  'react-web-api/no-leaked-resize-observer': 'error',
  'react-web-api/no-leaked-timeout': 'error',
  'react-x/no-access-state-in-setstate': 'error',
  'react-x/no-array-index-key': 'error',
  'react-x/no-children-count': 'off',
  'react-x/no-children-for-each': 'error',
  'react-x/no-children-map': 'off',
  'react-x/no-children-only': 'error',
  'react-x/no-children-to-array': 'error',
  'react-x/no-clone-element': 'off',
  'react-x/no-component-will-mount': 'error',
  'react-x/no-component-will-receive-props': 'error',
  'react-x/no-component-will-update': 'error',
  'react-x/no-context-provider': 'error',
  'react-x/no-create-ref': 'error',
  'react-x/no-direct-mutation-state': 'error',
  'react-x/no-duplicate-key': 'error',
  'react-x/no-forward-ref': 'error',
  'react-x/no-missing-key': 'error',
  'react-x/no-misused-capture-owner-stack': 'error',
  'react-x/no-nested-component-definitions': 'error',
  'react-x/no-nested-lazy-component-declarations': 'error',
  'react-x/no-unnecessary-use-prefix': 'error',
  'react-x/no-unstable-context-value': 'off',
  'react-x/no-unstable-default-props': 'error',
  'react-x/no-unused-state': 'error',
  'react-x/no-use-context': 'error',
};

/**
 * Rules for React applications built with React Compiler.
 *
 * Enables the native `react` and `jsx-a11y` plugins, the ESLint React
 * (`@eslint-react`) plugins and Taito's React rules. Extend after the base
 * config.
 *
 * @type {import('oxlint').OxlintConfig}
 */
const config = {
  env: {
    browser: true,
  },
  plugins: ['react', 'jsx-a11y'],
  jsPlugins: [
    taitoPlugin,
    resolvePlugin({
      name: 'react-x',
      specifier: 'eslint-plugin-react-x',
    }),
    resolvePlugin({
      name: 'react-jsx',
      specifier: 'eslint-plugin-react-jsx',
    }),
    resolvePlugin({
      name: 'react-dom',
      specifier: 'eslint-plugin-react-dom',
    }),
    resolvePlugin({
      name: 'react-web-api',
      specifier: 'eslint-plugin-react-web-api',
    }),
    resolvePlugin({
      name: 'react-naming-convention',
      specifier: 'eslint-plugin-react-naming-convention',
    }),
  ],
  rules: {
    'no-restricted-imports': ['error', ...reactRestrictedImports],
    'no-restricted-properties': [
      'error',
      ...['useCallback', 'useMemo', 'memo'].map(property => ({
        object: 'React',
        property,
        message: manualMemoizationMessage,
      })),
    ],
    ...jsxA11yRules,
    ...reactRules,
    'taito/no-function-deps-in-effect': 'error',
    'taito/padding-between-jsx-siblings': 'error',
  },
};

export default config;
