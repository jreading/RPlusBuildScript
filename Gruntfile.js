
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
            build: ['<%= cfg.dirs.build %>']
        },

        //********************************************************************************
		//	Compass Preprocessing to CSS
		//********************************************************************************
		compass: {                              // Task
            dist: {
                options: {              // Target options
                    sassDir: '<%= cfg.dirs.source %><%= cfg.dirs.css.main %>',
                    specify: '**/{desktop,phone,tablet}.scss',
                    cssDir: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>',
                    environment: 'production'
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
                    cwd: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>',
                    src: '**/*.css',
                    dest: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>'
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
            compass: {
                files: ['<%= cfg.dirs.source %><%= cfg.dirs.css.main %>**/*.scss'],
                tasks: ['compass'] //Compilation task here
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
	
	//"grunt rp"
	grunt.registerTask('rp', function(){
		grunt.task.run([
            'clean',
            'compass',
            'watch'
		]);
    });

	//Compile for Primetime
	//"grunt build"
	grunt.registerTask('build', [
        'clean',
        'compass',
        'imagemin',
        'cssmin',
        'encodeImages',
        'processJs',
        'uglify'
	]);

	//Set Default Task
	grunt.registerTask('default', ['build']);
    grunt.task.loadTasks('tasks');
};