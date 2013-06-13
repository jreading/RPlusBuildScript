'use strict';

module.exports = function(grunt) {

	grunt.task.registerMultiTask('encodeImages', 'Encode css images to base64 data-uri for mobile.', function() {
		try {
			var destDir, cssFile, cssFilepath, base64Cnt;

			this.files.forEach(function(f) {
				var valid = f.src.filter(function(filepath) {
					if (!grunt.file.exists(filepath)) {
						grunt.log.warn('Source file "' + filepath + '" not found.');
						return false;
					} else {
						cssFile = grunt.file.read(filepath);
						cssFilepath = filepath;
						return true;
					}
				});

				cssFile = cssFile.replace(/url\(["']?(\S*)\.(png|jpg|jpeg|gif)["']?\)/g, function(match, img, type) {
					var fileAbs = grunt.file.isPathAbsolute(img);
					var cssDirs, dirUps, i, base64;

					base64Cnt = 0;
					
					if (fileAbs) {
						destDir = f.dest.split('/')[0];
					} else {
						cssDirs = cssFilepath.substr(0,cssFilepath.lastIndexOf('/')).split('/');
						dirUps = img.match(/(.)\1/g).length;
						img = img.replace('../','');
						destDir = '';
						for (i = 0; i < dirUps; i++) {
							destDir += cssDirs[i] + '/';
						}
					}

					img = destDir + img + '.' + type;

					try {
						base64 = grunt.file.read(img,{encoding: 'base64'});
						base64Cnt++;
						return 'url(data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + ')';
					}
					catch (e) {
						grunt.log.warn(img + ' does not exist. Fix: ' + valid);
						return 'url(data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)'; //transparent pixel gif
					}
				});
				grunt.file.write(f.dest, cssFile);
				grunt.log.oklns(f.dest + ' (' + base64Cnt + ' image encoded)');
			});

		} catch (e) {
			grunt.log.errorlns(e);
		}
	});
};