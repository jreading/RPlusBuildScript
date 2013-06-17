RPlusBuildScript
================

A modular js and Compass grunt build script for ResponsivePlus sites.


clone repo and run:

```
grunt build
```
This will currently clean, compile .scss to .css, image minification, css minification, and run the amd processing task


Example Dir Structure:
---
```
    root
    | - _src
         | - js
              core.js
              | - modules
                   my-module.js
         | - css
              base.scss
              phone.scss
              tablet.scss
              desktop.scss
              | - section
                   base.scss
                   phone.scss
                   tablet.scss
                   desktop.scss
    | - build
```
