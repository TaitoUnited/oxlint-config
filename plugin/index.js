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
import { rule as paddingAroundControlFlow } from './rules/padding-around-control-flow/rule.js';
import { rule as paddingAroundFunction } from './rules/padding-around-function/rule.js';
import { rule as paddingAroundMultilineStatement } from './rules/padding-around-multiline-statement/rule.js';
import { rule as paddingAroundMultilineVariable } from './rules/padding-around-multiline-variable/rule.js';
import { rule as paddingBetweenJsxSiblings } from './rules/padding-between-jsx-siblings/rule.js';
import { rule as paddingBetweenTopLevelDeclarations } from './rules/padding-between-top-level-declarations/rule.js';
import { rule as pandaStyleConventions } from './rules/panda-style-conventions/rule.js';
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
  'padding-around-control-flow': paddingAroundControlFlow,
  'padding-around-function': paddingAroundFunction,
  'padding-around-multiline-statement': paddingAroundMultilineStatement,
  'padding-around-multiline-variable': paddingAroundMultilineVariable,
  'padding-between-jsx-siblings': paddingBetweenJsxSiblings,
  'padding-between-top-level-declarations': paddingBetweenTopLevelDeclarations,
  'panda-style-conventions': pandaStyleConventions,
};

export default createPlugin({
  name: 'taito',
  version: packageJson.version,
  rules,
});
