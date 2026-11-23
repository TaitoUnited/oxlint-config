import {
  getPropertyKeyName,
  isInsidePandaStyleCall,
} from '../../utils/panda-styles.js';
import {
  createRule,
  getPropertyRemovalRange,
  getSourceCode,
} from '../../utils/utils.js';

/**
 * The box sides each property sets, keyed by Panda property name or shorthand.
 * Logical sides are treated as their horizontal-writing-mode equivalents,
 * which is only used to detect overlapping properties.
 */
function sideProperties({ property, short }) {
  const allSides = ['t', 'b', 'l', 'r'];

  return {
    [property]: allSides,
    [short]: allSides,
    [`${property}Top`]: ['t'],
    [`${short}t`]: ['t'],
    [`${property}Bottom`]: ['b'],
    [`${short}b`]: ['b'],
    [`${property}Left`]: ['l'],
    [`${short}l`]: ['l'],
    [`${property}Right`]: ['r'],
    [`${short}r`]: ['r'],
    [`${property}Block`]: ['t', 'b'],
    [`${short}y`]: ['t', 'b'],
    [`${property}Y`]: ['t', 'b'],
    [`${property}BlockStart`]: ['t'],
    [`${property}BlockEnd`]: ['b'],
    [`${property}Inline`]: ['l', 'r'],
    [`${short}x`]: ['l', 'r'],
    [`${property}X`]: ['l', 'r'],
    [`${property}InlineStart`]: ['l'],
    [`${property}Start`]: ['l'],
    [`${short}s`]: ['l'],
    [`${property}InlineEnd`]: ['r'],
    [`${property}End`]: ['r'],
    [`${short}e`]: ['r'],
  };
}

const families = [
  {
    sides: sideProperties({ property: 'padding', short: 'p' }),
    combinations: [
      { target: 'padding', sides: ['t', 'b', 'l', 'r'] },
      { target: 'paddingBlock', sides: ['t', 'b'] },
      { target: 'paddingInline', sides: ['l', 'r'] },
    ],
  },
  {
    sides: sideProperties({ property: 'margin', short: 'm' }),
    combinations: [
      { target: 'margin', sides: ['t', 'b', 'l', 'r'] },
      { target: 'marginBlock', sides: ['t', 'b'] },
      { target: 'marginInline', sides: ['l', 'r'] },
    ],
  },
  {
    sides: {
      width: ['w'],
      w: ['w'],
      height: ['h'],
      h: ['h'],
      boxSize: ['w', 'h'],
    },
    combinations: [{ target: 'boxSize', sides: ['w', 'h'] }],
  },
];

export const rule = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require combined properties such as `boxSize`, `paddingBlock` and `marginInline` instead of equal per-side values in Panda styles.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferCombined:
        'Use `{{target}}: {{value}}` instead of setting {{properties}} to the same value.',
    },
  },

  create(context) {
    const sourceCode = getSourceCode(context);

    function report({ target, properties }) {
      const sorted = properties.toSorted((a, b) => a.range[0] - b.range[0]);
      const [first, ...rest] = sorted;
      const value = sourceCode.getText(first.value);

      context.report({
        node: rest.at(-1),
        messageId: 'preferCombined',
        data: {
          target,
          value,
          properties: formatList(
            sorted.map(property => `\`${getPropertyKeyName(property)}\``)
          ),
        },
        fix: fixer => [
          fixer.replaceText(first, `${target}: ${value}`),
          ...mergeRanges(
            rest.map(node => getPropertyRemovalRange({ sourceCode, node }))
          ).map(range => fixer.removeRange(range)),
        ],
      });
    }

    return {
      ObjectExpression(node) {
        // A spread can override any property, so moving them is unsafe.
        if (node.properties.some(property => property.type !== 'Property')) {
          return;
        }

        if (!isInsidePandaStyleCall(node)) {
          return;
        }

        for (const family of families) {
          const members = node.properties
            .filter(property => property.kind === 'init' && !property.method)
            .map(property => ({
              property,
              sides: family.sides[getPropertyKeyName(property)],
            }))
            .filter(member => member.sides);

          const used = new Set();

          for (const { target, sides } of family.combinations) {
            const match = findCombination({ members, sides, used });

            if (match) {
              for (const property of match) {
                used.add(property);
              }

              report({ target, properties: match });
            }
          }
        }
      },
    };
  },
});

/**
 * Properties that set exactly the given sides, one side each, to the same
 * static value, when no other property in the object touches those sides.
 */
function findCombination({ members, sides, used }) {
  const touching = members.filter(member =>
    member.sides.some(side => sides.includes(side))
  );

  if (
    touching.length !== sides.length ||
    touching.some(member => used.has(member.property))
  ) {
    return;
  }

  const covered = new Set(touching.flatMap(member => member.sides));

  if (
    touching.some(member => member.sides.length !== 1) ||
    covered.size !== sides.length
  ) {
    return;
  }

  const values = touching.map(member => getStaticValue(member.property.value));

  if (values[0] === undefined || values.some(value => value !== values[0])) {
    return;
  }

  return touching.map(member => member.property);
}

/** A comparable key for static strings and numbers, e.g. `s:10px` or `n:4`. */
function getStaticValue(node) {
  if (node.type === 'Literal') {
    if (typeof node.value === 'string') {
      return `s:${node.value}`;
    }

    if (typeof node.value === 'number') {
      return `n:${node.value}`;
    }

    return;
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return `s:${node.quasis[0].value.cooked}`;
  }
}

/** Merge overlapping or touching ranges so that fixes do not overlap. */
function mergeRanges(ranges) {
  const merged = [];

  for (const range of ranges.toSorted((a, b) => a[0] - b[0])) {
    const last = merged.at(-1);

    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push([...range]);
    }
  }

  return merged;
}

function formatList(items) {
  return items.length === 2
    ? items.join(' and ')
    : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}
