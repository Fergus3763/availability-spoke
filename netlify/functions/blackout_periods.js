// Persist blackout periods in Supabase (CJS, Netlify Functions)
const { DateTime } = require('luxon');
const { supabase } = require('./_supabase');

const send = (status, obj) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    // ---- GET blackout list for Admin UI ----
    if (method === 'GET') {
      const roomId = event.queryStringParameters?.roomId || null;
      if (!roomId) return send(400, { error: 'roomId required' });

      const { data, error } = await supabase
        .from('blackout_periods')
        .select('id, room_id, starts_at, ends_at, title, created_at')
        .eq('room_id', roomId)
        .order('starts_at', { ascending: true });

      if (error) return send(500, { error: error.message });

      const out = data.map((r) => ({
        id: r.id,
        roomId: r.room_id,
        title: r.title || 'Blackout',
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        startsAtEU: DateTime.fromISO(r.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(r.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
      }));

      return send(200, out);
    }

    // ---- POST new blackout ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { roomId, startsAt, endsAt, title } = body;
      if (!roomId || !startsAt || !endsAt) {
        return send(400, { error: 'roomId, startsAt, endsAt required' });
        }

      const { data, error } = await supabase
        .from('blackout_periods')
        .insert([{ room_id: roomId, starts_at: startsAt, ends_at: endsAt, title }])
        .select()
        .single();

      if (error) return send(500, { error: error.message });

      return send(200, {
        id: data.id,
        roomId: data.room_id,
        title: data.title,
        startsAt: data.starts_at,
        endsAt: data.ends_at,
        startsAtEU: DateTime.fromISO(data.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(data.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
      });
    }

    // ---- DELETE blackout ----
    if (method === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { id } = body;
      if (!id) return send(400, { error: 'id required' });

      const { error } = await supabase.from('blackout_periods').delete().eq('id', id);
      if (error) return send(500, { error: error.message });

      return send(200, { success: true });
    }

    return send(405, { error: 'Method not allowed' });
  } catch (err) {
    return send(500, { error: err.message });
  }
};
