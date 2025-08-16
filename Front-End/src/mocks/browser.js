import { setupWorker } from 'msw'
import { rest } from 'msw'

const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body || {}
    if (email === 'admin@admin.com' && password === 'admin') {
      return res(ctx.status(200), ctx.json({ id: 'admin', name: 'Admin User', email }))
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }))
  }),
  rest.post('/api/auth/register', (req, res, ctx) => {
    const { name, email } = req.body || {}
    return res(ctx.status(201), ctx.json({ id: Date.now().toString(), name: name || 'User', email }))
  }),
  rest.get('/api/auth/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(null))
  }),
  rest.post('/api/payments/create', (req, res, ctx) => {
    const token = `tok_${Math.random().toString(36).slice(2, 10)}`
    return res(ctx.status(200), ctx.json({ token }))
  }),
  rest.post('/api/payments/verify', (req, res, ctx) => res(ctx.status(200), ctx.json({ ok: true }))),
  rest.get('/api/payments/history', (req, res, ctx) => res(ctx.status(200), ctx.json([])))
]

export const worker = setupWorker(...handlers)
