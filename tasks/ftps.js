/*
 * grunt-ftps
 * https://github.com/pkz/ftps
 *
 * Copyright (c) 2014 Felipe K. De Boni
 * Licensed under the MIT license.
 */

'use strict';

var FTPClient = require('./ftp-client').FTPClient;

var _path = require('path');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('ftps', 'Send files through FTPS', function() {
    // =============================================================================================
    // VARS
    // =============================================================================================
    var client,
        directoriesChecked,
        dirs,
        done,
        filesToUpload;

    directoriesChecked = [];
    dirs = [];
    done = this.async();
    filesToUpload = [];

    var options = this.options({
      ftp: {
        host: null,
        username: null,
        password: null,
        protocol: 'ftps'
      },
      remoteDir: null
    });

    // =============================================================================================
    // CONNECT
    // =============================================================================================
    var connect = function() {
      client = new FTPClient( options.ftp );
    };

    // =============================================================================================
    // ENSURE DIRECTORY EXISTS
    // =============================================================================================
    var ensureDirectories = function() {
      var i = 0;
      grunt.log.writeln( 'Ensuring directories:' );

      var ensureDir = function( dir ) {
        grunt.log.ok( options.remoteDir + dir );

        if ( directoriesChecked.indexOf( dir ) > -1 && ((i + 1) < dirs.length) ) {
          directoriesChecked.push( dir );
          i += 1;
          ensureDir( dirs[ i ] );
        } else if ( i >= dirs.length ) {
          uploadFiles();
        } else {
          directoriesChecked.push( dir );
          client
            .raw( 'mkdir -p "' + options.remoteDir + dir + '"' )
            .exec(function( err, res ) {
              if ( err ) {
                grunt.log.error( err );
              }

              if ( (i + 1) < dirs.length ) {
                 i += 1;
                ensureDir( dirs[ i ] );
              } else {
                uploadFiles();
              }
            });
        }
      };

      if ( dirs.length > 0 ) {
        ensureDir( dirs[0] );
      }
    };

    // =============================================================================================
    // UPLOAD
    // =============================================================================================
    var tries = 3;
    var uploadFiles = function() {
      var i = 0,
          filesFailed = [];

      var upload = function( file ) {
        var destination = _path.join( options.remoteDir, file ).replace(/\\/g, '/');
        grunt.log.writeln( '' );
        grunt.log.writeln( 'Uploading file: ' + destination );

        client
          .put( file, destination )
          .exec(function( err, res ) {
            if ( err ) {
              grunt.log.warn( 'Upload failed for: ' + file );
              filesFailed.push( file );
            } else {
              grunt.log.ok( 'File uploaded: ' + file );
            }

            if ( (i + 1) < filesToUpload.length ) {
              i += 1;
              upload( filesToUpload[ i ] );
            } else if ( filesFailed.length > 0 && tries > 0 ) {
              tries -= 1;
              grunt.log.writeln( 'Retrying to upload failed files...' );
              tries -= 1;
              filesToUpload = filesFailed;
              uploadFiles();
            } else {
              done();
            }
          });
      };

      upload( filesToUpload[0] );
    };

    // =============================================================================================
    // PROCESS
    // =============================================================================================
    var process = function() {
      connect();

      if ( dirs.length > 0 ) {
        ensureDirectories();
      } else {
        uploadFiles();
      }
    };

    var endProcess = function() {
      done();
    };

    // =============================================================================================
    // FOR EACH FILES AND START MAGIC
    // =============================================================================================
    this.files.forEach(function( file ) {

      var src = file.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      })[0];

      if ( grunt.file.isFile( src ) ) {
        filesToUpload.push( src );
      }

      var dirname = _path.dirname(src);
      if ( dirname !== '.' && dirname !== '..' ) {
        dirs.push( _path.dirname(src) );
      }
    });

    if ( filesToUpload.length > 0 ) {
      dirs = dirs.filter(function( value, index, self ) {
        return self.indexOf(value) === index;
      });

      process();
    } else {
      done();
    }
  });

};