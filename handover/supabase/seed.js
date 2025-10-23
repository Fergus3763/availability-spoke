// /handover/supabase/seed.js
// Node upsert script: reads /data/db CSVs and upserts into Supabase via service role key.
// Run: `npm i @supabase/supabase-js csv-parse dotenv` then `node seed.js`
// Requires .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'db');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL
