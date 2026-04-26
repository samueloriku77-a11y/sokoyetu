import React, { useEffect } from 'react'
import Login from './Login'

export default function LoginVendor() {
  useEffect(() => { document.title = 'Login — Vendor' }, [])
  return <Login />
}
