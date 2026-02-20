const os = require('os');
const cluster = require('cluster');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const WORKERS = parseInt(process.env.WEB_CONCURRENCY || String(os.cpus().length), 10);

if (cluster.isPrimary && WORKERS > 1) {
  for (let i = 0; i < WORKERS; i++) cluster.fork();
  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  app.listen(PORT, () => {});
}
