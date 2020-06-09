import {RoamNode, Selection} from '../../../../src/ts/core/roam/roam-node';

describe(RoamNode, () => {
    const propertyName = 'inline_property';
    const dateProperty = 'date_property';
    const value = `value`;

    const propertyMatcher = RoamNode.getInlinePropertyMatcher(propertyName);
    const nodeWithValue = new RoamNode(`blah [[[[${propertyName}]]::${value}]]`);
    const nodeWithNoProperty = new RoamNode(`blah`);

    const datePage = '[[February 26th, 2020]]';
    const nodeWithDate = new RoamNode(`[[[[${dateProperty}]]::${datePage}]]`)

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

        test('works for values with multiple properties', () => {
            expect(new RoamNode(nodeWithValue.text + nodeWithValue.text)
                .getInlineProperty(propertyName)).toBe(value)
        })

        // TODO
        test.skip('works for values containing brackets', () => {
            expect(nodeWithDate.getInlineProperty(dateProperty)).toBe(datePage)
        })

    });

    describe('withInlineProperty', () => {
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

    describe('selection', () => {
        const content = 'test';
        test('when selection start and end are the same, selected text should be empty', () => {
            expect(new RoamNode(content).selectedText()).toBe('')
        })

        describe('when selection start and end are 1 char apart', () => {
            const testNode = new RoamNode(content, new Selection(0, 1));
            test('selected text should contain 1 char', () => {
                expect(testNode.selectedText()).toBe(content[0])
            })

            test('text after selection should contain rest of the string', () => {
                expect(testNode.selectedText() + testNode.textAfterSelection()).toBe(content)
            })
        })
    })
});