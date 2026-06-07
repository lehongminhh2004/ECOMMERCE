import 'dotenv/config';
import { bootstrapWorker, JobQueueService, LanguageCode, RequestContextService } from '@vendure/core';
import { SearchIndexService } from '@vendure/core/dist/plugin/default-search-plugin/indexer/search-index.service';
import { firstValueFrom } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { config } from '../vendure-config';

const timeoutMs = Number(process.env.REINDEX_TIMEOUT_MS ?? 10 * 60 * 1000);

async function main() {
    const worker = await bootstrapWorker(config);
    const requestContextService = worker.app.get(RequestContextService);
    const searchIndexService = worker.app.get(SearchIndexService);
    const jobQueueService = worker.app.get(JobQueueService);

    await jobQueueService.start();

    const ctx = await requestContextService.create({
        apiType: 'admin',
        languageCode: LanguageCode.vi,
    });
    const job = await searchIndexService.reindex(ctx);
    console.log(`Search reindex job queued: ${job.id}`);

    const settledJob = await firstValueFrom(
        job.updates({ timeoutMs }).pipe(
            tap(update => console.log(`Search reindex ${update.state}: ${update.progress}%`)),
            filter(update => update.state === 'COMPLETED' || update.state === 'FAILED' || update.state === 'CANCELLED'),
        ),
    );

    await worker.app.close();

    if (settledJob.state !== 'COMPLETED') {
        throw new Error(`Search reindex finished with state ${settledJob.state}: ${settledJob.error ?? 'unknown error'}`);
    }

    console.log(`Search reindex completed: ${JSON.stringify(settledJob.result)}`);
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
