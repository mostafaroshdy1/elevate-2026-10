import { Worker } from "node:worker_threads";
import { randomUUID } from "node:crypto";

interface WorkerJob {
  id: string;
  sharedBuffer: SharedArrayBuffer;
  count: number;
  resolve: (mean: number) => void;
  reject: (error: Error) => void;
}

interface WorkerResult {
  id: string;
  mean?: number;
  error?: string;
}

interface WorkerSlot {
  worker: Worker;
  busy: WorkerJob | null;
  dead: boolean;
}

const MAX_ALLOWED_WORKERS = 1;

class WorkerPool {
  private workers: WorkerSlot[] = [];
  private queue: WorkerJob[] = [];

  constructor(size: number) {
    for (let i = 0; i < size; i++) {
      this.createWorker();
    }
  }

  private createWorker(): void {
    const isTypeScript = import.meta.url.endsWith(".ts");

    const worker = new Worker(
      new URL(
        isTypeScript
          ? "./mean-temperature-worker.ts"
          : "./mean-temperature-worker.js",
        import.meta.url,
      ),
      isTypeScript
        ? { execArgv: ["--import", "tsx"] }
        : {},
    );

    const slot: WorkerSlot = {
      worker,
      busy: null,
      dead: false,
    };

    this.workers.push(slot);

    worker.on("message", (message: WorkerResult) => {
      const job = slot.busy;

      if (!job) return;

      if (message.id !== job.id) {
        this.handleWorkerFailure(
          slot,
          new Error("Worker returned an unexpected job ID"),
        );
        return;
      }

      slot.busy = null;

      if (message.error) {
        job.reject(new Error(message.error));
      } else if (typeof message.mean === "number") {
        job.resolve(message.mean);
      } else {
        job.reject(new Error("Invalid worker response"));
      }

      this.dispatch();
    });

    worker.on("error", (error) => {
      this.handleWorkerFailure(
        slot,
        error instanceof Error ? error : new Error(String(error)),
      );
    });

    worker.on("exit", (code) => {
      if (!slot.dead) {
        this.handleWorkerFailure(
          slot,
          new Error(`Worker exited unexpectedly with code ${code}`),
        );
      }
    });
  }

  private handleWorkerFailure(
    slot: WorkerSlot,
    error: Error,
  ): void {
    if (slot.dead) return;

    slot.dead = true;

    this.workers = this.workers.filter(
      (workerSlot) => workerSlot !== slot,
    );

    if (slot.busy) {
      slot.busy.reject(error);
      slot.busy = null;
    }

    void slot.worker.terminate();

    this.createWorker();
    this.dispatch();
  }

  private dispatch(): void {
    for (const slot of this.workers) {
      if (slot.dead || slot.busy) continue;

      while (this.queue.length > 0) {
        const job = this.queue.shift()!;

        slot.busy = job;

        try {
          slot.worker.postMessage({
            id: job.id,
            sharedBuffer: job.sharedBuffer,
            count: job.count,
          });

          break;
        } catch (error) {
          slot.busy = null;

          job.reject(
            error instanceof Error
              ? error
              : new Error("Failed to send job to worker"),
          );
        }
      }
    }
  }

  public run(
    sharedBuffer: SharedArrayBuffer,
    count: number,
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const job: WorkerJob = {
        id: randomUUID(),
        sharedBuffer,
        count,
        resolve,
        reject,
      };

      this.queue.push(job);
      this.dispatch();
    });
  }
}

const workerPool = new WorkerPool(MAX_ALLOWED_WORKERS);

export const calculateMeanTemperature = (
  sharedBuffer: SharedArrayBuffer,
  count: number,
): Promise<number> => {
  return workerPool.run(sharedBuffer, count);
};