/**
 * outer server wrapper
 */
/*jshint esnext: true */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, module*/

var fs = require('fs');
var copydir = require('copy-dir');

class TaskRunner {
  constructor() {
    this.root = 'dist';
    this.s_config = `${this.root}` + "/config";
    this.s_modules = `${this.root}` + "/node_modules";
  }
  run() {
    this.copyFile('package.json', `${this.root}/package.json`);
    this.copyFiles('config', this.s_config);
    this.copyFiles('node_modules', this.s_modules);
    console.log('finished...');
  }
  createdDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
  copyFile(source, dest) {
    console.log(`inprogess ${source} to ${dest}`)
    fs.copyFileSync(source, dest, (err) => {
      if (err) console.error('error while copying config: ', err);
      else console.log('source.txt was copied to destination.txt');
    });
    console.log(`finished ${source} to ${dest}`)
  }
  copyFiles(source, dest) {
    try {
      console.log(`inprogess ${source} to ${dest}`)
      this.createdDir(dest);
      copydir.sync(source, dest);
      console.log(`finished ${source} to ${dest}`)
    } catch (error) {
      console.error('error while copying config: ', error);
    }
  }
}

let _taskRunner = new TaskRunner();
_taskRunner.run();

//npm run server-prep-prod && node ./build/taskRunner.js && mocha --require babel-core/register --bail  test/**/*.js
