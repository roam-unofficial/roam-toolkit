export const copyBlockEmbed = (blockId: string | undefined) => {
    if (!blockId) {
        return
    }

    return navigator.clipboard.writeText(`{{embed: ((${getBlockUid(blockId)}))}}`)
}

export const copyBlockReference = (blockId: string | undefined) => {
    if (!blockId) {
        return
    }

    return navigator.clipboard.writeText(`((${getBlockUid(blockId)}))`)
}

// An empirical observation:
const UID_LENGTH = 9
// Uid is the id Roam uses, blockId is the id of the html element
const getBlockUid = (blockId: string): string => blockId.substr(blockId?.length - UID_LENGTH)
