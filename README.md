# Figma plugin using Vue

## Project Setup

* Join [Figma Community Beta](https://forms.gle/5zC8iaAHrH2Erf5q9) program
* Open profile on Figma Desktop and select Plugins tab
* Create new Plugin and choose **Name** then choose **With UI & browser APIs**
* For more information follow [Figma Plugin Guide](#figma-plugin)
* Copy the **name** and **id** from your original Figma 
* Plugin's `menifest.json` file that you just created using earlier steps and paste that values in this project
* Remove the plugin you created from Figma Desktop
* Create new plugin but this time use **Link existing plugin** option and select `menifest.json` file from this project
* `ui` in the `manifest.json` is configured to `'UI/dist/index.html'` which holds the output of Vue SPA and directly used by the Figma Plugin.
* That was the final step now you can follow [Run Figma Plugin](#run-Figma-plugin)

## [UI Setup](UI/README.md)

Check out [instruction to setup Figma Plugin UI](UI/README.md)

## Figma Plugin

Below are the steps to get your plugin running. You can also find instructions at:

  https://www.figma.com/plugin-docs/setup/

This plugin template uses Typescript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

  https://nodejs.org/en/download/

Next, install TypeScript using the command:
```
  npm install -g typescript
```
Finally, in the directory of your plugin, get the latest type definitions for the plugin API by running:
```
  npm install --saveDev @figma/plugin-typings
```
If you are familiar with JavaScript, TypeScript will look very familiar. Valid JavaScript code
is already a valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (code.ts) into JavaScript (code.js)
for the browser to run.

### Run Figma Plugin

We recommend writing TypeScript code using Visual Studio Code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
    then select "tsc: watch - tsconfig.json". You will have to do this again every time you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.
