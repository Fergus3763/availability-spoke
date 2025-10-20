const { DateTime } = require('luxon');

// Server-safe EU formatter (no browser globals)
function eu(iso, zone = 'Europe/Dublin') {
  // Accept both DateTime and string
  const dt = typeof iso === 'string'
    ? DateTime.fromISO(iso, { zone })
    : iso.setZone(zone);
  return dt.toFormat('dd/MM/yyyy HH:mm');
}
// EU fields included
import { DateTime } from 'luxon';


export async function handler(event) {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  const qs = event.queryStringParameters || {};
  const roomId = qs.roomId || 'Room-A';
  const from = qs.from, to = qs.to;
  if (!from || !to) return { statusCode: 400, body: JSON.stringify({ error: 'from and to required ISO strings' }) };
  const avail = isAvailable(roomId, from, to);
  const ooh = detectOOH({ id:'_probe_', roomId, type:'BOOKING', status:'provisional', startsAt: from, endsAt: to, createdBy:'system', createdAt: DateTime.now().toISO() });
  const billableHours = Math.ceil(DateTime.fromISO(to, { setZone:true }).diff(DateTime.fromISO(from, { setZone:true }), 'hours').hours);
  return {
    statusCode: 200,
    body: JSON.stringify({
      roomId, from, to,
      fromEU: eu(from),
      toEU: eu(to),
      ...avail,
      ooh,
      billableHours
    })
  };
}
