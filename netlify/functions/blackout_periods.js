// /netlify/functions/blackout_periods.js (CommonJS)
const { DateTime } = require('luxon');

// In-memory store (resets when function cold-starts/redeploys)
let store = [];

// EU formatter
function eu(iso, zone = 'Europe/Dublin') {
  const dt = typeof iso === 'string'
    ? DateTime.fromISO(iso, { zone })
    : iso.setZone(zone);
  return dt.toFormat('dd/MM/yyyy HH:mm');
}

// JSON helper
function json(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json' },
    body: body == null ? '' : JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      const roomId   = body.roomId || 'Room-A';
      const title    = body.title || 'Blackout';

      // fixed blackout
      let startsAt = body.startsAt || DateTime.now().toISO();
      let endsAt   = body.endsAt   || DateTime.now().plus({ hours: 1 }).toISO();

      // temp blackout (e.g. { tempAmount: 6, tempUnit: "hours", startsAt? } )
      if (!body.startsAt && !body.endsAt && body.tempAmount && body.tempUnit) {
        const base = body.startsAt
          ? DateTime.fromISO(body.startsAt)
          : DateTime.now();
        startsAt = base.toISO();
        endsAt   = base.plus({ [body.tempUnit]: Number(body.tempAmount) }).toISO();
      }

      const id = 'blk_' + Math.random().toString(36).slice(2, 10);

      const rec = {
        id, roomId, title,
        startsAt, endsAt,
        startsAtEU: eu(startsAt),
        endsAtEU: eu(endsAt),
      };

      store.push(rec);
      return json(201, rec);
    }

    if (method === 'DELETE') {
      // Expect last segment to be the id: /blackout_periods/:id
      const id = (event.path || '').split('/').pop();
      const before = store.length;
      store = store.filter(x => x.id !== id);
      const removed = before - store.length;
      return json(200, { ok: true, removed, id });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: 'Server error', detail: String(err && err.message || err) });
  }
};
