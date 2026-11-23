import {
  getPropertyKeyName,
  getStaticStringValue,
  isInsidePandaStyleCall,
} from '../../utils/panda-styles.js';
import { createRule } from '../../utils/utils.js';

const defaultDesignSystemPattern = String.raw`(^|/)src/design-system/`;

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `boxSizing: border-box` in Panda styles because global styles already apply it.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          // Regex for files that define the design system itself, such as the
          // global `border-box` reset. The rule skips them.
          designSystemPattern: { type: 'string' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      boxSizingBorderBox:
        'Remove `boxSizing: "border-box"`. The global styles already apply it to every element.',
    },
  },

  create(context) {
    const isDesignSystemFile = new RegExp(
      context.options[0]?.designSystemPattern ?? defaultDesignSystemPattern
    ).test(context.filename.replaceAll('\\', '/'));

    if (isDesignSystemFile) {
      return {};
    }

    return {
      Property(node) {
        if (
          getPropertyKeyName(node) !== 'boxSizing' ||
          getStaticStringValue(node.value) !== 'border-box' ||
          !isInsidePandaStyleCall(node)
        ) {
          return;
        }

        context.report({ node, messageId: 'boxSizingBorderBox' });
      },
    };
  },
});
