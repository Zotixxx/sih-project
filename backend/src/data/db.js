// MetriX In-Memory Data Store Engine
// Encapsulates state and provides persistence for local development.

import { initialSeedData } from "./seedData.js";
import { users as seedUsers } from "./users.js";

class DatabaseEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.districts = JSON.parse(JSON.stringify(initialSeedData.districts));
    this.users = JSON.parse(JSON.stringify(seedUsers));
    this.businesses = JSON.parse(JSON.stringify(initialSeedData.businesses));
    this.instruments = JSON.parse(JSON.stringify(initialSeedData.instruments));
    this.applications = JSON.parse(JSON.stringify(initialSeedData.applications));
    this.inspections = JSON.parse(JSON.stringify(initialSeedData.inspections));
    this.certificates = JSON.parse(JSON.stringify(initialSeedData.certificates));
    this.notifications = JSON.parse(JSON.stringify(initialSeedData.notifications));
    this.auditLogs = JSON.parse(JSON.stringify(initialSeedData.auditLogs));
    this.drafts = [];
  }
}

export const db = new DatabaseEngine();
