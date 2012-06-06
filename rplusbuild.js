/*
* Less.js & AMD preprocessor for ResponsivePlus sites v0.0.1
* nodejs v0.6.17
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
var path = require('path');

/* Commander Config */
rplusbuild
	.version('0.0.2')
	.option('-s,  --src <dir>', 'source dir; default: "_src/"', String, '_src/')
	.option('-b,  --build <dir>', 'build dir; default: "build/"', String, 'build/')
	.option('-j, --js <dir>', 'javascript dir in src dir; default: "js/"', String, 'js/')
	.option('-c, --css <dir>', 'css dir in src dir; default: "css/"', String, 'css/')
	.option('-m,  --modules <dir>', 'modules dir in css|js dir; default: "modules/"', String, 'modules/')
	.option('-w, --watch', 'rebuild on file(s) save', Boolean, false)
	.option('-x, --nocompress', 'do not compress output', Boolean, false)
	.on('--help', function(){
		//nothing
	})
	.parse(process.argv);

/* Pass in arguments with defaults */
var src = rplusbuild.src;
var build = rplusbuild.build;
var js = rplusbuild.js;
var css = rplusbuild.css;
var modules = rplusbuild.modules;
var compress = !rplusbuild.nocompress;

// Console colors
var red = '\u001b[31m';
var green = '\u001b[32m';
var yellow  = '\u001b[33m';
var blue  = '\u001b[34m';
var magenta  = '\u001b[35m';
var reset = '\u001b[0m';

// Get files for processing
var moduleCss, moduleJs, mainCss, mainJs, totalCssFiles, totalJsFiles;
var files = 0;
var arrFiles = [];

var init = function() {
	log("********************************\n"+
	"**** rplusbuild.js - v0.0.1 ****\n"+
	"******************************** ", yellow);
	try {
		moduleCss = fs.readdirSync(src + css + modules);
		moduleJs = fs.readdirSync(src + js + modules);
		mainCss = fs.readdirSync(src + css);
		mainJs = fs.readdirSync(src + js);
		totalCssFiles = moduleCss.length + mainCss.length;
		totalJsFiles = moduleJs.length + mainJs.length;
		processLess();
	} catch (e) {
		log(e,red);
	}
};

// Handle Less
var processLess = function() {
	log("\n** Processing Less **");

	var length, i, cssFile;

	// mkdir if not exist for lessc
	if (!path.existsSync(build + css + modules)) {
		exec("mkdir -p " + build + css + modules, function(){
			processLess();
		});
		return;
	}

	// Process Module Css
	length = moduleCss.length;
	for (i = 0; i < length; i++) {
		cssFile = css + modules + moduleCss[i];
		compileLess(cssFile);
	}

	// Process Main Css
	length = mainCss.length;
	for (i = 0; i < length; i++) {
		cssFile = css + mainCss[i];
		compileLess(cssFile);
	}

	// TODO: Create Full.css for responsive fallback
	log("TODO: Create Full.css for responsive fallback", magenta);

	processJs();
};

// Less/CSS conversion
var compileLess = function(cssFile) {
	var parser = new(less.Parser)({
		paths: ['.', './_src/css']
	});

	try {
		var stats = fs.statSync(src + cssFile);
		//readdirSync gets subdirectories
		if (!stats.isFile()) {
			totalCssFiles--;
		} else {
			if (cssFile.indexOf('.partial') < 0) {
				var file = fs.readFileSync(src + cssFile, "utf-8");
				
				parser.parse(file, function (err, tree) {
					if (err) {
						log(err, red);
					} else {
						//do not write out min only files
						fs.writeFileSync(build + cssFile.replace(".less",".min.css"), tree.toCSS({ compress: compress }), "utf-8");
					}
				});

				log(cssFile.replace(".less",".min.css") + " - done", green);

				files++;
			}
		}

	} catch(err){
		log(err,red);
	}
};

// JS minification AMD bundling
var processJs = function() {
	log("\n** Processing Js **");

	var length, i, jsFile, blnOptimize;
	var arrJs = [];
	blnOptimize = rplusbuild.nocompress ? "none" : "uglify" ;
	// R.js config
	var config = {
		baseUrl: src + js + modules,
		wrap: true,
		optimize: blnOptimize,
		uglify: {
			//beautify: true
		},
		onBuildWrite: function (id, path, contents) {
			//Remove AMD ceremony for use without require.js or almond.js
			contents = contents.replace(/define.*?\{/, '')
			//Remove the trailing }) for the define call and any semicolon
			.replace(/\}\)(;)?\s*$/, '')
			//remove last return statment
			.replace(/return.*[^return]*$/,'');
			return contents;
		}
	};

	// Create thin version of modules (no AMD loading or require/almond need)
	length = moduleJs.length;
	for (i = 0; i < length; i++) {
		jsFile = js + modules + moduleJs[i];
		config.name = moduleJs[i].replace(".js","");
		config.out = build + jsFile.replace(".js",".thin.js");
		try {
			rjs.optimize(config);
			log(jsFile.replace(".js",".thin.js") + " - done", green);
			files++;
		} catch(err){
			log(err,red);
		}
	}

	// Create array of all js files relative to src
	length = moduleJs.length;
	for (i = 0; i < length; i++) {
		arrJs.push(modules + moduleJs[i]);
	}
	arrJs = mainJs.concat(arrJs);

	// Uglify all js for standard amd implement
	length = arrJs.length;
	var out;
	for (i = 0; i < length; i++) {
		jsFile = js + arrJs[i];
		try {
			var stats = fs.statSync(src + jsFile);
			//readdirSync gets subdirectories
			if (!stats.isFile()) {
				totalJsFiles--;
			} else {
				// TODO: add compression options as args
				var file = fs.readFileSync(src + jsFile, "utf-8");
				// parse code and get the initial AST
				var ast = jsp.parse(file);
				if (compress) {
					// get a new AST with mangled names
					ast = pro.ast_mangle(ast);
					// get an AST with compression optimizations
					ast = pro.ast_squeeze(ast);
					// compressed code here
					out = pro.gen_code(ast);
				} else {
					out = file;
				}
				// write file here
				fs.writeFileSync(build + jsFile.replace(".js",".min.js"), out, "utf-8");
				log(jsFile.replace(".js",".min.js") + " - done", green);
				files++;
			}
		} catch(err){
			log(err,red);
		}
	}
	/// TODO: Create core.thin.js file
	log("TODO: Create core.thin.js file", magenta);
	finish();
};

var finish = function() {
	log("\n("+files+") files affected.", yellow);
	if (rplusbuild.watch) {
		log("\nWatching " + src + " directory for changes. Crtl+C to quit.\n", yellow);
		
		var i, length, stats, path;

		// Add Module Css
		path = src + css + modules;
		addWatchedFile(path,moduleCss);

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
				log("Reprocessing changes", yellow);
				files = 0;
				processLess();
			});
		}
	}
};

var addWatchedFile = function(path, files) {
	var length = files.length;
	for (i = 0; i < length; i++) {
		stats = fs.statSync(path + files[i]);
		//readdirSync gets subdirectories
		if (stats.isFile()) {
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