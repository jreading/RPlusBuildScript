/*
* Less.js & AMD preprocessor for ResponsivePlus sites v0.0.5
* nodejs v0.8
* JA - Pulled out JUST the javascript processing in a Grunt Task
* @author: John Reading
*/

'use strict';

module.exports = function(grunt) {	
	// Dependencies
	var fs = require('fs');
	var rjs = require('requirejs');


	// Global
	var moduleJs, mainJs, sections, config, coreJS, src, build, libs, libJs, sectionsJsDir, js, modules, sectionJs, stat, path, options;
	var files = 0;

	// JS minification AMD bundling
	var processJs = function() {
		var length, i, jsFile, blnOptimize, stats, core, file;
		var arrJs = [];
		var concat = "";
		var thinbundle = "";
		var minbundle = "";

		// mkdir if not exist for r.js
		if(!fs.existsSync(build + js)){
			fs.mkdirSync(build + js);
		}

		if (!sections) {
			if (!fs.existsSync(build + js + modules)) {
				fs.mkdirSync(build + js + modules);
			}
			if (!fs.existsSync(build + js + libs)) {
				fs.mkdirSync(build + js + libs);
			}


			// R.js config
			var Rjsconfig = {
				baseUrl: src + js + modules,
				wrap: true,
				optimize: "none",
				skipModuleInsertion: true,
				uglify: {
					beautify: false
				},
				onBuildWrite: function (id, path, contents) {
					if ((/define\(.*?\{/).test(contents)) {
						//Remove AMD ceremony for use without require.js or almond.js
						contents = contents.replace(/define\(.*?\{/, '')
						//remove last return statement and trailing })
						.replace(/return.*[^return]*$/,'');
					}
					return contents;
				}
			};

			// Create thin version of modules (no AMD loading or require/almond need)
			length = moduleJs.length;
			for (i = 0; i < length; i++) {
				jsFile = js + modules + moduleJs[i];
				stats = fs.statSync(src + jsFile);
				if (stats.isFile() && moduleJs[i].indexOf('.js') > 0) {
					Rjsconfig.name = moduleJs[i].replace(".js","");
					Rjsconfig.out = build + jsFile.replace(".js",".thin.js");
					try {
						rjs.optimize(Rjsconfig);
						grunt.log.writelns("File " + jsFile.replace(".js",".thin.js") + " created.");
						files++;
					} catch(err){
						grunt.log.errorlns("processJs - Module : " + jsFile + err);
					}

					file = fs.readFileSync(src + jsFile, "utf-8");
					files++;
					fs.writeFileSync(build + jsFile, file, "utf-8");
					grunt.log.writelns("File " + jsFile + " created.");

				}
			}

			try {
				for (i = 0; i < config.core.min.include.length; i++) {
					file = fs.readFileSync(src + js + config.core.min.include[i], "utf-8") + '\n\n';
					file = config.core.min.include[i].indexOf('.min') > -1 ? file : file + ';';
					minbundle += file;
				}
				for (i = 0; i < config.core.thin.include.length; i++) {
					file = fs.readFileSync(src + js + config.core.thin.include[i], "utf-8") + '\n\n';
					file = config.core.thin.include[i].indexOf('.min') > -1 ? file : file + ';';
					thinbundle += file;
				}
				core = fs.readFileSync(src + js + config.core.name, "utf-8");
			} catch(err){
				grunt.log.errorlns("processJs - Core : " + err);
			}

			// write core files
			fs.writeFileSync(build + js + coreJS.replace(".js",".min.js"), core + ';' + minbundle, "utf-8");
			files++;
			grunt.log.writelns("File " + js + coreJS.replace(".js",".min.js") + " created.");

			fs.writeFileSync(build  + js + coreJS.replace(".js",".thin.js"), core + ';' + thinbundle, "utf-8");
			files++;
			grunt.log.writelns("File " + js + coreJS.replace(".js",".thin.js") + " created.");
			
			//move libs
			length = libJs.length;
			for (i = 0; i < length; i++) {
				jsFile = js + libs + libJs[i];
				stats = fs.statSync(src + jsFile);
				if (stats.isFile() && libJs[i].indexOf('.js') > 0) {
					file = fs.readFileSync(src + jsFile, "utf-8");
					file = jsFile.indexOf('.min') > -1 ? file : file;
					files++;
					fs.writeFileSync(build + jsFile, file, "utf-8");
					grunt.log.writelns("File " + jsFile + " - moved.");
				}
			}
		}

		//move section js
		length = sectionsJsDir.length;
		for (i = 0; i < length; i++) {
			stat = fs.statSync(src + js + sectionsJsDir[i]);
			// mkdir if not exist for r.js
			if(stat.isDirectory() && !fs.existsSync(build + js + sectionsJsDir[i])){
				fs.mkdirSync(build + js + sectionsJsDir[i]);
			}
			if (stat.isDirectory() && sectionsJsDir[i].indexOf(".") !== 0 && sectionsJsDir[i].indexOf("libs") < 0 && sectionsJsDir[i].indexOf("modules") < 0 && (sections.indexOf(sectionsJsDir[i]) > -1 || !sections)) {
				sectionJs = fs.readdirSync(src + js + sectionsJsDir[i]);
				var len = sectionJs.length;
				for (var j = 0; j < len; j++) {
					jsFile = js + sectionsJsDir[i] +"/"+ sectionJs[j];
					if (jsFile.indexOf(".") !== 0 && jsFile.indexOf('.js') > 0) {

						var outputDir = jsFile.substr(0,jsFile.lastIndexOf('/'));
						if (!fs.existsSync(build + outputDir)) {
							fs.mkdirSync(build + outputDir);
						}
						file = fs.readFileSync(src + jsFile, "utf-8");
						file = jsFile.indexOf('.min') > -1 ? file : file;
						files++;
						fs.writeFileSync(build + jsFile, file, "utf-8");
						grunt.log.writelns("File " + jsFile + " - moved.");
					}
				}
			}
		}

		finish();
	};


	var finish = function() {
		grunt.log.oklns("\n("+files+") files affected.");
	};



	//********************************************************************************
	//	Register The Grunt Task To Run
	//********************************************************************************
	grunt.task.registerMultiTask('processJs', 'Wrapping the existing JS Node Script in a Grunt Task.', function() {
		try {
			config = JSON.parse(fs.readFileSync('config.json', 'ascii'));

			coreJS = config.core.name;
			src = config.dirs.source;
			build = config.dirs.build;
			libs = config.dirs.libs;
			js = config.dirs.js.main;
			modules = config.dirs.js.modules;
			sections = config.dirs.sections;

			moduleJs = fs.readdirSync(src + js + modules);
			libJs = fs.readdirSync(src + js + libs);
			sectionsJsDir = fs.readdirSync(src + js);
			mainJs = fs.readdirSync(src + js);

			if (sections) {
				grunt.log.errorlns("Building only: " + sections);
			}

			/* Start processing chain */
			processJs();
		} catch (e) {
			grunt.log.errorlns(e);
		}
	});
};
