const cluster = require('cluster');
const os = require('os');

// Simple, production-friendly clustering for HTTP workloads.
// - Master forks N workers (default: CPU count)
// - Workers run the normal app entry (index.js)
// - If a worker dies, master respawns it

const cpuCount = os.cpus()?.length || 1;
const requestedWorkersRaw = Number(process.env.WEB_CONCURRENCY);
const requestedWorkers = Number.isFinite(requestedWorkersRaw) ? requestedWorkersRaw : cpuCount;

const workers = Math.max(1, Math.min(requestedWorkers, cpuCount));

if (cluster.isPrimary) {
  console.log(`[cluster] primary pid=${process.pid} starting ${workers} workers`);

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(
      `[cluster] worker pid=${worker.process.pid} exited code=${code} signal=${signal}; restarting...`
    );
    cluster.fork();
  });
} else {
  require('./index');
}
