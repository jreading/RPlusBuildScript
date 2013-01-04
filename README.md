RPlusBuildScript
================

A modular js and LESS css build script for ResponsivePlus sites.


clone repo and run:

```
node rplusbuild.js
```
---
Usage
---

```
rplusbuild.js [options]

  Options:

	-h, --help            output usage information
	-V, --version         output the version number
 	-m, --core            core file; default: "core.js"
	-s,  --src <dir>      source dir; default: "_src/"
 	-b,  --build <dir>    build dir; default: "build/"
	-js, --js <dir>       javascript dir in src dir; default: "js/"
	-css, --css <dir>     css dir in src dir; default: "css/"
	-m,  --modules <dir>  modules dir in css|js dir; default: "modules/"
	-w, --watch           rebuild on file(s) save
```

Example Dir Structure:
---
```
    root
    | - _src
         | - js
              core.js
              | - modules
                   my-module.js
                   my-module.touch.js
         | - css
              base.less
              phone.less
              tablet.less
              desktop.less
              | - section
                   base.less
                   phone.less
                   tablet.less
                   desktop.less
    | - build
```
