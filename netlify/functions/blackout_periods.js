// netlify/functions/blackout_periods.js
const { DateTime } = require('luxon');
const { supabase } = require('./_supabase');

// Standard Lambda response
const json = (status, obj) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    // ------- GET: list blackouts for Admin UI -------
    if (method === 'GET') {
      const roomId = event.queryStringParameters?.roomId;
      if (!roomId) return json(400, { error: 'roomId required' });

      const { data, error } = await supabase
        .from('blackout_periods')
        .select('id, room_id, starts_at, ends_at, title')
        .eq('room_id', roomId)
        .order('starts_at', { ascending: true });

      if (error) throw error;

      const out = (data || []).map((r) => ({
        id: r.id,
        roomId: r.room_id,
        title: r.title || 'Blackout',
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        startsAtEU: DateTime.fromISO(r.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(r.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
      }));

      return json(200, out);
    }

    // ------- POST: create blackout -------
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { roomId, startsAt, endsAt, title } = body;

      if (!roomId || !startsAt || !endsAt) {
        return json(400, { error: 'roomId, startsAt, endsAt required' });
      }

      const payload = {
        room_id: roomId,
        starts_at: startsAt,
        ends_at: endsAt,
        title: title || null,
      };

      const { data, error } = await supabase
        .from('blackout_periods')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      const out = {
        id: data.id,
        roomId: data.room_id,
        title: data.title || 'Blackout',
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        startsAtEU: DateTime.fromISO(data.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(data.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
      };

      return json(200, out);
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: String(err.message || err) });
  }
};
