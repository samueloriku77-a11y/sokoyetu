import React, { useEffect } from 'react'
import Register from './Register'

export default function RegisterVendor() {
  useEffect(() => { document.title = 'Register — Vendor' }, [])
  return <Register initialRole={'VENDOR'} />
}
