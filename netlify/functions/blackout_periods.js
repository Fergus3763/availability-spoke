// /netlify/functions/blackout_periods.js
// Persist blackout periods in Supabase (CJS, Netlify Functions)
// Adds verbose logging for diagnostics

const { DateTime } = require('luxon');
const { supabase } = require('./_supabase');

const json = (status, obj) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

exports.handler = async (event) => {
  const reqId = event.requestId || 'no-req-id';
  const method = event.httpMethod;

  // Minimal CORS helper to make manual tests easier
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'content-type',
      },
    });
  }

  console.log(`[blackout_periods] reqId=${reqId} method=${method}`);

  try {
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const roomId = params.roomId || null;

      if (!roomId) {
        console.warn(`[blackout_periods] GET missing roomId`);
        return json(400, { error: 'roomId required' });
      }

      console.log(`[blackout_periods] GET roomId=${roomId}`);

      const { data, error } = await supabase
        .from('blackout_periods')
        .select('id, room_id, starts_at, ends_at, title, created_at')
        .eq('room_id', roomId)
        .order('starts_at', { ascending: true });

      if (error) {
        console.error('[blackout_periods] GET supabase error:', error);
        return json(500, { error: error.message, code: error.code, details: error.details });
      }

      const out = (data || []).map((r) => ({
        id: r.id,
        roomId: r.room_id,
        title: r.title || 'Blackout',
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        startsAtEU: DateTime.fromISO(r.starts_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
        endsAtEU: DateTime.fromISO(r.ends_at, { zone: 'Europe/Dublin' }).toFormat('dd/LL/yyyy HH:mm'),
      }));

      console.log(`[blackout_periods] GET rows=${out.length}`);
      return json(200, out);
    }

    if (method === 'POST') {
      let body = {};
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        console.error('[blackout_periods] POST invalid JSON body:', e);
        return json(400, { error: 'Invalid JSON body' });
      }

      const { roomId, startsAt, endsAt, title = 'Blackout' } = body;
      console.log('[blackout_periods] POST payload:', body);

      if (!roomId || !startsAt || !endsAt) {
        console.warn('[blackout_periods] POST missing fields', { roomId, startsAt, endsAt });
        return json(400, { error: 'roomId, startsAt and endsAt are required' });
      }

      const row = {
        room_id: roomId,
        starts_at: startsAt,
        ends_at: endsAt,
        title: title,
      };

      const { data, error } = await supabase
        .from('blackout_periods')
        .insert([row])
        .select()
        .single();

      if (error) {
        console.error('[blackout_periods] POST supabase insert error:', error);
        return json(500, { error: error.message, code: error.code, details: error.details });
      }

      console.log('[blackout_periods] POST inserted row:', data);
      return json(200, data);
    }

    console.warn(`[blackout_periods] method not allowed: ${method}`);
    return json(405, { error: 'Method not allowed' });
  } catch (e) {
    console.error('[blackout_periods] unhandled exception:', e);
    return json(500, { error: 'Unhandled error', message: e?.message, stack: e?.stack });
  }
};
