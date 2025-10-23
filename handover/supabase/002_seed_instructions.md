# 002 — Seed Instructions (Supabase)

This guide seeds Supabase from `/data/db/` and validates the load.

## Import order (must follow)
1) `vat` → from `/data/db/VAT.csv`  
2) `catalog` → from `/data/db/Catalog.csv`  
3) `rooms` → from `/data/db/Rooms.csv`  
4) `durations` → from `/data/db/Durations.csv`  
5) `room_catalog_map` → from `/data/db/RoomCatalogMap.csv`

## How to import (Supabase UI)
1. Open **Supabase → Table editor**.
2. For each table above, click the table → **Import data** → select the CSV.
3. Ensure **UTF-8** and **comma delimiter**.
4. Confirm column mapping:
   - CSV → Table column (snake_case):
     - `Catalog.csv`
       - `vatCategory` → `vat_category`
       - `ratePerHour` → `rate_per_hour`
       - `rateHalfDay` → `rate_half_day`
       - `rateDay` → `rate_day`
       - `ratePerPerson` → `rate_per_person`
       - `ratePerBooking` → `rate_per_booking`
       - `includedDefault` → `included_default`
       - `includedCondition` → `included_condition`
     - `Rooms.csv`
       - `venueId` → `venue_id`
       - `sizeSqm` → `size_sqm`
       - `heightM` → `height_m`
       - `featuresJSON` → `features_json` (as JSON)
       - `imagesJSON` → `images_json` (as JSON)
       - `layoutsJSON` → `layouts_json` (as JSON)
       - `baseRateHour` → `base_rate_hour`
       - `baseRateHalfDay` → `base_rate_half_day`
       - `baseRateDay` → `base_rate_day`
     - `RoomCatalogMap.csv`
       - `roomId` → `room_id`
       - `catalogItemId` → `catalog_item_id`
       - `basisOverride` → `basis_override`
       - `rateOverridesJSON` → `rate_overrides_json` (as JSON)
       - `minQty`/`maxQty`/`defaultQty` → `min_qty`/`max_qty`/`default_qty`
       - `autoSuggest` → `auto_suggest`
     - `VAT.csv`
       - `ratePercent` → `rate_percent`
       - `appliesToJSON` → `applies_to_json` (as JSON)
     - `Durations.csv`
       - `label` → `label`
       - `hours` → `hours`

> JSON columns: if the CSV field contains JSON (e.g., `["F&B","AV"]` or `{"Per Booking":90}`), the entire field must be wrapped in quotes and inner quotes doubled. Example:  
> `"{""Per Booking"":90}"` for CSV; the UI will parse it as JSON.

## Optional — CLI import
You can also run COPY SQL in the SQL editor (ensure the CSVs are accessible to the DB or use the UI upload).

## After import — run validation queries in VALIDATION.md and paste the result counts.
