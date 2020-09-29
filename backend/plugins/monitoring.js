/**
 * Fastify plugin attaches "monitoring" object to fastify
 */

const fastifyPlugin = require('fastify-plugin');
const promClient = require('prom-client');
const sysInfo = require('systeminformation');

// timestamp when service went online
const SERVICE_STARTED_AT = Math.floor((new Date()).getTime() / 1000);
// how often to reset metrics
const TIMEOUT_RESET_METRICS_SECONDS = 86400;

// timestamp when was the last metrics reset
let lastMetricsResetAt = null;

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
    // reset metrics
    resetMetricsIfNeeded();
    // basic metrics
    gaugeCpuLoad.set((await sysInfo.currentLoad()).currentload, Date.now());
    gaugeMemUsed.set((await sysInfo.mem()).used, Date.now());
    gaugeMemTotal.set((await sysInfo.mem()).total, Date.now());
    gaugeSwapUsed.set((await sysInfo.mem()).swapused, Date.now());
    gaugeSwapTotal.set((await sysInfo.mem()).swaptotal, Date.now());
    gaugeNetworkConnectionsAll.set((await sysInfo.networkConnections()).length, Date.now());
    gaugeUptime.set((await sysInfo.time()).uptime, Date.now());
}

/**
 * Removes metrics from RAM(if needed) because metrics can load server heavily
 */
function resetMetricsIfNeeded() {
    const now = Math.floor((new Date()).getTime() / 1000);
    const lastMetricsResetOrStart = lastMetricsResetAt || SERVICE_STARTED_AT;
    if ((now - lastMetricsResetOrStart) > TIMEOUT_RESET_METRICS_SECONDS) {
        lastMetricsResetAt = now;
        promClient.register.resetMetrics();
    }
}

// Wrapping a plugin function with fastify-plugin exposes the decorators,
// hooks, and middlewares declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(main);
