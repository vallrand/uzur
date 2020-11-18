module.exports = function(grunt){
    require('load-grunt-tasks')(grunt)
    grunt.loadTasks('tasks')
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        clean: {
            all: {
                files: [{
                    src: ['output/']
                }]
            }
        },
        
        copy: {
            resources: {
                files: [{
                    expand: true,
                    cwd: './static',
                    src: ['*.*'],
                    dest: 'output/'
                }]
            }
        },
        
        browserify: {
            main: {
                options: {
                    transform: [
                        ['babelify']
                    ]
                },
                files: {
                    'output/main.js': ['src/main.js']
                }
            }
        },
        
        uglify: {
            options: {
                mangle: true,
                preserveComments: false,
                compress: true
            },
            main: {
                files: {
                    'output/main.js': ['output/main.js']
                }
            }
        },
        
        connect: {
            local: {
                options: {
                    port: 8888,
                    base: 'output',
                    hostname: '*',
                    keepalive: false
                }
            }
        },
        
        jsonpacker: {
            resources: {
                files: [{
                    src: ['assets/**'],
                    dest: 'src/bundle.json'
                }]
            }
        },
        
        watch: {
            script: {
                files: ['src/**'],
                tasks: ['browserify:main'],
                options: {
                    atBegin: true
                }
            }
        }
    })
    
    grunt.registerTask('build', ['clean:all', 'copy:resources', 'jsonpacker', 'browserify:main', 'uglify:main'])
    grunt.registerTask('run', ['connect:local', 'watch:script'])
}