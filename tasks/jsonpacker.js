module.exports = function(grunt){
    var path = require('path'),
        fs = require('fs')
    grunt.file.defaultEncoding = 'utf8'
    
    var DATA_TYPE = {
        JSON:   0x0001,
        IMAGE:  0x0002,
        AUDIO:  0x0004,
        VIDEO:  0x0008,
        XML:    0x0010,
        TEXT:   0x0020,
    }
    
    var FORMAT_DATA_URI = {
        [DATA_TYPE.JSON]: function(data){
            return JSON.parse(data)
        },
        [DATA_TYPE.IMAGE]: function(data, ext){
            return 'data:image/' + ext.replace('jpg', 'jpeg') + ';base64,' + data
        },
        [DATA_TYPE.AUDIO]: function(data, ext){
            return 'data:audio/' + ext.replace('mp3','mpeg') + ';base64,' + data
        },
        [DATA_TYPE.VIDEO]: function(data, ext){
            return 'data:video/' + ext + ';base64,' + data
        },
        [DATA_TYPE.XML]: function(data){
            return 'data:text/xml;charset=utf-8,' + data
        },
        [DATA_TYPE.TEXT]: function(data){
            return data
        }
    }
    
    function getDataType(extension){
        if((/(json)/i).test(extension)) return DATA_TYPE.JSON
        else if((/(png|jpg|jpeg|gif)/i).test(extension)) return DATA_TYPE.IMAGE
        else if((/(mp3|ogg|wav)/i).test(extension)) return DATA_TYPE.AUDIO
        else if((/(fnt|xml)/i).test(extension)) return DATA_TYPE.XML
        else if((/(mp4|webm)/i).test(extension)) return DATA_TYPE.VIDEO
        else return DATA_TYPE.TEXT
    }
    
    function processFile(filename){
        var filepath = path.resolve(filename)
        return new Promise(function(resolve, reject){
            fs.lstat(filepath, function(err, stats){
                if(err) return reject(err)
                resolve(stats.isFile())
            })
        }).then(function(isFile){
            var extension = path.extname(filename).slice(1),
                dataType = getDataType(extension)
            return new Promise(function(resolve, reject){
                if(!isFile) return resolve(null)
                var encoding = dataType & (DATA_TYPE.IMAGE | DATA_TYPE.AUDIO | DATA_TYPE.VIDEO) ? 'base64' : 'utf8'
                fs.readFile(path.resolve(filename), {
                    encoding: encoding,
                    flag: 'r'
                }, function(err, data){
                    if(err) return reject(err)
                    var dataURI = FORMAT_DATA_URI[dataType](data, extension)
                    resolve({
                        data: dataURI,
                        name: filename
                    })
                })
            })
        })
    }
    
    grunt.registerMultiTask('jsonpacker', 'resource json bundling', function(){
        var done = this.async()
        
        grunt.log.writeln('Packing resources into JSON bundle.'['green'])
        Promise.all(this.files.map(function(file){
            return Promise.all(file.src.map(processFile))
            .then(function(resources){
                var destination = path.resolve(file.dest),
                    bundle = resources.filter(function(resource){ return !!resource })
                .reduce(function(resourceMap, resource){
                    resourceMap[resource.name] = resource.data
                    return resourceMap
                }, Object.create(null))
                return new Promise(function(resolve, reject){
                    fs.writeFile(destination, JSON.stringify(bundle, null, 0), function(err){
                        if(err) return reject(err)
                        console.log('\x1b[32m%s\x1b[0m', 'Bundle created ' + file.dest)
                        resolve()
                    })
                })
            })            
        })).catch(console.error.bind(console))
        .then(done)
    })
}