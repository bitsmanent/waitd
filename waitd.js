(function(window) {
"use strict";

var processes = [];

function load(p) {
	var pid = processes.length; /* next available pid */
	processes[pid] = p;
	return pid;
}

function exec(pid) {
	var p = processes[pid];

	p.start = new Date();
	p.tm = setTimeout(function() {
		p.callback(pid);
		processes[pid].tm = 0;
		processes[pid].rdelay = 0;
	}, p.delay);

	processes[pid].tm = p.tm;
	processes[pid].start = p.start;
}

function spawn(delay, callback) {
	var pid = load({
		delay: delay,
		rdelay: 0,
		tm: 0,
		start: 0,
		callback: callback
	});

	exec(pid);
	return pid;
}

function kill(pid) {
	var p = processes[pid];
	clearTimeout(p.tm);
	processes[pid].tm = 0;
}

function suspend(pid) {
	var	p = processes[pid],
		d = new Date();

	kill(pid);
	p.rdelay = (d - p.start);
}

function resume(pid) {
	processes[pid].tm = exec(pid, processes[pid].rdelay);
}

/* public */
window.waitd = window.w$ = waitd = {
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
		for(var c in cfg)
			processes[pid][c] = cfg[c];
		exec(pid);
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
})(window);
