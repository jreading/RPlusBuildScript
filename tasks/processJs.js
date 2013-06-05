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
	var jsp = require('uglify-js').parser;
	var pro = require('uglify-js').uglify;

	// Console colors
	var red = '\u001b[31m';
	var green = '\u001b[32m';
	var yellow  = '\u001b[33m';
	var blue  = '\u001b[34m';
	var reset = '\u001b[0m';

	// Global
	var moduleJs, mainJs, sections, config, coreJS, src, build, libs, libJs, sectionsJsDir, js, modules, compress, sectionJs, stat, path, options;
	var files = 0;

	// JS minification AMD bundling
	var processJs = function() {
		var length, i, jsFile, blnOptimize, stats, core, file;
		var arrJs = [];
		var concat = "";
		var thinbundle = "";
		var minbundle = "";

		log("\n** Processing Js **");
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

			blnOptimize = "uglify" ;
			// R.js config
			var Rjsconfig = {
				baseUrl: src + js + modules,
				wrap: true,
				optimize: blnOptimize,
				skipModuleInsertion: true,
				uglify: {
					beautify: options.beautify
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
						log(jsFile.replace(".js",".thin.js") + " - done", green);
						files++;
					} catch(err){
						log("processJs - Module : " + jsFile + err,red);
					}

					file = applyCompression(fs.readFileSync(src + jsFile, "utf-8"));
					files++;
					fs.writeFileSync(build + jsFile, file, "utf-8");
					log(jsFile + " - done", green);

				}
			}

			try {
				for (i = 0; i < config.core.min.include.length; i++) {
					file = fs.readFileSync(src + js + config.core.min.include[i], "utf-8") + '\n\n';
					file = config.core.min.include[i].indexOf('.min') > -1 ? file : applyCompression(file) + ';';
					minbundle += file;
				}
				for (i = 0; i < config.core.thin.include.length; i++) {
					file = fs.readFileSync(src + js + config.core.thin.include[i], "utf-8") + '\n\n';
					file = config.core.thin.include[i].indexOf('.min') > -1 ? file : applyCompression(file) + ';';
					thinbundle += file;
				}
				core = applyCompression(fs.readFileSync(src + js + config.core.name, "utf-8"));
			} catch(err){
				log("processJs - Core : " + err,red);
			}

			// write core files
			fs.writeFileSync(build + js + coreJS.replace(".js",".min.js"), core + ';' + minbundle, "utf-8");
			files++;
			log(js + coreJS.replace(".js",".min.js") + " - done", green);

			fs.writeFileSync(build  + js + coreJS.replace(".js",".thin.js"), core + ';' + thinbundle, "utf-8");
			files++;
			log(js + coreJS.replace(".js",".thin.js") + " - done", green);
			
			//move libs
			length = libJs.length;
			for (i = 0; i < length; i++) {
				jsFile = js + libs + libJs[i];
				stats = fs.statSync(src + jsFile);
				if (stats.isFile() && libJs[i].indexOf('.js') > 0) {
					file = fs.readFileSync(src + jsFile, "utf-8");
					file = jsFile.indexOf('.min') > -1 ? file : applyCompression(file);
					files++;
					fs.writeFileSync(build + jsFile, file, "utf-8");
					log(jsFile + " - done", green);
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
						file = jsFile.indexOf('.min') > -1 ? file : applyCompression(file);
						files++;
						fs.writeFileSync(build + jsFile, file, "utf-8");
						log(jsFile + " - done", green);
					}
				}
			}
		}

		finish();
	};

	var applyCompression = function(file) {
		if (compress) {
			var ast = jsp.parse(file);
			// get a new AST with mangled names
			ast = pro.ast_mangle(ast);
			// get an AST with compression optimizations
			ast = pro.ast_squeeze(ast);
			// compressed code here
			return pro.gen_code(ast);
		} else {
			return file;
		}
	};

	var finish = function() {
		log("\n("+files+") files affected.", yellow);
	};


	//log with colors
	var log = function(str, color) {
		if (!color) color = blue;
		console.log(color + str + reset);
	};

	//********************************************************************************
	//	Register The Grunt Task To Run
	//********************************************************************************
	grunt.task.registerMultiTask('processJs', 'Wrapping the existing JS Node Script in a Grunt Task.', function() {
		try {
			config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
			/*
				Pass in arguments with defaults
			*/
			options = this.options({
				beautify: false
			});

			coreJS = config.core.name;
			src = config.dirs.source;
			build = config.dirs.build;
			libs = config.dirs.libs;
			js = config.dirs.js.main;
			modules = config.dirs.js.modules;
			compress = !config.options.nocompress;
			sections = config.dirs.sections;

			moduleJs = fs.readdirSync(src + js + modules);
			libJs = fs.readdirSync(src + js + libs);
			sectionsJsDir = fs.readdirSync(src + js);
			mainJs = fs.readdirSync(src + js);

			if (sections) {
				log("Building only: " + sections,red);
			}

			/* Start processing chain */
			processJs();
		} catch (e) {
			log(e,red);
		};
	});
};
