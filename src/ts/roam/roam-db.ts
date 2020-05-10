import {runInPageContext} from '../utils/browser'

export const RoamDb = {
    getBlockById(dbId: number) {
        // @ts-ignore
        return runInPageContext((...args: any[]) => window.roamAlphaAPI.pull(...args), '[*]', dbId)
    },

    query(query: string, ...params: any[]) {
        console.log('Executing Roam DB query', query)
        console.log('Query params', params)

        // @ts-ignore
        return runInPageContext((...args: any[]) => window.roamAlphaAPI.q(...args), query, ...params)
    },

    queryFirst(query: string, ...params: any[]) {
        const results = this.query(query, ...params)
        if (!results?.[0] || results?.[0].lenght < 1) return null

        return this.getBlockById(results[0][0])
    },

    getPageByName(name: string) {
        return this.queryFirst('[:find ?e :in $ ?a :where [?e :node/title ?a]]', name)
    },

    getBlockByUid(uid: string) {
        return this.queryFirst('[:find ?e :in $ ?a :where [?e :block/uid ?a]]', uid)
    },
}
