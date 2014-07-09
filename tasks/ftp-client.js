var spawn = require('child_process').spawn,
	_ = require('underscore');

var escapeshell = function(cmd) {
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

/*
** Params :
** {
**   host: 'domain.com', // required
**   username: 'Test', // required
**   password: 'Test', // required
**   protocol: 'sftp', // optional, values : 'ftp', 'sftp', 'ftps', ... default: 'ftp'
**   // protocol is added on beginning of host, ex : sftp://domain.com in this case
** }
**
** Usage :
** ftp.cd('to_maleamassage').rm('./test.txt').exec(console.log);
*/

var FTPClient = function(options) {
	this.initialize(options);
	this.cmds = [];
};

FTPClient.prototype = {

	initialize: function(options) {
		var defaults = {
			host: '',
			username: '',
			password: '',
			cmd: ''
		};
		var opts = _.pick(_.extend(defaults, options), 'host', 'username', 'password', 'cmd');
		if (!opts.host) throw new Error('You need to set a host.');
		if (!opts.username) throw new Error('You need to set an username.');
		if (!opts.password) throw new Error('You need to set a password.');
		if (typeof options.protocol === 'string' && options.protocol && opts.host.indexOf(options.protocol) !== 0)
			opts.host = options.protocol + '://' + options.host;
		this.options = opts;
	},

	exec: function(cmds, callback) {
		if (typeof cmds === 'string')
			cmds = cmds.split(';');
		if (Array.isArray(cmds))
			this.cmds = this.cmds.concat(cmds);
		if (typeof cmds === 'function' && !callback)
			callback = cmds;
		if (!callback)
			throw new Error('callback is missing to exec() function.')
		var cmd = '';
		cmd += 'open -u '+ escapeshell(this.options.username) + ',' + escapeshell(this.options.password) + ' ' + this.options.host + ( !!this.options.cmd ? (' -e "' + this.options.cmd + '"') : '' ) + ';';
		cmd += this.cmds.join(';');
		this.cmds = [];
		var lftp = spawn('lftp', ['-c', cmd]);
		var data = "";
		var error = "";
		lftp.stdout.on('data', function (res) {
			data += res;
		});
		lftp.stderr.on('data', function (res) {
			error += res;
		});
		lftp.on('error', function ( err ) {
			if (callback)
				callback(err, { error: error || null, data: data });
			callback = null; // Make sure callback is only called once, whether 'exit' event is triggered or not.
		});
		lftp.on('exit', function (code) {
			if (callback)
				callback(null, { error: error || null, data: data });
		});
		return this;
	},

	raw: function(cmd) {
		if (cmd && typeof cmd === 'string')
			this.cmds.push(cmd);
		return this;
	},

	ls: function() {
		return this.raw('ls');
	},

	pwd: function() {
		return this.raw('pwd');
	},

	cd: function(directory) {
		return this.raw('cd ' + escapeshell(directory));
	},

	cat: function(path) {
		return this.raw('cat ' + escapeshell(path));
	},

	put: function(localPath, remotePath) {
		if (!localPath)
			return this;
		if (!remotePath)
			return this.raw('put '+escapeshell(localPath));
		return this.raw('put '+escapeshell(localPath)+' -o '+escapeshell(remotePath));
	},

	addFile: this.put,

	get: function(remotePath, localPath) {
		if (!remotePath)
			return this;
		if (!localPath)
			return this.raw('get '+escapeshell(remotePath));
		return this.raw('get '+escapeshell(remotePath)+' -o '+escapeshell(localPath));
	},

	getFile: this.getFile,

	mv: function(from, to) {
		if (!from || !to)
			return this;
		return this.raw('rm ' + escapeshell(from) + ' ' + escapeshell(to));
	},

	move: this.mv,

	rm: function() {
		return this.raw('rm ' + Array.prototype.slice.call(arguments).map(escapeshell).join(' '));
	},

	remove: this.rm

};

module.exports = {
	FTPClient: FTPClient
};