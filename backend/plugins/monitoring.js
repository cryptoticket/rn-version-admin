/**
 * Fastify plugin attaches "monitoring" object to fastify
 */

const fastifyPlugin = require('fastify-plugin');
const promClient = require('prom-client');
const sysInfo = require('systeminformation');

// basic metrics
let gaugeCpuLoad = null;
let gaugeMemUsed = null;
let gaugeMemTotal = null;
let gaugeSwapUsed = null;
let gaugeSwapTotal = null;
let gaugeNetworkConnectionsAll = null;
let gaugeUptime = null;

/**
 * Plugin constructor 
 */
async function main(fastify, options) {
	// init basic metrics
	gaugeCpuLoad = new promClient.Gauge({ name: 'sys_info_current_load_currentload', help: 'CPU load in %' });
    gaugeMemUsed = new promClient.Gauge({ name: 'sys_info_mem_used', help: 'RAM memory used (incl. buffers/cache)' });
    gaugeMemTotal = new promClient.Gauge({ name: 'sys_info_mem_total', help: 'Total RAM memory in bytes' });
    gaugeSwapUsed = new promClient.Gauge({ name: 'sys_info_mem_swapused', help: 'SWAP used in bytes' });
    gaugeSwapTotal = new promClient.Gauge({ name: 'sys_info_mem_swaptotal', help: 'SWAP total in bytes' });
    gaugeNetworkConnectionsAll = new promClient.Gauge({ name: 'sys_info_network_connections_all', help: '# of all network connections' });
	gaugeUptime = new promClient.Gauge({ name: 'sys_info_time_uptime', help: 'System uptime in seconds' });
	// attach global "monitoring" object to fastify
	fastify.decorate('monitoring', { refreshCustomMetrics });
}

/**
 * Refreshes values for all custom metrics
 */
async function refreshCustomMetrics() {
    // basic metrics
    gaugeCpuLoad.set((await sysInfo.currentLoad()).currentload, Date.now());
    gaugeMemUsed.set((await sysInfo.mem()).used, Date.now());
    gaugeMemTotal.set((await sysInfo.mem()).total, Date.now());
    gaugeSwapUsed.set((await sysInfo.mem()).swapused, Date.now());
    gaugeSwapTotal.set((await sysInfo.mem()).swaptotal, Date.now());
    gaugeNetworkConnectionsAll.set((await sysInfo.networkConnections()).length, Date.now());
    gaugeUptime.set((await sysInfo.time()).uptime, Date.now());
}

// Wrapping a plugin function with fastify-plugin exposes the decorators,
// hooks, and middlewares declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(main);
