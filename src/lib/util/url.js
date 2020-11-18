export const UrlQuery = url => {
    url = url ? Object.assign(document.createElement('a'), { href: url }) : window.location
    let data = Object.create(null)
    let query = url.search.substring(1)
    query = query.split('+').join(' ')
    const regex = /[?&]?([^=]+)=([^&]*)/g
    let tokens = null
    while(tokens = regex.exec(query))
        data[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
    return data
}

export const urlQuery = location.query = UrlQuery()