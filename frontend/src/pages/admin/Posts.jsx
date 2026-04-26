import React, { useEffect, useState } from 'react'
import api from '../../api'

export default function AdminPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/posts/admin')
      setPosts(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete post?')) return
    await api.delete(`/posts/${id}`)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const toggleHidden = async (p) => {
    await api.patch(`/posts/${p.id}/moderate`, { is_hidden: !p.is_hidden })
    load()
  }

  const delComment = async (postId, commentId) => {
    if (!confirm('Delete comment?')) return
    await api.delete(`/posts/${postId}/comments/${commentId}`)
    load()
  }

  return (
    <div style={{ padding:24 }}>
      <h2>Admin — Posts Moderation</h2>
      {loading ? <div>Loading...</div> : (
        <div style={{ display:'grid', gap:12 }}>
          {posts.map(p => (
            <div key={p.id} style={{ padding:12, background:'var(--navy-2)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <strong>{p.title}</strong>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.body}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-outline" onClick={() => toggleHidden(p)}>{p.is_hidden ? 'Unhide' : 'Hide'}</button>
                  <button className="btn btn-danger" onClick={() => del(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
