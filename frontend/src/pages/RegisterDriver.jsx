import React, { useEffect } from 'react'
import Register from './Register'

export default function RegisterDriver() {
  useEffect(() => { document.title = 'Register — Driver' }, [])
  return <Register initialRole={'DRIVER'} />
}
