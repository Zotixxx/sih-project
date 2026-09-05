import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const STATE_CODES = {
  "Andaman and Nicobar Islands": "AN",
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chandigarh: "CH",
  Chhattisgarh: "CG",
  "Dadra and Nagar Haveli and Daman and Diu": "DNHDD",
  Delhi: "DL",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  Ladakh: "LA",
  Lakshadweep: "LD",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OD",
  Puducherry: "PY",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TS",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.resolve(__dirname, "../src/db/india_states_districts.csv");
const dryRun = process.argv.includes("--dry-run");

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

const buildRows = () => {
  const csv = readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  const header = parseCsvLine(lines.shift() || "").map((value) => value.toLowerCase());

  if (header[0] !== "state" || header[1] !== "district") {
    throw new Error("Expected CSV header: State,District");
  }

  const seen = new Map();

  return lines.map((line, index) => {
    const [state, district] = parseCsvLine(line);
    if (!state || !district) {
      throw new Error(`Invalid state/district data at CSV row ${index + 2}.`);
    }

    const stateCode = STATE_CODES[state] || slugify(state).slice(0, 8);
    const districtSlug = slugify(district).slice(0, 56 - stateCode.length);
    let id = `${stateCode}-${districtSlug}`;

    const duplicateCount = seen.get(id) || 0;
    seen.set(id, duplicateCount + 1);
    if (duplicateCount > 0) {
      id = `${id.slice(0, 61)}-${duplicateCount + 1}`;
    }

    return {
      id,
      name: district,
      state,
      zone: null,
      controller_office: `Office of the Assistant Controller, ${district}`,
    };
  });
};

const importRows = async (rows) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required in backend/.env.");
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await supabase.from("districts").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
  }
};

const rows = buildRows();
const states = new Set(rows.map((row) => row.state));

console.log(`Prepared ${rows.length} districts across ${states.size} states/UTs from ${path.relative(process.cwd(), csvPath)}.`);
console.log(`Sample IDs: ${rows.slice(0, 5).map((row) => row.id).join(", ")}`);

if (dryRun) {
  console.log("Dry run complete. No Supabase changes were made.");
} else {
  await importRows(rows);
  console.log(`Imported ${rows.length} district reference rows into Supabase.`);
}
