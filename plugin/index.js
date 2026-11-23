import packageJson from '../package.json' with { type: 'json' };
import { rule as graphqlMutationReturnsEntity } from './rules/graphql-mutation-returns-entity/rule.js';
import { rule as graphqlNoDescription } from './rules/graphql-no-description/rule.js';
import { rule as graphqlNoTypenameSelection } from './rules/graphql-no-typename-selection/rule.js';
import { rule as helpersAfterMain } from './rules/helpers-after-main/rule.js';
import { rule as linguiNoModuleScopeTrans } from './rules/lingui-no-module-scope-trans/rule.js';
import { rule as noChainedTypeAssertions } from './rules/no-chained-type-assertions/rule.js';
import { rule as noInternalTestMocks } from './rules/no-internal-test-mocks/rule.js';
import { rule as noObjectParameters } from './rules/no-object-parameters/rule.js';
import { rule as noPositionalFuncArgs } from './rules/no-positional-func-args/rule.js';
import { rule as noSsrGuards } from './rules/no-ssr-guards/rule.js';
import { rule as pandaNoPointerCursor } from './rules/panda-no-pointer-cursor/rule.js';
import { rule as pandaStyleConventions } from './rules/panda-style-conventions/rule.js';
import { rule as reactLazyLoadDialogs } from './rules/react-lazy-load-dialogs/rule.js';
import { rule as reactNoFunctionDepsInEffect } from './rules/react-no-function-deps-in-effect/rule.js';
import { rule as reactNoRedundantStack } from './rules/react-no-redundant-stack/rule.js';
import { rule as readabilityPaddingAroundControlFlow } from './rules/readability-padding-around-control-flow/rule.js';
import { rule as readabilityPaddingAroundFunction } from './rules/readability-padding-around-function/rule.js';
import { rule as readabilityPaddingAroundMultilineStatement } from './rules/readability-padding-around-multiline-statement/rule.js';
import { rule as readabilityPaddingAroundMultilineVariable } from './rules/readability-padding-around-multiline-variable/rule.js';
import { rule as readabilityPaddingBetweenJsxSiblings } from './rules/readability-padding-between-jsx-siblings/rule.js';
import { rule as readabilityPaddingBetweenTopLevelDeclarations } from './rules/readability-padding-between-top-level-declarations/rule.js';
import { rule as readabilityPaddingNoExtraEmptyLines } from './rules/readability-padding-no-extra-empty-lines/rule.js';
import { createPlugin } from './utils/utils.js';

export const rules = {
  'graphql-mutation-returns-entity': graphqlMutationReturnsEntity,
  'graphql-no-description': graphqlNoDescription,
  'graphql-no-typename-selection': graphqlNoTypenameSelection,
  'helpers-after-main': helpersAfterMain,
  'lingui-no-module-scope-trans': linguiNoModuleScopeTrans,
  'no-chained-type-assertions': noChainedTypeAssertions,
  'no-internal-test-mocks': noInternalTestMocks,
  'no-object-parameters': noObjectParameters,
  'no-positional-func-args': noPositionalFuncArgs,
  'no-ssr-guards': noSsrGuards,
  'panda-no-pointer-cursor': pandaNoPointerCursor,
  'panda-style-conventions': pandaStyleConventions,
  'react-lazy-load-dialogs': reactLazyLoadDialogs,
  'react-no-function-deps-in-effect': reactNoFunctionDepsInEffect,
  'react-no-redundant-stack': reactNoRedundantStack,
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
  'readability-padding-no-extra-empty-lines':
    readabilityPaddingNoExtraEmptyLines,
};

export default createPlugin({
  name: 'taito',
  version: packageJson.version,
  rules,
});
