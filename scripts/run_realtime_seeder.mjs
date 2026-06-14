import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = {
    pluginId: "pancreatic-centers",
    once: false,
    interval: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--once") {
      args.once = true;
    } else if (arg === "--plugin") {
      args.pluginId = argv[index + 1];
      index += 1;
    } else if (arg === "--interval-ms") {
      args.interval = Number(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function seederPathFor(pluginId) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pluginId)) {
    throw new Error(`Invalid plugin id: ${pluginId}`);
  }
  return resolve(PROJECT_ROOT, `realtime/seeders/${pluginId}/seeder.mjs`);
}

function makeStreamMessage(seeder, payload) {
  return {
    type: "data",
    pluginId: seeder.name,
    emittedAt: new Date().toISOString(),
    payload
  };
}

async function loadSeeder(pluginId) {
  const mod = await import(pathToFileURL(seederPathFor(pluginId)).href);
  const seeder = mod.default;
  if (!seeder || typeof seeder !== "object") {
    throw new Error("Seeder default export must be an object");
  }
  if (seeder.name !== pluginId) {
    throw new Error(`Seeder name "${seeder.name}" does not match plugin "${pluginId}"`);
  }
  if (typeof seeder.fetch !== "function") {
    throw new Error(`Seeder "${pluginId}" must expose fetch()`);
  }
  return seeder;
}

async function emitOnce(seeder) {
  const payload = await seeder.fetch();
  if (!Array.isArray(payload)) {
    throw new Error(`Seeder "${seeder.name}" fetch() must return an array`);
  }
  process.stdout.write(`${JSON.stringify(makeStreamMessage(seeder, payload))}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const seeder = await loadSeeder(args.pluginId);
  const interval = args.interval || seeder.interval;

  await emitOnce(seeder);
  if (args.once) return;

  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error(`Seeder "${seeder.name}" interval must be a positive number`);
  }
  setInterval(() => {
    emitOnce(seeder).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`[${seeder.name}] ${message}\n`);
    });
  }, interval);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
