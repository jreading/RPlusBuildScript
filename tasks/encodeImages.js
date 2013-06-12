'use strict';

module.exports = function(grunt) {	
	var fs = require('fs');

	// Console colors
	var red = '\u001b[31m';
	var green = '\u001b[32m';
	var yellow  = '\u001b[33m';
	var blue  = '\u001b[34m';
	var reset = '\u001b[0m';


	//log with colors
	var log = function(str, color) {
		if (!color) color = blue;
		console.log(color + str + reset);
	};

	//********************************************************************************
	//	Register The Grunt Task To Run
	//********************************************************************************
	grunt.task.registerMultiTask('encodeImages', 'Encode css images to base64 data-uri for mobile.', function() {
		try {
			
			var destDir = this.files[0].dest.split('/')[0]; 

			this.files.forEach(function(f) {
				var valid = f.src.filter(function(filepath) {
					// Warn on and remove invalid source files (if nonull was set).
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('Source file "' + filepath + '" not found.');
						return false;
					} else {
						return true;
					}
				});

				var base64Cnt = 0;

				var file = fs.readFileSync(f.src.toString(), "utf-8");
				file = file.replace(/url\(["']?(\S*)\.(png|jpg|jpeg|gif)["']?\)/g, function(match, file, type) {
					var fileName = destDir.replace('/','') + file + '.' + type;

					try {
						var base64 = fs.readFileSync(fileName).toString('base64');
						base64Cnt++;
						//log("   base64: " + fileName + " - done");
						return 'url(data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + ')';
					}
					catch (e) {
						log(fileName + ' does not exist. Remove it from the source: ' + valid, red);
						return 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)'; //transparent pixel gif
					}

				});
				grunt.file.write(f.dest, file);
				log(f.dest + ' (' + base64Cnt + ' image encoded)');
			});

		} catch (e) {
			log(e,red);
		};
	});
};