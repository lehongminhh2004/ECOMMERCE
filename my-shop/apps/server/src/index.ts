import { bootstrap, bootstrapWorker, DefaultSchedulerPlugin, runMigrations, VendureConfig } from '@vendure/core';
import { config } from './vendure-config';

function omitSchedulerPlugin(vendureConfig: VendureConfig): VendureConfig {
    return {
        ...vendureConfig,
        plugins: (vendureConfig.plugins || []).filter(plugin => plugin !== DefaultSchedulerPlugin),
    };
}

async function start() {
    if (process.argv.includes('--run-migrations')) {
        await runMigrations(config);
        return;
    }

    const runWorkerInProcess = process.env.RUN_WORKER_IN_PROCESS === 'true';
    const serverConfig = runWorkerInProcess ? omitSchedulerPlugin(config) : config;

    await bootstrap(serverConfig);

    if (runWorkerInProcess) {
        const worker = await bootstrapWorker(config);
        await worker.startJobQueue();
    }
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
