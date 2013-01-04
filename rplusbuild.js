/*
* Less.js & AMD preprocessor for ResponsivePlus sites v0.0.2
* nodejs v0.8
* @author: John Reading
*/

// Dependencies
var fs = require('fs');
var exec = require('child_process').exec;
var rplusbuild = require('commander');
var rjs = require('requirejs');
var less = require('less');
var jsp = require('uglify-js').parser;
var pro = require('uglify-js').uglify;

// Console colors
var red = '\u001b[31m';
var green = '\u001b[32m';
var yellow  = '\u001b[33m';
var blue  = '\u001b[34m';
var magenta  = '\u001b[35m';
var reset = '\u001b[0m';

// Global
var blnProcessing, moduleJs, mainCss, mainJs, sectionCss, sections, watching, config, coreJS, src, build, js, css, modules, compress;
var files = 0;
var arrFiles = [];
var arrLess = [];
var lessCount = 0;
var lessParser;

var init = function() {
	
	try {
		config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
		/* Commander Config */
		rplusbuild
			.version('v0.0.3 - Less.js & AMD preprocessor for ResponsivePlus')
			.option('-m,  --core <file>', 'core file; default: "config.core.name"', String, config.core.name)
			.option('-s,  --src <dir>', 'source dir; default: "config.dirs.source"', String, config.dirs.source)
			.option('-b,  --build <dir>', 'build dir; default: "config.dirs.build"', String, config.dirs.build)
			.option('-j, --js <dir>', 'javascript dir in src dir; default: "config.dirs.js.main"', String, config.dirs.js.main)
			.option('-m,  --modules <dir>', 'modules dir in js dir; default: "config.dirs.js.modules"', String, config.dirs.js.modules)
			.option('-l, --libs <dir>', 'javascript libs dir in js dir; default: "config.dirs.libs"', String, config.dirs.libs)
			.option('-c, --css <dir>', 'css dir in src dir; default: "config.dirs.css.main"', String, config.dirs.css.main)
			.option('-w, --watch', 'rebuild on file(s) save; default: "config.options.watch"', Boolean)
			.option('-x, --nocompress', 'do not compress output; default: "config.options.nocompress"', Boolean)
			.on('--help', function(){
				//nothing
			})
			.parse(process.argv);

		/*
			Pass in arguments with defaults
			TODO: Move these to config file
		*/
		coreJs = rplusbuild.core;
		src = rplusbuild.src;
		build = rplusbuild.build;
		libs = rplusbuild.libs;
		js = rplusbuild.js;
		css = rplusbuild.css;
		modules = rplusbuild.modules;
		watch = rplusbuild.watch || config.options.watch;
		compress = !rplusbuild.nocompress && !config.options.nocompress;

		moduleJs = fs.readdirSync(src + js + modules);
		libJs = fs.readdirSync(src + js + libs);
		sectionsJsDir = fs.readdirSync(src + js);
		mainCss = fs.readdirSync(src + css);
		sectionsCssDir = fs.readdirSync(src + css);
		mainJs = fs.readdirSync(src + js);

		log("********************************\n"+
		"**** rplusbuild.js - v0.0.3 ****\n"+
		"******************************** ", yellow);

		/* Start processing chain */
		processLess();
	} catch (e) {
		log(e,red);
	}
};



// Handle Less
var processLess = function() {
	var stat, length, i, cssFile;

	log("\n** Processing Less **");

	// Process Main Css
	length = mainCss.length;
	for (i = 0; i < length; i++) {
		cssFile = css + mainCss[i];
		stat = fs.statSync(src + cssFile);
		if (stat.isFile() && cssFile.indexOf('.less') > 0 && (cssFile.indexOf('.partial') < 0)) {
			arrLess.push(cssFile);
		}
	}

	// Process Section Css
	length = sectionsCssDir.length;
	for (i = 0; i < length; i++) {
		stat = fs.statSync(src + css + sectionsCssDir[i]);
		if (stat.isDirectory() && sectionsCssDir[i].indexOf(".") !== 0) {
			sectionCss = fs.readdirSync(src + css + sectionsCssDir[i]);
			var len = sectionCss.length;
			for (var j = 0; j < len; j++) {
				cssFile = css + sectionsCssDir[i] +"/"+ sectionCss[j];
				var outputDir = cssFile.substr(0,cssFile.lastIndexOf('/'));
				if (!fs.existsSync(build + outputDir)) {
					fs.mkdirSync(build + outputDir);
				}
				
				stat = fs.statSync(src + cssFile);
				if (stat.isFile() && cssFile.indexOf('.less') > 0 && (cssFile.indexOf('.partial') < 0)) {
					arrLess.push(cssFile);
				}
			}
			if (watch) {
				path = src + css + sectionsCssDir[i] + "/";
				addWatchedFile(path, sectionCss);
			}
			//
		}
	}
	//sync build
	lessParser = new(less.Parser)({
		paths: ['.', './' + src + css]
	});
	compileLess(arrLess[lessCount]);
};



// Less/CSS conversion
var compileLess = function(cssFile) {
	//readdirSync gets subdirectories
	var file = fs.readFileSync(src + cssFile, "utf-8");
	var base64Cnt = 0;
	var parsedLess, stat;

	lessParser.parse(file, function (err, tree) {
		if (err) {
			log("compileLess: " + cssFile + err, red);
		} else {
			//add css as var
			parsedLess = tree.toCSS({ compress: compress });

			//look for base64 encode flag
			if (cssFile.indexOf('phone') > -1) {

				parsedLess = parsedLess.replace(/url\(["']?(\S*)\.(png|jpg|jpeg|gif)["']?\)/g, function(match, file, type) {
					var fileName = build.replace('/','') + file + '.' + type;
					try {
						var base64 = fs.readFileSync(fileName).toString('base64');
						base64Cnt++;
						//log("   base64: " + fileName + " - done");
						return 'url(data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + ')';
					}
					catch (e) {
						log(fileName + ' does not exist. Remove it from the source: ' + cssFile, red);
						return 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)'; //transparent pixel gif
					}
					
				});
			}

			fs.writeFile(build + cssFile.replace(".less",".min.css"), parsedLess, "utf-8", function(){
				lessCount++;
				files++;
				if (cssFile.indexOf('phone') > -1) {
					log(cssFile.replace(".less",".min.css") + " - done ("+ base64Cnt +" images encoded)", green);
				} else {
					log(cssFile.replace(".less",".min.css") + " - done", green);
				}
				if (lessCount < arrLess.length) {
					compileLess(arrLess[lessCount]);
				} else {
					processJs();
				}
			});
		}
	});
};

// JS minification AMD bundling
var processJs = function() {
	var length, i, jsFile, blnOptimize, stats;
	var arrJs = [];

	// mkdir if not exist for r.js
	if (!fs.existsSync(build + js + modules)) {
		fs.mkdirSync(build + js + modules);
	}

	// mkdir if not exist for r.js
	if (!fs.existsSync(build + js + libs)) {
		fs.mkdirSync(build + js + libs);
	}

	log("\n** Processing Js **");

	blnOptimize = rplusbuild.nocompress ? "none" : "uglify" ;

	// R.js config
	var Rjsconfig = {
		baseUrl: src + js + modules,
		wrap: true,
		optimize: blnOptimize,
		skipModuleInsertion: true,
		uglify: {
			//beautify: true
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

	//build core files
	var core, file;
	var concat = "";
	var thinbundle = "";
	var minbundle = "";

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
	fs.writeFileSync(build + js + coreJs.replace(".js",".min.js"), core + ';' + minbundle, "utf-8");
	files++;
	log(js + coreJs.replace(".js",".min.js") + " - done", green);

	fs.writeFileSync(build  + js + coreJs.replace(".js",".thin.js"), core + ';' + thinbundle, "utf-8");
	files++;
	log(js + coreJs.replace(".js",".thin.js") + " - done", green);
	

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

	//move section js
	length = sectionsJsDir.length;
	for (i = 0; i < length; i++) {
		stat = fs.statSync(src + js + sectionsJsDir[i]);
		if (stat.isDirectory() && sectionsJsDir[i].indexOf(".") !== 0 && sectionsJsDir[i].indexOf("libs") < 0 && sectionsJsDir[i].indexOf("modules") < 0) {
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
					if (watch) {
						path = src + js + sectionsJsDir[i] + "/";
						addWatchedFile(path, sectionJs);
					}
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
	
	blnProcessing = false;
	
	log("\n("+files+") files affected.", yellow);
	
	if (watch) {
		log("\nWatching " + src + " directory for changes. Crtl+C to quit.\n", yellow);
		if (watching) return;
		watching = true;
		var i, length, stats, path;

		// Add Main Css
		path = src + css;
		addWatchedFile(path,mainCss);

		// Add Module Js
		path = src + js + modules;
		addWatchedFile(path,moduleJs);

		// Add Main Js
		path = src + js;
		addWatchedFile(path,mainJs);

		length = arrFiles.length;
		for (i = 0; i < length; i++) {
			fs.watch(arrFiles[i], function (event, filename) {
				if (!blnProcessing) {
					arrLess = [];
					lessCount = 0;
					files = 0;
					blnProcessing = true;
					log("Reprocessing changes", yellow);
					processLess();
				}
			});
		}
	}
};

var addWatchedFile = function(path, files) {
	var length = files.length;
	for (i = 0; i < length; i++) {

		stats = fs.statSync(path + files[i]);
		//readdirSync gets subdirectories
		if (stats.isFile() && files[i].indexOf(".") > 0) {
			arrFiles.push(path + files[i]);
		}
	}
};

//log with colors
var log = function(str, color) {
	if (!color) color = blue;
	console.log(color + str + reset);
};

init();
