export const copyBlockEmbed = (htmlBlockId: string | undefined) => {
    if (!htmlBlockId) {
        return
    }

    return navigator.clipboard.writeText(`{{embed: ((${getBlockUid(htmlBlockId)}))}}`)
}

export const copyBlockReference = (htmlBlockId: string | undefined) => {
    if (!htmlBlockId) {
        return
    }

    return navigator.clipboard.writeText(`((${getBlockUid(htmlBlockId)}))`)
}

// An empirical observation:
const UID_LENGTH = 9
// Uid is the id Roam uses, blockId is the id of the html element
const getBlockUid = (htmlBlockId: string): string => htmlBlockId.substr(htmlBlockId?.length - UID_LENGTH)
