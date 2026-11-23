import {
  getPropertyKeyName,
  getStaticStringValue,
  isInsidePandaStyleCall,
} from '../../utils/panda-styles.js';
import { createRule } from '../../utils/utils.js';

const defaultDesignSystemPattern = String.raw`(^|/)src/design-system/`;

const defaultProperties = ['fontSize'];

// Values that inherit or scale the surrounding text style instead of replacing it.
const relativeValuePattern =
  /^(inherit|initial|unset|revert|revert-layer|smaller|larger|[\d.]+(em|%))$/;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require Panda `textStyle` instead of setting typography properties such as `fontSize` directly.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Typography properties that must come from a text style.
          properties: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
          // Regex for files that define the design system itself, such as the text styles.
          designSystemPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferTextStyle:
        'Use a `textStyle` instead of setting `{{name}}` directly, so that text follows the typography scale.',
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const properties = new Set(options.properties ?? defaultProperties);

    const isDesignSystemFile = new RegExp(
      options.designSystemPattern ?? defaultDesignSystemPattern
    ).test(context.filename.replaceAll('\\', '/'));

    if (isDesignSystemFile) {
      return {};
    }

    return {
      Property(node) {
        const name = getPropertyKeyName(node);

        if (
          !properties.has(name) ||
          relativeValuePattern.test(getStaticStringValue(node.value) ?? '') ||
          !isInsidePandaStyleCall(node)
        ) {
          return;
        }

        context.report({ node, messageId: 'preferTextStyle', data: { name } });
      },
    };
  },
});
