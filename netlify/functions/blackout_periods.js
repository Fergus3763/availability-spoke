// Supports fixed and temp blackouts; EU fields in response
const { DateTime } = require('luxon');

// Server-safe EU formatter (no browser globals)
function eu(iso, zone = 'Europe/Dublin') {
  // Accept both DateTime and string
  const dt = typeof iso === 'string'
    ? DateTime.fromISO(iso, { zone })
    : iso.setZone(zone);
  return dt.toFormat('dd/MM/yyyy HH:mm');
}
export async function handler(event) {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { roomId = 'Room-A', startsAt, endsAt, title, tempAmount, tempUnit } = body;
    if (tempAmount && tempUnit) {
      const res = addTempBlackout(roomId, startsAt || new Date().toISOString(), Number(tempAmount), tempUnit, title || 'Temp Block');
      if (!res.ok) return { statusCode: 409, body: JSON.stringify(res) };
      const ev = res.event;
      return { statusCode: 201, body: JSON.stringify({ ...res, event: { ...ev, startsAtEU: eu(ev.startsAt), endsAtEU: eu(ev.endsAt) } }) };
    }
    if (!startsAt || !endsAt) return { statusCode: 400, body: JSON.stringify({ error: 'startsAt and endsAt required (or provide tempAmount & tempUnit)' }) };
    const out = addBlackout(roomId, startsAt, endsAt, title || 'Blackout');
    if (!out.ok) return { statusCode: 409, body: JSON.stringify(out) };
    const ev = out.event;
    return { statusCode: 201, body: JSON.stringify({ ...out, event: { ...ev, startsAtEU: eu(ev.startsAt), endsAtEU: eu(ev.endsAt) } }) };
  }
  if (event.httpMethod === 'DELETE') {
    const id = event.path.split('/').pop();
    const roomId = (event.queryStringParameters && event.queryStringParameters.roomId) || 'Room-A';
    const out = removeEvent(roomId, id);
    return { statusCode: out.ok ? 204 : 404, body: out.ok ? '' : JSON.stringify(out) };
  }
  return { statusCode: 405, body: 'Method Not Allowed' };
}
