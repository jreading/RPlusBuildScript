
module.exports = function (grunt) {
    'use strict';

	//	Load in build dependenies - using matchdep module to load in one line.
    require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);

    //	Or you can do them individually like so outside of the grunt.initConfig():
	//	grunt.loadNpmTasks('grunt-name-of-task-in-node_modules-folder');
	//	Install Packages to the package.json file i.e.
	//	npm install grunt-package-name --save

	//Initializing Grunt Configuration
	grunt.initConfig({
		//	Read in the Package File
		cfg: grunt.file.readJSON('config.json'),

        //********************************************************************************
		//	Cleans out temporary and build directories
		//********************************************************************************
		clean: {
            build: ['<%= cfg.dirs.build %>'],
            tmp: ['<%= cfg.dirs.tmp %>']
        },

        //********************************************************************************
		//	Compass Preprocessing to CSS
		//********************************************************************************
		compass: {                              // Task
            dist: {
                options: {              // Target options
                    sassDir: '<%= cfg.dirs.source %><%= cfg.dirs.css.main %>',
                    specify: '**/{desktop,phone,tablet}.scss',
                    cssDir: '<%= cfg.dirs.tmp %><%= cfg.dirs.css.main %>'
                  }
            }
        },

        imagemin: {
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= cfg.dirs.source %><%= cfg.dirs.images %>',
                    src: '**/*.{png,jpg,jpeg}',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.images %>'
                }]
            }
        },

        cssmin: {
            build: {
				options: {
					keepSpecialComments : 0
				},
                files: [{
                    expand: true,
                    cwd: '<%= cfg.dirs.tmp %><%= cfg.dirs.css.main %>',
                    src: '**/*.css',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>',
                    ext: '.min.css'
                }]
            }
        },

        encodeImages: {
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>',
                    src: '**/phone.min.css',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>'
                }]
            }
        },

		//********************************************************************************
		//	Watch files and run Grunt tasks
		//********************************************************************************
		watch: {
            all: {
                files: ['<%= cfg.dirs.source %>**'],
                tasks: ['build'] //Compilation task here
            },
            css: {
                files: ['<%= cfg.dirs.source %><%= cfg.dirs.css.main %>**'],
                tasks: ['build-css'] //Compilation task here
            },
            js: {
                files: ['<%= cfg.dirs.source %><%= cfg.dirs.js.main %>**'],
                tasks: ['build-js'] //Compilation task here
            }
        },

		processJs: {
			build: {
                files: [{
                    expand: true,
                    cwd: '<%= cfg.dirs.build %><%= cfg.dirs.js.main %>',
                    src: '**/*.js',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.js.main %>'
                }]
            }
		},

        uglify: {
            options: {
              mangle: false
            },
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= cfg.dirs.build %><%= cfg.dirs.js.main %>',
                    src: '**/*.js',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.js.main %>'
                }]
            }
          }
	});

	//********************************************************************************
	//	Grunt Build Options - Executed from command line as "grunt taskname"
	//********************************************************************************
	
	grunt.registerTask('build-css', function(){
        grunt.task.run([
            'compass',
            'imagemin',
            'cssmin',
            'encodeImages',
            'clean:tmp',
            'watch:css'
        ]);
    });

    grunt.registerTask('build-js', function(){
        grunt.task.run([
            'processJs',
            'uglify',
            'clean:tmp',
            'watch:js'
        ]);
    });

	grunt.registerTask('build', [
        'clean',
        'imagemin',
        'build-css',
        'build-js',
        'clean:tmp',
        'watch:all'
	]);

	//Set Default Task
	grunt.registerTask('default', ['build']);
    grunt.task.loadTasks('tasks');
};
