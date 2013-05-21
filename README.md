RPlusBuildScript
================

A modular js and LESS css grunt build script for ResponsivePlus sites.


clone repo and run:

```
grunt rp
```
This will currently clean, compile the .less to .css, and run watch. With watch, any time a .less file is modified, the watch process triggers a re-compile. 

Running
```
grunt build
```
This will currently clean, compile .less to .css, image minification handle image minification, css minification, and run the processJs task


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
