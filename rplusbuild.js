/*
* Less & AMD preprocessor for nodejs v 0.0.1
* @author: John Reading
*/

// Dependencies
var fs = require('fs');
var exec = require("child_process").exec;
var rplusbuild = require('commander');
var rjs = require("requirejs");
var less = require('less');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
var path = require('path');

/* Commander Config */
rplusbuild
  .version('0.0.1')
  .option('-s, --src <dir>', 'source directory', String, "_src/")
  .option('-b, --build <dir>', 'build directory', String, "build/")
  .option('-js, --js <dir>', 'javascript directory', String, "js/")
  .option('-css, --css <dir>', 'css directory', String, "css/")
  .option('-m, --modules <dir>', 'modules directory', String, "modules/")
  .parse(process.argv);

/* Pass in arguments with defaults */
var src = rplusbuild.src;
var build = rplusbuild.build;
var js = rplusbuild.js;
var css = rplusbuild.css;
var modules = rplusbuild.modules;

// Console colors
var red = '\u001b[31m';
var green = '\u001b[32m';
var yellow  = '\u001b[33m';
var blue  = '\u001b[34m';
var reset = '\u001b[0m';

// Get files for processing
var moduleCss, moduleJs, mainCss, mainJs, totalCssFiles, totalJsFiles;
var files = 0;

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
		// TODO: Make this proper Sync
		exec("mkdir -p " + build + css + modules);
		processLess();
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

	processJs();
};

// Less/CSS conversion
var compileLess = function(cssFile) {
	var parser = new(less.Parser)();

	try {
		var stats = fs.statSync(src + cssFile);

		if (!stats.isFile()) { //readdirSync gets subdirectories
			totalCssFiles--;
		} else {
			// TODO: add compression options as args
			var file = fs.readFileSync(src + cssFile, "utf-8");
			
			parser.parse(file, function (err, tree) {
				if (err) {
					log(err, red);
				} else {
					fs.writeFileSync(build + cssFile.replace(".less",".min.css"), tree.toCSS({ compress: true }), "utf-8");
				}
			});

			log(cssFile + " - done", green);

			files++;
		}

	} catch(err){
		log(err,red);
	}
};

// Bundle and mv css files
var processCss = function() {
	//TODO: Bundling for latency
	log("\n** Branching Css **");

	//Bundling and moving around devices
	log("forking for devices here", yellow);

	processJs();

};

// JS minification AMD bundling
var processJs = function() {
	log("\n** Processing Js **");

	var length, i, jsFile;

	// R.js config
	var config = {
		baseUrl: src + js + modules,
		wrap: true,
		optimize: "uglify",
		onBuildWrite: function (id, path, contents) {
			var defineRegExp = /define.*?\{/;
			//Remove AMD ceremony for use without require.js or almond.js
			contents =  contents.replace(defineRegExp, '')
			//Remove the trailing }) for the define call and any semicolon
			.replace(/\}\)(;)?\s*$/, '');
			return contents;
		}
	};

	length = moduleJs.length;

	for (i = 0; i < length; i++) {
		jsFile = js + modules + moduleJs[i];
		config.name = moduleJs[i].replace(".js","");
		config.out = build + jsFile.replace(".js",".min.js");
		try {
			rjs.optimize(config);
			log(jsFile + " - done", green);
			files++;
		} catch(err){
			log(err,red);
		}
	}

	length = mainJs.length;

	for (i = 0; i < length; i++) {
		jsFile = js + mainJs[i];
		try {
			var stats = fs.statSync(src + jsFile);
			if (!stats.isFile()) { //readdirSync gets subdirectories
				totalJsFiles--;
			} else {
				// TODO: add compression options as args
				var file = fs.readFileSync(src + jsFile, "utf-8");
				var ast = jsp.parse(file); // parse code and get the initial AST
				ast = pro.ast_mangle(ast); // get a new AST with mangled names
				ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
				var out = pro.gen_code(ast); // compressed code here
				
				fs.writeFileSync(build + jsFile, out, "utf-8"); // write file here
				
				log(jsFile + " - done", green);

				files++;
			}
		} catch(err){
			log(err,red);
		}
	}

		finish();
};

var finish = function() {
	log("\n("+files+") files affected.", yellow);
};

//log with colors
var log = function(str, color) {
	if (!color) color = blue;
	console.log(color + str + reset);
};

init();