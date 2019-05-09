#!/usr/bin/env node
'use strict';
const meow = require('meow');
const updateNotifier = require('update-notifier');
const fs = require("fs");
const path = require("path");
const filesize = require('filesize');
const logUpdate = require('log-update');
const globby = require("globby");
const chalk = require("chalk");
const isPathInside = require('is-path-inside');
const columnify = require('columnify');

const cli = meow(`
	Usage
	  $ sizof <path|glob> […]

	Examples
	  $ sizof unicorn.png rainbow.png
	  $ sizof '*.png' '!unicorn.png'

	Options
	  --json -j     Output the result as JSON
`, {
	flags: {
		json: {
			type: 'boolean',
			alias: 'j'
		},
	}
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	cli.showHelp();
}

let paths = cli.input;

const options = {
	base: 10,
	standard: "iec",
};

paths = (typeof paths === 'string' ? [paths] : paths).map(String);

paths = globby.sync(paths, {
	expandDirectories: false,
	nodir: false,
	nonull: true
});

paths = paths.map(filePath => path.resolve(filePath));

paths = paths.filter(filePath => {
	if (paths.some(otherPath => isPathInside(filePath, otherPath))) {
		return false;
	}

	try {
		return fs.lstatSync(filePath);
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	}
});

if (paths.length === 0) {
	return;
}

function render(data) {
	logUpdate(columnify(data, {
		headers: ['name', 'length'],
		columns: ['name', 'length'],
		showHeaders: false,
		truncate: true,
		config: {
			path: {
				showHeaders: false
			},
			name: {
				minWidth: 20,
				maxWidth: 30
			},
			length: {
				align: 'right',
				dataTransform: function(data) {
					return chalk.cyan(data);
				},
			}
		}
	}));
}

const result = paths.reduce( (p, absolutePath) => {
	try {
		let name = path.basename(absolutePath);
		let bytes = fs.lstatSync(absolutePath).size;
		let length = filesize(bytes);

		let obj = {
			name,
			bytes,
			length,
			path: absolutePath,
		};

		p.push(obj);

		if(!cli.flags.json){
			render(p);
		}

		return p;
	} catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}

		console.error(error);
	}

}, []);

if(cli.flags.json){
	console.log(JSON.stringify(result, null, 4));
}
