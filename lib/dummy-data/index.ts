/**
 * CMCS Mock Data — Barrel Export
 *
 * Import all mock/seed data from a single entry point:
 *   import { projectsSeed, users, quotationSeed } from "../lib/dummy-data"
 *
 * Both mock-data and ceo-specific data are re-exported here so components
 * never need to know which file the data lives in.
 */

export * from "./mock-data";
export * from "./ceo";
