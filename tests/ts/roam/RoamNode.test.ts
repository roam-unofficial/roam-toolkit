import {RoamNode} from '../../../src/ts/utils/roam';

describe(RoamNode, () => {
    const propertyName = 'inline_property';
    const value = `value`;

    const propertyMatcher = RoamNode.getInlinePropertyMatcher(propertyName);
    const nodeWithValue = new RoamNode(`blah [[[[${propertyName}]]::${value}]]`);
    const nodeWithNoProperty = new RoamNode(`blah`);

    describe('getInlineProperty', () => {
        test('retrieves inline property if it is present', () => {
            expect(nodeWithValue.getInlineProperty(propertyName)).toBe(value);
        });

        test('returns emptystring for empty property value', () => {
            const testNode = new RoamNode(`blah [[[[${propertyName}]]::]]`);

            expect(testNode.getInlineProperty(propertyName)).toBe('');
        });

        test('returns undefined when property is missing', () => {
            expect(nodeWithNoProperty.getInlineProperty(propertyName)).toBeUndefined();
        })
    });

    describe('getInlineProperty', () => {
        test('if missing would append at the end', () => {
            expect(nodeWithNoProperty.withInlineProperty(propertyName, value).text)
                .toMatch(propertyMatcher)
        });

        test('if present replace current value with new one', () => {
            const newValue = 'newValue';
            const resultNode = nodeWithValue.withInlineProperty(propertyName, newValue);

            expect(resultNode.text.match(propertyMatcher)).toHaveLength(1);
            expect(resultNode.getInlineProperty(propertyName)).toBe(newValue);
        })
    });
});