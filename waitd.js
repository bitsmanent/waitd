(function(window) {
"use strict";

var
	processes = [],

	getnewpid = function() {
		return processes.length;
	},

	load = function(p) {
		var pid = getnewpid();
		processes[pid] = p;
		return pid;
	},

	exec = function(pid, delay) {
		var p = processes[pid];

		return setTimeout(function() {
			p.callback(pid);
			processes[pid].tm = 0;
			processes[pid].rdelay = 0;
		}, delay);
	},

	run = function(pid) {
		var p = processes[pid];

		p.start = new Date();
		p.tm = exec(pid, p.delay);

		processes[pid].tm = p.tm;
		processes[pid].start = p.start;
	},

	spawn = function(delay, callback) {
		var pid = load({
			delay: delay,
			rdelay: 0,
			tm: 0,
			start: 0,
			callback: callback
		});

		run(pid);
		return pid;
	},

	kill = function(pid) {
		var p = processes[pid];
		clearTimeout(p.tm);
		processes[pid].tm = 0;
	},

	suspend = function(pid) {
		var	p = processes[pid],
			d = new Date();

		kill(pid);
		p.rdelay = (d - p.start);
	},

	resume = function(pid) {
		processes[pid].tm = exec(pid, processes[pid].rdelay);
	};

/* API */
var waitd = {
	play: function(d, c) {
		if(c === undefined) {
			resume(d);
			return;
		}

		return spawn(d, c);
	},

	stop: suspend,

	update: function(pid, cfg) {
		kill(pid);
		for(var c in cfg) {
			processes[pid][c] = cfg[c];
		}
		run(pid);
	},

	getproc: function(pid) {
		return processes[pid];
	},

	issuspend: function(pid) {
		var p = processes[pid];
		return (p.tm == 0 && p.rdelay != 0);
	},

	isactive: function(pid) {
		var p = processes[pid];
		return (p.tm != 0);
	},

	isfinish: function(pid) {
		var p = processes[pid];
		return (p.tm == 0 && p.rdelay == 0);
	}
};

window.waitd = window.w$ = waitd;
})(window);
