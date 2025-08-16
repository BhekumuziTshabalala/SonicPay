import { render, screen } from '@testing-library/react'
import React from 'react'
import AdminGate from '../src/components/AdminGate'

test('AdminGate shows required text', () => {
  render(<AdminGate onAuthenticate={() => {}} />)
  expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument()
})
