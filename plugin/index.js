import packageJson from '../package.json' with { type: 'json' };
import { rule as graphqlMutationReturnsEntity } from './rules/graphql-mutation-returns-entity/rule.js';
import { rule as graphqlNoDescription } from './rules/graphql-no-description/rule.js';
import { rule as graphqlNoTypenameSelection } from './rules/graphql-no-typename-selection/rule.js';
import { rule as helpersAfterMain } from './rules/helpers-after-main/rule.js';
import { rule as lazyLoadDialogs } from './rules/lazy-load-dialogs/rule.js';
import { rule as noChainedTypeAssertions } from './rules/no-chained-type-assertions/rule.js';
import { rule as noExtraEmptyLines } from './rules/no-extra-empty-lines/rule.js';
import { rule as noFunctionDepsInEffect } from './rules/no-function-deps-in-effect/rule.js';
import { rule as noInternalTestMocks } from './rules/no-internal-test-mocks/rule.js';
import { rule as noModuleScopeTrans } from './rules/no-module-scope-trans/rule.js';
import { rule as noObjectParameters } from './rules/no-object-parameters/rule.js';
import { rule as noPointerCursor } from './rules/no-pointer-cursor/rule.js';
import { rule as noPositionalFuncArgs } from './rules/no-positional-func-args/rule.js';
import { rule as noRedundantStack } from './rules/no-redundant-stack/rule.js';
import { rule as noSsrGuards } from './rules/no-ssr-guards/rule.js';
import { rule as pandaStyleConventions } from './rules/panda-style-conventions/rule.js';
import { rule as readabilityPaddingAroundControlFlow } from './rules/readability-padding-around-control-flow/rule.js';
import { rule as readabilityPaddingAroundFunction } from './rules/readability-padding-around-function/rule.js';
import { rule as readabilityPaddingAroundMultilineStatement } from './rules/readability-padding-around-multiline-statement/rule.js';
import { rule as readabilityPaddingAroundMultilineVariable } from './rules/readability-padding-around-multiline-variable/rule.js';
import { rule as readabilityPaddingBetweenJsxSiblings } from './rules/readability-padding-between-jsx-siblings/rule.js';
import { rule as readabilityPaddingBetweenTopLevelDeclarations } from './rules/readability-padding-between-top-level-declarations/rule.js';
import { createPlugin } from './utils/utils.js';

export const rules = {
  'graphql-mutation-returns-entity': graphqlMutationReturnsEntity,
  'graphql-no-description': graphqlNoDescription,
  'graphql-no-typename-selection': graphqlNoTypenameSelection,
  'helpers-after-main': helpersAfterMain,
  'lazy-load-dialogs': lazyLoadDialogs,
  'no-chained-type-assertions': noChainedTypeAssertions,
  'no-extra-empty-lines': noExtraEmptyLines,
  'no-function-deps-in-effect': noFunctionDepsInEffect,
  'no-internal-test-mocks': noInternalTestMocks,
  'no-module-scope-trans': noModuleScopeTrans,
  'no-object-parameters': noObjectParameters,
  'no-pointer-cursor': noPointerCursor,
  'no-positional-func-args': noPositionalFuncArgs,
  'no-redundant-stack': noRedundantStack,
  'no-ssr-guards': noSsrGuards,
  'readability-padding-around-control-flow':
    readabilityPaddingAroundControlFlow,
  'readability-padding-around-function': readabilityPaddingAroundFunction,
  'readability-padding-around-multiline-statement':
    readabilityPaddingAroundMultilineStatement,
  'readability-padding-around-multiline-variable':
    readabilityPaddingAroundMultilineVariable,
  'readability-padding-between-jsx-siblings':
    readabilityPaddingBetweenJsxSiblings,
  'readability-padding-between-top-level-declarations':
    readabilityPaddingBetweenTopLevelDeclarations,
  'panda-style-conventions': pandaStyleConventions,
};

export default createPlugin({
  name: 'taito',
  version: packageJson.version,
  rules,
});
