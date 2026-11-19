// gta6-meme-x-01 entrypoint, written for this entry: it hands the gate the
// address of the X post. POST.json at the repository root names the post;
// the gate reads the copy this program writes to the output directory.
// The program only reads the repository's own POST.json and writes that
// same text out again, so two runs on the same repository write the same
// bytes: no network, no clock, no files outside the repository.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');
const text = readFileSync(source, 'utf8');

// The gate refuses a post address that is not a JSON object holding a url,
// so check the shape here and fail loudly instead of handing it a bad file.
const parsed: unknown = JSON.parse(text);
if (
  typeof parsed !== 'object' ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== 'string'
) {
  console.error('POST.json must be a JSON object with a string "url"');
  process.exit(1);
}

// The address must be a real X post: https://x.com/<handle>/status/<id>
// (or the same on twitter.com). A placeholder or a wrong-site link is
// refused by the gate, so catch it here instead of submitting it.
const url = (parsed as { url: string }).url;
if (!/^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(url)) {
  console.error(`POST.json "url" is not an X post address: ${url}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, 'POST.json'), text);
