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

        //********************************************************************************
		//	Compile Require.JS Modules - TODO
		//********************************************************************************
		requirejs: {
            build: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    optimize: 'none',
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    mainConfigFile: ''
                }
            }
        },

		//********************************************************************************
		//	Optimize Presentation Layer
		//********************************************************************************
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

		//********************************************************************************
		//	Copy any Files that don't need processing to build - TODO
		//********************************************************************************
        copy: {
            build: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= cfg.dirs.source %>',
                    dest: '<%= cfg.dirs.build %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess'
                    ]
                }]
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

		uglify: {
			options: {
				//banner: '/*\n  <%= cfg.name %>\n  v<%= cfg.version %> - ' +
				//'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				//'  Copyright (c) <%= grunt.template.today("yyyy")%>\n*/\n',
				mangle : false
			},
            files: {
                expand: true,     // Enable dynamic expansion.
                cwd: '<%= cfg.dirs.source %><%= cfg.dirs.js %>',
                src: ['**/*.js'], // Actual pattern(s) to match.
                dest: '<%= cfg.dirs.build %><%= cfg.dirs.js %>'   // Destination path prefix.
            }
		},
		responsivePlus: {
			build: 'NO_CONFIG_HERE'
		}
	});

	//********************************************************************************
	//	Grunt Build Options - Executed from command line as "grunt taskname"
	//********************************************************************************
	
	//compile local: rp for Responsive Plus? Not sure....
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
        'cssmin'
	]);

	//Run Legacy Node Script - TO BE REMOVED
	grunt.registerTask('old', function (target) {
		grunt.task.loadTasks('tasks');
		grunt.task.run('responsivePlus');
    });

	//Set Default Task
	grunt.registerTask('default', ['build']);
};