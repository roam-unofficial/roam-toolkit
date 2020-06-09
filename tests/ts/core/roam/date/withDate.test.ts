import {NodeWithDate} from '../../../../../src/ts/core/roam/date/withDate'
import {RoamDate} from '../../../../../src/ts/core/roam/date'


describe(NodeWithDate, () => {
    const datePage1 = `[[February 23rd, 2020]]`;
    const datePage2 = `[[February 24th, 2020]]`;

    const multiDateNode = new NodeWithDate(`test ${datePage1} ${datePage2}`)
    const noDateNode = new NodeWithDate('test')

    describe('listDatePages', () => {
        test('return list of dates when multiple are present', () => {
            expect(multiDateNode.listDatePages()).toStrictEqual([datePage1, datePage2])
        })

        test('return empty array when no dates found', () => {
            expect(noDateNode.listDatePages()).toHaveLength(0)
        })
    })

    describe('withDate', () => {
        const newDate = new Date(2020, 2, 22);
        test('when multiple dates => append new one at the end', () => {
            expect(multiDateNode.withDate(newDate).text).toEndWith(RoamDate.formatPage(newDate))
        })

        test('when no date => append new one at the end', () => {
            expect(noDateNode.withDate(newDate).text).toEndWith(RoamDate.formatPage(newDate))
        })

        test('when 1 date => replace it with new one', () => {
            const oneDateNode = new NodeWithDate(`test ${datePage1} continues`)

            const newNode = oneDateNode.withDate(newDate);
            const dateStr = RoamDate.formatPage(newDate);

            expect(newNode.text).not.toEndWith(dateStr)
            expect(newNode.listDatePages()).toContain(dateStr)
        })
    })
})