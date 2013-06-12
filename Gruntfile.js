'use strict';
module.exports = function (grunt) {

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
		//	LESS Preprocessing to CSS
		//********************************************************************************
		less: {
			build: {
				files: [{
					expand: true,												//Dynamic Files
					cwd: '<%= cfg.dirs.source %><%= cfg.dirs.css.main %>',		//Working Directory
					src: ['**/{desktop,phone,tablet}.less'],					//Patterns To Match Recursive Directories
					dest: '<%= cfg.dirs.build %><%= cfg.dirs.css.main %>',		//Output Directory
					ext: '.min.css'												//Extension from less to css
				}]
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
                }],
                destDir: '<%= cfg.dirs.build %>'
            }
        },

		//********************************************************************************
		//	Watch files and run Grunt tasks
		//********************************************************************************
		watch: {
            less: {
                files: ['<%= cfg.dirs.source %><%= cfg.dirs.css.main %>**/*.less'],
                tasks: ['less'] //Compilation task here
            }
        },

		processJs: {
			build: {
                options: {
                    beautify : false
                }
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
            'less',
            'watch'
		]);
    });

	//Compile for Primetime 
	//"grunt build"
	grunt.registerTask('build', [
        'clean',
        'less',
        'imagemin',
        'cssmin',
        'encodeImages',
        //'requirejs' //TO REPLACE PROCESSJS
        'processJs' //LEGACY FOR NOW
        //'uglify' //TO REPLACE PROCESSJS
	]);

	//Set Default Task
	grunt.registerTask('default', ['build']);
    grunt.task.loadTasks('tasks');
};