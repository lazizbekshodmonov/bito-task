import cluster from 'cluster';
import os from 'os';
import { bootstrap } from './main';

// Round-robin scheduling policy for better load distribution
cluster.schedulingPolicy = cluster.SCHED_RR;

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  // Birinchi worker'ni ishga tushiramiz - u database sync qiladi
  const firstWorker = cluster.fork({ TYPEORM_SYNC: 'true' });

  firstWorker.on('message', (msg) => {
    if (msg === 'ready') {
      console.log('First worker is ready, starting remaining workers...');
      // Birinchi worker tayyor bo'lgandan keyin qolganlarini ishga tushiramiz
      for (let i = 1; i < numCPUs; i++) {
        cluster.fork({ TYPEORM_SYNC: 'false' });
      }
    }
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`);
    cluster.fork({ TYPEORM_SYNC: 'false' });
  });
} else {
  void bootstrap().then(() => {
    console.log(`Worker ${process.pid} started successfully`);
    // Master'ga tayyor ekanligimizni bildirish
    if (process.send) {
      process.send('ready');
    }
  });
}
