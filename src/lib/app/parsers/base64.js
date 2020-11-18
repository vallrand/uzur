export const parseDataURI = dataURI => {
    const [ metaData, base64 ] = dataURI.split(',')
    let mediaType = metaData.match(/^data:([a-z\/]*);/i)
    mediaType = mediaType && mediaType[1]
    const [ type, subtype ] = mediaType.split('/')
    return { base64, type, subtype, dataURI }
}

export const decodeBase64 = base64 => {
    const raw = atob(base64)
    const array = new Uint8Array(raw.length)
    for(let i = 0; i < raw.length; i++)
        array[i] = raw.charCodeAt(i)
    return array
}