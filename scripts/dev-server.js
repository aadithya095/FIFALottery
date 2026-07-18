/**
 * Local dev server — replaces Netlify CLI for local development.
 * Wraps all Netlify function handlers in Express so Vite can proxy to them.
 *
 * Usage:
 *   node scripts/dev-server.js
 *
 * Requires a .env file in the project root (copy from .env.example and fill in).
 */

import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'

const app = express()
app.use(express.json())
app.use(express.text())

// ---- Function registry ----------------------------------------
const FUNCTIONS = {
  'admin-login': () => import('../netlify/functions/admin-login.js'),
  'admin-assign-ticket': () => import('../netlify/functions/admin-assign-ticket.js'),
  'admin-tickets': () => import('../netlify/functions/admin-tickets.js'),
  'admin-summary': () => import('../netlify/functions/admin-summary.js'),
  'admin-list': () => import('../netlify/functions/admin-list.js'),
  'admin-manage-admins': () => import('../netlify/functions/admin-manage-admins.js'),
  'admin-reset': () => import('../netlify/functions/admin-reset.js'),
  'reveal': () => import('../netlify/functions/reveal.js'),
}

// ---- Build a Netlify-compatible event from an Express request --
function buildEvent(req) {
  return {
    httpMethod: req.method,
    path: req.path,
    headers: req.headers,
    queryStringParameters: req.query ?? {},
    body: req.body
      ? typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body)
      : null,
    isBase64Encoded: false,
  }
}

// ---- Route: /api/:functionName --------------------------------
app.all('/api/:functionName', async (req, res) => {
  const { functionName } = req.params
  const loader = FUNCTIONS[functionName]

  if (!loader) {
    return res.status(404).json({ error: `Function "${functionName}" not found` })
  }

  try {
    const mod = await loader()
    const event = buildEvent(req)
    const result = await mod.handler(event, {})

    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value)
      }
    }

    res.status(result.statusCode ?? 200).send(result.body ?? '')
  } catch (err) {
    console.error(`[dev-server] Error in function "${functionName}":`, err)
    res.status(500).json({ error: 'Internal function error', detail: err.message })
  }
})

// ---- Start ----------------------------------------------------
const PORT = 8888
createServer(app).listen(PORT, () => {
  console.log(`\n  Functions dev server → http://localhost:${PORT}`)
  console.log('  Start the UI in a second terminal: npx vite\n')
})
