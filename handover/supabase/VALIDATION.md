# VALIDATION — Supabase Load Checks

Run the SQL blocks below in Supabase **SQL Editor** and paste the counts.

## Row counts
```sql
select 'vat' tbl, count(*) from vat
union all select 'catalog', count(*) from catalog
union all select 'rooms', count(*) from rooms
union all select 'durations', count(*) from durations
union all select 'room_catalog_map', count(*) from room_catalog_map;
