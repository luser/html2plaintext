#!/usr/bin/env node
var fs = require('fs');
var convert = require('./index.js');

var contents = fs.readFileSync(process.argv[2], 'utf8');
console.log(convert(contents));
