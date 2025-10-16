// netlify/functions/suggestions.js
import { state, eu, isAvailable, suggestAlternatives } from '../../public/index.html'; // NOTE: we don't actually import from HTML at runtime, but Netlify will bundle the function without this line.
// To avoid confusion, we will re-define a tiny wrapper and access window-less globals.
// In our inline admin, window.mod exposes suggestAlternatives. In a function we mimic that:

export async function handler(event) {
  // Because our core is inline in index.html for the Admin, the function cannot import it directly.
  // For now, return a NOT IMPLEMENTED response explaining that the Admin inline core is separate.
  // If you want suggestions as a function, we need to move the core to /public/core.js again
  // and import from there (which we had earlier). Say the word and I’ll ship that refactor.

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return {
    statusCode: 501,
    body: JSON.stringify({
      error: 'Suggestions endpoint not wired because core is currently inlined in index.html. If you want /suggestions as a serverless function, I will move the core back to /public/core.js and wire this function to import from it.'
    })
  };
}
