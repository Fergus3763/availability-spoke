// Persist blackout periods in Supabase (CJS, Netlify Functions)
const { DateTime } = require('luxon');
const { supabase } = require('./_supabase');

const json = (status, obj) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

exports.handler = async (event) => {
  try {
    const method = event.httpMethod;

    // ---- GET blackout list for Admin UI ----
    if (method === 'GET') {
      const roomId = event.queryStringParameters?.roomId || null;
      if (!roomId) return json(400, { error: 'roomId required' });

      const { data, error } = await supabase
        .from('blackout_periods')
        .select('id, room_id, starts_at, ends_at, title, created_at')
        .eq('room_id', roomId)
        .order('starts_at', { ascending: true });

      if (error) return json(500, { error: error.message });

      const out = data.map((r) => ({
        id: r.id,
        roomId: r.room_id,
        title: r.title || 'Blackout',
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        startsAtEU: DateTime.fromISO(r.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(r.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/MM/yyyy HH:mm'),
      }));

      return json(200, out);
    }

    // ---- POST new blackout ----
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { roomId, startsAt, endsAt, title } = body;
      if (!roomId || !startsAt || !endsAt) {
        return json(400, { error: 'roomId, startsAt, endsAt required' });
      }

      const { data, error } = await supabase
        .from('blackout_periods')
        .insert([{ room_id: roomId, starts_at: startsAt, ends_at: endsAt, title }])
        .select()
        .single();

      if (error) return json(500, { error: error.message });

      return json(200, {
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
      if (!id) return json(400, { error: 'id required' });

      const { error } = await supabase.from('blackout_periods').delete().eq('id', id);
      if (error) return json(500, { error: error.message });

      return json(200, { success: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message });
  }
};
