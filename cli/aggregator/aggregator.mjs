import { globby } from "globby";
import { execSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { existsSync, mkdirSync, openSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

/** @typedef {{ config: string; sources: string, includeHtml: boolean, output: string, open: boolean }} Options */
/** @typedef {{ progress: number, error: Error }} Events */

export class AggregatorError extends Error {
  /** @type {ExecException} */
  internalError;

  /** @param {string} message */
  /** @param {ExecException} internalError  */
  constructor(message, internalError) {
    super(message);

    this.name = "BuilderError";
    this.internalError = internalError;
  }
}

export class Aggregator {
  /** @type {Options} */
  options;

  /** @type {EventEmitter<Events>} */
  events = new EventEmitter();

  /** @param {Options} options  */
  constructor(options) {
    this.options = options;
  }

  async aggregate() {
    this.events.emit("progress", 0);

    if (this.options.config) {
      try {
        this.options = await this.#getConfig();
      } catch (error) {
        this.#sendError(error);
        return;
      }
    }

    try {
      mkdirSync(this.options.output, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        this.#sendError(error);
        return;
      }
    }

    try {
      execSync(`cp -r ./app/build/* ${this.options.output}`);
    } catch (error) {
      this.#sendError(error);
      return;
    }

    this.events.emit("progress", 25);

    const jsonReports = await globby(this.options.sources);

    this.events.emit("progress", 50);

    try {
      const sources = [];

      if (this.options.includeHtml) {
        for (const jsonReport of jsonReports) {
          const report = { json: jsonReport };
          const htmlReport = `${dirname(jsonReport)}/index.html`;

          if (existsSync(htmlReport)) {
            report.html = htmlReport;
          }

          sources.push(report);
        }
      } else {
        sources.push(...jsonReports.map((report) => ({ json: report })));
      }

      const fd = openSync(this.#getPath("sources.json"), "w");
      writeFileSync(fd, JSON.stringify(sources));
    } catch (error) {
      this.#sendError(error);
      return;
    }

    this.events.emit("progress", 100);
  }

  /**
   * @param {string} filename
   * @returns string
   */
  #getPath(filename) {
    return `${this.options.output}/${filename}`;
  }

  /** @param {Error} error  */
  #sendError(error) {
    this.events.emit(
      "error",
      new AggregatorError(`Failed to generate: ${error.message}`, error)
    );
  }

  #getConfig() {
    return new Promise((finish, reject) => {
      try {
        const filename = fileURLToPath(import.meta.url);
        const dir = dirname(filename);

        const worker = new Worker(`${dir}/config.mjs`, {
          workerData: { cfg: resolve(this.options.config) },
        });

        worker.on("message", (message) => {
          if (message.error) {
            reject(new Error(message.error));

            return;
          }

          finish(message.cfg);
          worker.terminate();
        });
      } catch (error) {
        reject(error);
        return;
      }
    });
  }
}
