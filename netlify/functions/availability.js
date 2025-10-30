// Check room availability against blackout periods (CJS, Netlify Functions)
const { DateTime, Interval } = require('luxon');
const { supabase } = require('./_supabase');

const send = (status, obj) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return send(405, { error: 'Method not allowed' });
    }

    const { roomId, from, to } = event.queryStringParameters || {};
    if (!roomId || !from || !to) {
      return send(400, { error: 'roomId, from, and to required' });
    }

    const { data, error } = await supabase
      .from('blackout_periods')
      .select('id, starts_at, ends_at, title')
      .eq('room_id', roomId);

    if (error) return send(500, { error: error.message });

    const fromDT = DateTime.fromISO(from);
    const toDT = DateTime.fromISO(to);
    const queryRange = Interval.fromDateTimes(fromDT, toDT);

    const overlap = data?.find((r) => {
      const period = Interval.fromDateTimes(
        DateTime.fromISO(r.starts_at),
        DateTime.fromISO(r.ends_at)
      );
      return period.overlaps(queryRange);
    });

    const available = !overlap;
    const blackoutReason = overlap ? overlap.title || 'Blackout' : null;

    return send(200, {
      roomId,
      available,
      blackoutReason,
      from,
      to,
      fromEU: fromDT.setZone('Europe/Dublin').toFormat('dd/MM/yyyy HH:mm'),
      toEU: toDT.setZone('Europe/Dublin').toFormat('dd/MM/yyyy HH:mm'),
      ooh: false,
      billableHours: Math.max(0, toDT.diff(fromDT, 'hours').hours),
    });
  } catch (err) {
    return send(500, { error: err.message });
  }
};
