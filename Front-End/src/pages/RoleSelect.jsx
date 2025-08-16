import React, { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function RoleSelect() {
  const { user } = useContext(AuthContext)
  const [role, setRole] = useState('')
  const navigate = useNavigate()

  function proceed() {
    if (role === 'merchant') navigate('/merchant')
    else if (role === 'customer') navigate('/customer')
    else alert('Please select a role')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Select Role</h2>
      <div className="flex gap-4 mb-4">
        <button className={`px-4 py-2 rounded ${role==='merchant'?'bg-black text-white':'bg-gray-200'}`} onClick={()=>setRole('merchant')}>Merchant</button>
        <button className={`px-4 py-2 rounded ${role==='customer'?'bg-black text-white':'bg-gray-200'}`} onClick={()=>setRole('customer')}>Customer</button>
      </div>
      <button className="px-4 py-2 rounded bg-green-500 text-white" onClick={proceed}>Proceed</button>
    </div>
  )
}