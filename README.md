# Sizof

> Get size of file and folders

Accepts paths and [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).

![sizof animation](screenshot.gif)

## Install

```
$ npm install --dev sizof
```

or

```
$ npm install --global sizof
```

## Usage

```
$ sizof --help

  Usage
    $ sizof <path|glob> [...]

  Examples
    $ sizof bundler.js
    $ sizof '*.js' '!*.min.js'

  Options
    --json -j     Output the result as JSON

```

## Tip

Add script in your `package.json` to check size of build folder.

```
"scripts": {
  "size": "sizof dist/*.min.*"
}
```

## License

MIT © [Gabriel Nobrega](https://github.com/ganobrega)
