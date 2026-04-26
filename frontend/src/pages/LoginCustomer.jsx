import React, { useEffect } from 'react'
import Login from './Login'

export default function LoginCustomer() {
  useEffect(() => { document.title = 'Login — Customer' }, [])
  return <Login />
}
