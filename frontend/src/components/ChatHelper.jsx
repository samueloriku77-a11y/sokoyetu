import React from 'react'
import { MessageSquare } from 'lucide-react'

export default function ChatHelper() {
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 24, zIndex: 200 }}>
      <a href="#" aria-label="Chat helper" style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center',
        width:64, height:64, borderRadius:999, background:'linear-gradient(135deg,var(--accent),var(--accent-2))',
        boxShadow:'0 8px 30px rgba(59,130,246,0.18)', color:'#fff', textDecoration:'none'
      }}>
        <MessageSquare size={28} />
      </a>
    </div>
  )
}
