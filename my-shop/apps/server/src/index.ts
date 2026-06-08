import { bootstrap, bootstrapWorker, DefaultSchedulerPlugin, runMigrations, VendureConfig } from '@vendure/core';
import { config } from './vendure-config';

function getPluginName(plugin: unknown): string | undefined {
    if (typeof plugin === 'function') {
        return plugin.name;
    }

    if (plugin && typeof plugin === 'object') {
        const pluginRecord = plugin as { name?: string; plugin?: { name?: string } };
        return pluginRecord.name || pluginRecord.plugin?.name;
    }
}

function omitSchedulerPlugin(vendureConfig: VendureConfig): VendureConfig {
    return {
        ...vendureConfig,
        plugins: (vendureConfig.plugins || []).filter(plugin => getPluginName(plugin) !== DefaultSchedulerPlugin.name),
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
        // Worker also runs without the SchedulerPlugin to prevent duplicate
        // cron job registration in the same Node process.
        const workerConfig = omitSchedulerPlugin(config);
        const worker = await bootstrapWorker(workerConfig);
        await worker.startJobQueue();
    }
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
