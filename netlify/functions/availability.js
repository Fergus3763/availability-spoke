// netlify/functions/availability.js
const { DateTime, Interval } = require('luxon');
const { supabase } = require('./_supabase');

const json = (status, obj) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const { roomId, from, to } = qs;
    if (!roomId || !from || !to) {
      return json(400, { error: 'roomId, from, to required' });
    }

    // Pull any blackouts that could overlap the window
    const { data, error } = await supabase
      .from('blackout_periods')
      .select('id, room_id, starts_at, ends_at, title')
      .eq('room_id', roomId)
      .lte('starts_at', to)
      .gte('ends_at', from)
      .order('starts_at', { ascending: true });

    if (error) throw error;

    const target = Interval.fromDateTimes(DateTime.fromISO(from), DateTime.fromISO(to));
    let conflict = null;

    for (const r of data || []) {
      const iv = Interval.fromDateTimes(DateTime.fromISO(r.starts_at), DateTime.fromISO(r.ends_at));
      if (iv.overlaps(target)) {
        conflict = r;
        break;
      }
    }

    const resp = {
      roomId,
      available: !conflict,
      blackoutReason: conflict?.title || null,
      from,
      to,
      fromEU: DateTime.fromISO(from, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
      toEU: DateTime.fromISO(to, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
      ooh: false,
      billableHours: target.length('hours'),
    };

    return json(200, resp);
  } catch (err) {
    return json(500, { error: String(err.message || err) });
  }
};
