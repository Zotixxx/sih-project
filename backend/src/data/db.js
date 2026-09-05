// Local persistent database facade. Repositories keep their existing collection API
// while SQLite stores the authoritative state between process restarts.
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialSeedData } from "./seedData.js";
import { users as seedUsers } from "./users.js";

class DatabaseEngine {
  constructor() {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const databasePath = process.env.METRIX_DB_PATH || path.join(currentDir, "metrix.sqlite");
    this.connection = new Database(databasePath);
    this.connection.pragma("journal_mode = WAL");
    this.connection.exec(`
      CREATE TABLE IF NOT EXISTS metrix_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    const storedState = this.connection.prepare("SELECT payload FROM metrix_state WHERE id = 1").get();
    if (storedState) {
      this.load(JSON.parse(storedState.payload));
    } else {
      this.reset();
    }
  }

  reset() {
    this.districts = JSON.parse(JSON.stringify(initialSeedData.districts));
    this.users = JSON.parse(JSON.stringify(seedUsers));
    this.businesses = [];
    this.instruments = [];
    this.applications = [];
    this.inspections = [];
    this.certificates = [];
    this.notifications = [];
    this.auditLogs = [];
    this.drafts = [];
    this.portalDataVersion = 2;
    this.persist();
  }

  load(state) {
    this.districts = state.districts || [];
    this.users = state.users || [];
    const hasCleanPortalData = state.portalDataVersion === 2;
    this.businesses = hasCleanPortalData ? state.businesses || [] : [];
    this.instruments = hasCleanPortalData ? state.instruments || [] : [];
    this.applications = hasCleanPortalData ? state.applications || [] : [];
    this.inspections = hasCleanPortalData ? state.inspections || [] : [];
    this.certificates = hasCleanPortalData ? state.certificates || [] : [];
    this.notifications = hasCleanPortalData ? state.notifications || [] : [];
    this.auditLogs = hasCleanPortalData ? state.auditLogs || [] : [];
    this.drafts = hasCleanPortalData ? state.drafts || [] : [];
    this.portalDataVersion = 2;
    if (!hasCleanPortalData) this.persist();
  }

  persist() {
    const payload = JSON.stringify({
      districts: this.districts,
      users: this.users,
      businesses: this.businesses,
      instruments: this.instruments,
      applications: this.applications,
      inspections: this.inspections,
      certificates: this.certificates,
      notifications: this.notifications,
      auditLogs: this.auditLogs,
      drafts: this.drafts,
      portalDataVersion: this.portalDataVersion,
    });

    this.connection
      .prepare(`
        INSERT INTO metrix_state (id, payload, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
      `)
      .run(payload, new Date().toISOString());
  }
}

export const db = new DatabaseEngine();
