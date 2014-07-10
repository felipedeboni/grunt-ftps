# grunt-ftps

> Send files through FTP or FTPS

## Requirements
You need to have `lftp` installed and in your system path.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-ftps --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ftps');
```

## The "ftps" task

### Overview
In your project's Gruntfile, add a section named `ftps` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ftps: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.ftp.host
Type: `String`
Default value: null

Host to connect

#### options.ftp.username
Type: `String`
Default value: null

User to authenticate

#### options.ftp.password
Type: `String`
Default value: null

The user password

#### options.ftp.cmd
Type: `String`
Default value: null

A command to pass in "-e" option of `lftp`

#### options.ftp.protocol
Type: `String`
Default value: 'ftps' // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp'

A command to pass in "-e" option of `lftp`

#### options.remoteDir
Type: `String`
Default value: null

The working directory on remote server ( please note that this directory should exists )

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  ftps: {
    options: {
      // ...
    },
    'myTask': {
      files: [
        {
          expand: true,
          cwd: 'some-path',
          src: [ 'some-files' ]
        }
      ]
    }
  }
});
```