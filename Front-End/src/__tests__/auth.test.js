import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ToastProvider } from '../contexts/ToastContext'
import { server } from '../mocks/server'
import { rest } from 'msw'
import Login from '../pages/Login'
import Register from '../pages/Register'
import AdminGate from '../components/AdminGate'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('Admin login succeeds with demo credentials', async () => {
  render(
    <ToastProvider>
      <Login />
    </ToastProvider>
  )

  const email = screen.getByPlaceholderText(/Email/i)
  const password = screen.getByPlaceholderText(/Password/i)
  const button = screen.getByRole('button', { name: /Sign in/i })

  fireEvent.change(email, { target: { value: 'admin@admin.com' } })
  fireEvent.change(password, { target: { value: 'admin' } })
  fireEvent.click(button)

  expect(await screen.findByText(/Demo admin/i)).toBeInTheDocument()
})

test('Register flow submits and shows create account UI', async () => {
  render(
    <ToastProvider>
      <Register />
    </ToastProvider>
  )

  fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'Test User' } })
  fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } })
  fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'pass1234' } })
  fireEvent.click(screen.getByLabelText(/Merchant/i))
  fireEvent.click(screen.getByRole('button', { name: /Create account/i }))

  expect(await screen.findByText(/Create account/i)).toBeInTheDocument()
})

test('AdminGate can be unlocked with demo fill button', () => {
  const onAuth = jest.fn()
  render(<AdminGate onAuthenticate={onAuth} />)
  const fill = screen.getByRole('button', { name: /Fill Demo/i })
  fireEvent.click(fill)
  const unlock = screen.getByRole('button', { name: /Unlock/i })
  fireEvent.click(unlock)
  expect(onAuth).toHaveBeenCalled()
})
