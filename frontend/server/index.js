#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

const PORT = process.env.PORT || 4000

function sendJsonFile(res, filePath) {
  const abs = path.resolve(filePath)
  fs.stat(abs, (err, stats) => {
    if (err || !stats.isFile()) {
      res.status(404).send({ error: 'not found' })
      return
    }
    res.type('application/json')
    fs.createReadStream(abs).pipe(res)
  })
}

app.get('/data-all', (req, res) => {
  sendJsonFile(res, path.join(process.cwd(), 'data', 'data-all.json'))
})

app.get('/data-users', (req, res) => {
  console.log('[data server] /data-users requested, headers:', req.headers.host)
  sendJsonFile(res, path.join(process.cwd(), 'data', 'data-users.json'))
})

app.get('/search-users', (req, res) => {
  const nameQuery = req.query.name
  const filePath = path.join(process.cwd(), 'data', 'data-users.json')

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('[data server] Error reading data-users.json:', err)
      res.status(404).send({ error: 'data file not found' })
      return
    }

    try {
      const users = JSON.parse(data)

      // If no name query provided, return all users
      if (!nameQuery || typeof nameQuery !== 'string' || nameQuery.trim() === '') {
        res.json(users)
        return
      }

      // Filter users by name (case-insensitive exact match)
      const query = nameQuery.trim().toLowerCase()
      const filtered = users.filter(user =>
        user.name && user.name.toLowerCase() === query
      )

      console.log(`[data server] /search-users?name=${nameQuery} - found ${filtered.length} users`)
      res.json(filtered)
    } catch (parseErr) {
      console.error('[data server] Error parsing JSON:', parseErr)
      res.status(500).send({ error: 'internal server error' })
    }
  })
})

app.get('/', (req, res) => {
  res.send({ status: 'ok', endpoints: ['/data-all', '/data-users', '/search-users', '/pipeline-health'] })
})

// Mock pipeline health endpoint
// Randomly returns passing or failing state. Always include links to latest data endpoints
app.get('/pipeline-health', (req, res) => {
  // Randomly choose failing ~30% of the time
  const rand = Math.random()
  const status = rand < 0.3 ? 'failing' : 'passing'

  const body = { status }

  if (status === 'failing') {
    res.status(503).json(body)
    return
  }

  res.json(body)
})

app.listen(PORT, () => {
  console.log(`Data server listening on http://localhost:${PORT}`)
})
