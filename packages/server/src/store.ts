import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SaveState } from "../../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const SAVE_PATH = path.join(DATA_DIR, "save.json");

let cache: SaveState | null = null;

export function hasSave(): boolean {
  if (cache) return true;
  return fs.existsSync(SAVE_PATH);
}

export function loadSave(): SaveState | null {
  if (cache) return cache;
  if (!fs.existsSync(SAVE_PATH)) return null;
  const raw = fs.readFileSync(SAVE_PATH, "utf-8");
  cache = JSON.parse(raw) as SaveState;
  return cache;
}

export function writeSave(state: SaveState): void {
  cache = state;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(SAVE_PATH, JSON.stringify(state), "utf-8");
}

export function clearSave(): void {
  cache = null;
  if (fs.existsSync(SAVE_PATH)) {
    fs.unlinkSync(SAVE_PATH);
  }
}
