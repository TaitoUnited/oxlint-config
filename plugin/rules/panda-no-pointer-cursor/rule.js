import {
  getPropertyKeyName,
  getStaticStringValue,
  isInsidePandaStyleCall,
} from '../../utils/panda-styles.js';
import { createRule } from '../../utils/utils.js';

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow `cursor: pointer` in Panda styles.',
    },
    schema: [],
    messages: {
      pointerCursor:
        'Remove `cursor: pointer`. Only links show a pointer cursor; buttons and other controls keep the default cursor.',
    },
  },

  create(context) {
    return {
      Property(node) {
        if (
          getPropertyKeyName(node) !== 'cursor' ||
          getStaticStringValue(node.value) !== 'pointer' ||
          !isInsidePandaStyleCall(node)
        ) {
          return;
        }

        context.report({ node, messageId: 'pointerCursor' });
      },
    };
  },
});
