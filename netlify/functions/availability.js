// /netlify/functions/availability.js  (CommonJS)
const { DateTime } = require('luxon');

// Server-safe EU formatter (no browser globals)
function eu(iso, zone = 'Europe/Dublin') {
  const dt = typeof iso === 'string'
    ? DateTime.fromISO(iso, { zone })
    : iso.setZone(zone);
  return dt.toFormat('dd/MM/yyyy HH:mm');
}

// Small JSON helper
function json(status, body) {
  return {
    statusCode: status,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  try {
    // Params from query string
    const url = new URL(event.rawUrl || `https://${event.headers.host}${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`);
    const params = url.searchParams;

    const roomId = params.get('roomId') || 'Room-A';
    const fromISO = params.get('from');
    const toISO   = params.get('to');

    if (!fromISO || !toISO) {
      return json(400, { error: "Missing required query params 'from' and 'to' (ISO timestamps)." });
    }

    const fromDt = DateTime.fromISO(fromISO);
    const toDt   = DateTime.fromISO(toISO);

    if (!fromDt.isValid || !toDt.isValid) {
      return json(400, { error: 'Invalid ISO timestamps.' });
    }

    // ---- your availability logic goes here ----
    // For now: simple “available” demo + billable hours (rounded up)
    const diffHours = Math.max(0, toDt.diff(fromDt, 'hours').hours);
    const billableHours = Math.max(1, Math.ceil(diffHours));
    const available = true;        // <— placeholder
    const ooh = false;             // <— placeholder
    const blackoutReason = null;   // <— placeholder

    const result = {
      roomId,
      available,
      blackoutReason,
      from: fromISO,
      to: toISO,
      fromEU: eu(fromDt),
      toEU: eu(toDt),
      ooh,
      billableHours,
    };

    return json(200, result);
  } catch (err) {
    return json(500, { error: 'Server error', detail: String(err && err.message || err) });
  }
};
