#!/usr/bin/env node

'use strict';
const chalk = require('chalk');
const columnify = require('columnify');
const filesize = require('filesize');
const fs = require('fs');
const globby = require('globby');
const meow = require('meow');
const boxen = require('boxen');
const path = require('path');
const updateNotifier = require('update-notifier');

const cli = meow(
	`
	Usage
	  $ sizof <path|glob> […]

	Examples
	  $ sizof bundler.js
	  $ sizof '*.js' '!*.min.js'

	Options
	  --json -j        Output the result as JSON
	  --in-zip -i      Output the result if compressed to zip
`,
	{
		flags: {
			json: {
				type: 'boolean',
				alias: 'j',
			},
		},
	}
);

updateNotifier({ pkg: cli.pkg }).notify();

if (cli.input.length === 0) {
	cli.showHelp();
}

const configs = {
	columnify: {
		headers: ['name', 'length'],
		columns: ['name', 'length'],
		showHeaders: false,
		truncate: true,
		config: {
			path: {
				showHeaders: false,
			},
			name: {
				minWidth: 20,
			},
			length: {
				align: 'right',
				dataTransform: function(value) {
					return chalk.cyan(value);
				},
			},
		},
	},
	boxen: {
		padding: 1,
	},
};

let paths = cli.input;

(async () => {
	paths = (typeof paths === 'string' ? [paths] : paths).map(String);

	paths = globby.sync(paths, {
		expandDirectories: false,
		nodir: false,
		nonull: true,
	});

	paths = paths.map(filePath => path.resolve(filePath));

	if (paths.length === 0) {
		return;
	}

	let total = 0;

	const data = paths.reduce((p, absolutePath, i) => {
		try {
			let name = path.relative(process.cwd(), absolutePath);
			let bytes = fs.lstatSync(absolutePath).size;
			let length = filesize(bytes);

			let obj = {
				name,
				path: absolutePath,
				bytes,
				length,
			};

			p.push(obj);


			total += bytes;

			return p;
		} catch (error) {
			if (error.code === 'ENOENT') {
				return false;
			}

			console.error(error);
		}
	}, []);

	let footer = [
		`Found: ${data.length}`,
		`Total size: ${filesize(total)}`,
	].join('\n');

	let output = [
		columnify(data, configs.columnify),
		'\n\n',
		boxen(footer, configs.boxen),
	].join('');

	if (cli.flags.json) {
		console.log(JSON.stringify(data, null, 4));
	} else {
		console.log(output);
	}

})();
