RPlusBuildScript
================

A modular js and Compass grunt build script for ResponsivePlus and RESS sites. 

There are two profiles created from source files: Mobile (high latency/low cache) and Non-Mobile (low latency/high cache)

Mobile:

*   Modules and their dependencies are bundled and stripped of AMD as *.thin files for mobile. 
*   Css files contain base64 encoded images.
*   Core file is concatenated from config.core.thin

Non-Mobile:

*   Core file is concatenated from config.core.min including require.js for async loading in the client.


clone repo and run:

```
grunt build
```

This will currently clean, compile .scss to .css and minify, optimize images, process modules.


```
grunt build-css
```

This will currently clean, compile .scss to .css and minify, optimize images, and run the amd processing task.


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
              _base.scss
              phone.scss
              tablet.scss
              desktop.scss
              | - section
                   _base.scss
                   phone.scss
                   tablet.scss
                   desktop.scss
    | - build
         | - js
              core.min.js
              core.thin.js
              | - modules
                   my-module.js
                   my-module.thin.js
         | - css
              phone.min.css
              tablet.min.css
              desktop.min.css
              | - section
                   phone.min.css
                   tablet.min.css
                   desktop.min.css
    
```
