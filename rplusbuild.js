/*
* Less & AMD preprocessor for nodejs v 0.0.1
* @author: John Reading
*/

/* Config */
/* TODO: pass in arguments with defaults */
var src = "_src/";
var build = "build/";
var js = "js/";
var css = "css/";
var modules = "modules/";

// Dependencies
var fs = require('fs');
var rjs = require("./r.js");
var exec = require("child_process").exec;

// Console colors
var red = '\u001b[31m';
var green = '\u001b[32m';
var yellow  = '\u001b[33m';
var blue  = '\u001b[34m';
var reset = '\u001b[0m';

// Get files for processing
var Css = fs.readdirSync(src + css + modules);
var Js = fs.readdirSync(src + js + modules);
var files = 0;

// Less/CSS conversion
var processLess = function() {
	log("\n** Processing Less **");
	var length = Css.length;
	for (var i = 0; i < length; i++) {
		var cssFile = css + modules + Css[i];
		try {
			exec("lessc --yui-compress " + src + cssFile + " > " + build + cssFile.replace(".less",".min.css"), function(error, stdout, stderr) {
				log("Processed " + cssFile, green);
				files++;
				if (i == length) processCss(); //simulate async exec calls.
			});
		} catch (err) {
			log(err,red);
		}
	}
};

// Bundle and mv css files
var processCss = function() {
	//TODO: Bundling for latency
	log("\n** Processing Css **");
	//Bundling and moving around

	processJs();

};

// JS minification AMD bundling
var processJs = function() {
	log("\n** Processing Js **");
	var length = Js.length;

	//AMD Bundling for latency
	var config = {
		baseUrl: src + js + modules,
		wrap: true,
		optimize: "none",
		onBuildWrite: function (id, path, contents) {
			var defineRegExp = /define.*?\{/;
			//Remove AMD ceremony for use without require.js or almond.js
			contents =  contents.replace(defineRegExp, '')
			//Remove the trailing }) for the define call and any semicolon
			.replace(/\}\)(;)?\s*$/, '');
			return contents;
		}
	};


	for (var i = 0; i < length; i++) {
		var jsFile = js + modules + Js[i];
		config.name = Js[i].replace(".js","");
		config.out = build + jsFile.replace(".js",".min.js");
		try {
			rjs.optimize(config);
			log("Processed " + jsFile, green);
			files++;
		} catch(err){
			log(err,red);
		}
	}
	log("\n("+files+") files affected.", yellow);
};

//log with colors
var log = function(str, color) {
	if (!color) color = blue
	console.log(color + str + reset);
};
log("********************************\n"+
	"**** rplusbuild.js - v0.0.1 ****\n"+
	"******************************** ", yellow);
processLess();

