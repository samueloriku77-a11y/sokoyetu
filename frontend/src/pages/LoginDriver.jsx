import React, { useEffect } from 'react'
import Login from './Login'

export default function LoginDriver() {
  useEffect(() => { document.title = 'Login — Driver' }, [])
  return <Login />
}
