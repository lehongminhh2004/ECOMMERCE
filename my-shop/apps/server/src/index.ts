import { bootstrap, bootstrapWorker, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

async function start() {
    if (process.argv.includes('--run-migrations')) {
        await runMigrations(config);
        return;
    }

    await bootstrap(config);

    if (process.env.RUN_WORKER_IN_PROCESS === 'true') {
        const { DefaultSchedulerPlugin } = require('@vendure/core');
        const workerConfig = {
            ...config,
            plugins: (config.plugins || []).map(p => {
                const name = typeof p === 'function' ? p.name : (p as any)?.constructor?.name;
                if (name === 'DefaultSchedulerPlugin' || name === 'SchedulerPlugin') {
                    return DefaultSchedulerPlugin.init({ tasks: [] });
                }
                return p;
            }),
        };
        const worker = await bootstrapWorker(workerConfig);
        await worker.startJobQueue();
    }
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
