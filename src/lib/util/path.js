export const path = fullpath => ({
    get basedir(){
        const index = fullpath.lastIndexOf('/')
        return index == -1 ? fullpath : fullpath.substr(0, index + 1)
    },
    get filename(){
        return fullpath.split('/').pop().replace(/\..*/i, '')
    },
    get extension(){
        return fullpath.split('.').pop().toLowerCase()
    }
})