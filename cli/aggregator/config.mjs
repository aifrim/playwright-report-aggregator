import { parentPort, workerData } from "node:worker_threads";

try {
  const getConfig = (await import(workerData.cfg)).default;

  try {
    const cfg = getConfig();

    parentPort.postMessage({ cfg });
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
} catch {
  parentPort.postMessage({ error: `Failed to load ${workerData.cfg}` });
}
