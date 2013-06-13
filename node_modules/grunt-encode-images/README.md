# grunt-encode-images

A grunt task for base64 encoding images in css

This task converts all image paths in css files with base64 encoded data-uri formatted strings.


## How to Use

Install this plugin with the command:

```js
npm install grunt-encode-images
```

Add the task to your gruntFile.js:

```js
grunt.loadNpmTasks("grunt-encode-images");
```
Example:

```js
grunt.initConfig({
 	encodeImages: {
        build: {
            files: [{
                expand: true,
                cwd: 'build/css/',
                src: '**/phone.min.css',
                dest: 'build/css/'
            }]
        }
    }
});
```

## License

The MIT License (MIT)

Copyright (c) 2013 ResonanceMultimedia LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
