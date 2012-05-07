/*
* Less & AMD preprocessor for nodejs v 0.0.1
* @author: John Reading
*/

/* Config */


/* TODO: Change this to read files from directories directly */
var Css = {
	"modules/test.less" : "modules/test.min.css"
};

var Js = {
	"test" : "test.min.js",
	"foo" : "foo.min.js"
};


/* Less/CSS conversion */
var processLess = function() {
	log("\n** Processing Css **", blue);
	for (var file in Css) {
		exec("lessc --yui-compress _src/css/" + file + " > build/css/" + Css[file], showError);
		log("processed " + file, green);
	}
	processCss();
};

var processCss = function() {
	//TODO: Bundling for latency
};

// JS minification AMD bundling
var processJs = function() {
	log("\n** Processing Js **", blue);


	//AMD Bundling for latency
	var config = {
		baseUrl: "_src/js/modules/",
		wrap: true,
		optimize: "none",
		onBuildWrite: function (id, path, contents) {
			var defineRegExp = /define\s*\(\s*["'][^'"]+["']\s*,\s*\[[^\]]*\]\s*,function\s*?\(.*?\)\s*?\{/;
			//Remove AMD ceremony for use without require.js or almond.js
			contents =  contents.replace(defineRegExp, '')
			//Remove the trailing }) for the define call and any semicolon
			.replace(/\}\)(;)?\s*$/, '');
			return contents;
		}
	};

	for (var file in Js) {
		config.name = file;
		config.out = "build/js/modules/" + Js[file];
		requirejs.optimize(config);
		log("processed " + file, green);
	}

	// TODO: Minification for unbundled AMD

};

// Global functions and objects
var fs = require('fs');
var requirejs = require("./r.js");
var exec = require("child_process").exec;
var red   = '\u001b[31m';
var green = '\u001b[32m';
var blue  = '\u001b[34m';
var reset = '\u001b[0m';


var showError = function(error, stdout, stderr) {
    if (error !== null) {
      log("exec error: " + error, red);
    }
};

var log = function(str, color) {
	console.log(color + str + reset);
};

processLess();
processJs();

