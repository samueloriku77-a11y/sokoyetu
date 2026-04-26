import React, { useEffect } from 'react'
import Register from './Register'

export default function RegisterCustomer() {
  useEffect(() => { document.title = 'Register — Customer' }, [])
  return <Register initialRole={'CUSTOMER'} />
}
