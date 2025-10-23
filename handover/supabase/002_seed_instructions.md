# 002 — Supabase UI Seed Instructions

## Import order (must follow)
1. **vat** ← `/data/db/VAT.csv`
2. **catalog** ← `/data/db/Catalog.csv`
3. **rooms** ← `/data/db/Rooms.csv`
4. **durations** ← `/data/db/Durations.csv`
5. **room_catalog_map** ← `/data/db/RoomCatalogMap.csv`

## One-time setup
1) Supabase → **SQL Editor** → run `001_schema.sql`.  
2) Supabase → **Table Editor** → open each table and **Import data**.  
   - Format: **UTF-8**, **comma-delimited**.  
   - If a cell contains JSON, it must be quoted as a whole CSV field (e.g. `"{""Per Booking"":90}"`).

## Column mapping (camelCase → snake_case)

### Catalog.csv → catalog
- `id` → `id`
- `name` → `name`
- `heading` → `heading` *(enum; values must be: F&B, AV, Labour, 3rd Party, Add-On)*
- `vatCategory` → `vat_category` *(FK to vat.name)*
- `ratePerHour` → `rate_per_hour`
- `rateHalfDay` → `rate_half_day`
- `rateDay` → `rate_day`
- `ratePerPerson` → `rate_per_person`
- `ratePerBooking` → `rate_per_booking`
- `includedDefault` → `included_default`
- `includedCondition` → `included_condition`
- `notes` → `notes`

### Rooms.csv → rooms
- `id` → `id`
- `venueId` → `venue_id`
- `name` → `name`
- `code` → `code` *(unique)*
- `description` → `description`
- `sizeSqm` → `size_sqm`
- `heightM` → `height_m`
- `accessible` → `accessible`
- `featuresJSON` → `features_json` *(JSON)*
- `imagesJSON` → `images_json` *(JSON)*
- `layoutsJSON` → `layouts_json` *(JSON)*
- `baseRateHour` → `base_rate_hour`
- `baseRateHalfDay` → `base_rate_half_day`
- `baseRateDay` → `base_rate_day`

### Durations.csv → durations
- `code` → `code` *(PK)*
- `label` → `label`
- `hours` → `hours`

### RoomCatalogMap.csv → room_catalog_map
- `id` → `id`
- `roomId` → `room_id` *(FK)*
- `catalogItemId` → `catalog_item_id` *(FK)*
- `visibility` → `visibility` *(enum: included/optional/hidden)*
- `basisOverride` → `basis_override` *(enum: Per Booking/Per Person/Per Hour/Half-Day/Day)*
- `rateOverridesJSON` → `rate_overrides_json` *(JSON)*
- `minQty` → `min_qty`
- `maxQty` → `max_qty`
- `defaultQty` → `default_qty`
- `autoSuggest` → `auto_suggest`

### VAT.csv → vat
- `id` → `id`
- `name` → `name`
- `ratePercent` → `rate_percent`
- `appliesToJSON` → `applies_to_json` *(JSON)*

## JSON tips (CSV rules)
- Wrap the whole JSON value in **double quotes**.  
- Double any inner quotes.  
  - Example object: `"{""Per Booking"":90}"`  
  - Example array: `"[""F&B"",""AV""]"`

## After import — run the SQL in `VALIDATION.md` and paste the counts.
