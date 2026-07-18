const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
}

export function ok(body, extraHeaders = {}) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...extraHeaders },
    body: JSON.stringify(body),
  }
}

export function created(body, extraHeaders = {}) {
  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...extraHeaders },
    body: JSON.stringify(body),
  }
}

export function badRequest(message) {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({ error: message }),
  }
}

export function unauthorized(message = 'Unauthorized') {
  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({ error: message }),
  }
}

export function forbidden(message = 'Forbidden') {
  return {
    statusCode: 403,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({ error: message }),
  }
}

export function tooManyRequests(message = 'Too many attempts. Try again later.') {
  return {
    statusCode: 429,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({ error: message }),
  }
}

export function serverError(message = 'Internal server error') {
  return {
    statusCode: 500,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify({ error: message }),
  }
}

export function preflight() {
  return { statusCode: 204, headers: corsHeaders(), body: '' }
}
