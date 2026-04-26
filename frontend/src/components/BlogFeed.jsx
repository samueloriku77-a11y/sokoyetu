import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

function PostCard({ post }) {
  return (
    <div style={{ background:'var(--navy-2)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
      {post.image_url && <img src={post.image_url} alt={post.title} style={{ width:'100%', height:220, objectFit:'cover' }} />}
      <div style={{ padding:12 }}>
        <div style={{ fontSize:16, fontWeight:700 }}>{post.title}</div>
        <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:8 }}>{post.body}</div>
        <div style={{ marginTop:12, fontSize:12, color:'var(--text-secondary)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>By: {post.author?.business_name || post.author?.name || `User #${post.author_id}`}</div>
          <div style={{ fontSize:12 }}>{new Date(post.created_at).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

function PostDetail({ post, refreshPost }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [liked, setLiked] = useState(false)

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`)
      setComments(data)
    } catch (err) { console.error(err) }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!commentText) return
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { body: commentText })
      setComments(prev => [...prev, data])
      setCommentText('')
      if (refreshPost) refreshPost()
    } catch (err) { console.error(err) }
  }

  const toggleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post.id}/like`)
      setLiked(data.liked)
      if (refreshPost) refreshPost()
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginTop:8 }}>
        <button className="btn btn-ghost" onClick={toggleLike} aria-label={post.liked ? 'Unlike' : 'Like'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 21s-7.5-4.9-9.2-8.1C1.5 9.9 4 6 7.6 6c2.1 0 3.4 1.2 4.4 2.3.9-1 2.3-2.3 4.4-2.3 3.6 0 6.1 3.9 4.8 6.9C19.5 16.1 12 21 12 21z" stroke="currentColor" strokeWidth="1" fill="currentColor" />
          </svg>
          <span style={{ marginLeft:6 }}>{post.likes_count || 0}</span>
        </button>
        <button className="btn btn-ghost" onClick={() => { setShowComments(s => !s); if (!showComments) loadComments() }} aria-label="Show comments">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1" fill="currentColor" />
          </svg>
          <span style={{ marginLeft:6 }}>{post.comments_count || 0}</span>
        </button>
      </div>
      {showComments && (
        <div style={{ marginTop:12 }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding:8, background:'rgba(255,255,255,0.02)', borderRadius:8, marginBottom:8 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>{c.user?.name || `User #${c.user_id}`}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)' }}>{c.body}</div>
            </div>
          ))}
          {user ? (
            <form onSubmit={submitComment} style={{ display:'flex', gap:8, marginTop:8 }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment" />
              <button className="btn btn-primary">Reply</button>
            </form>
          ) : (
            <div style={{ marginTop:8, color:'var(--text-muted)' }}>Sign in to comment</div>
          )}
        </div>
      )}
    </div>
  )
}

function PostCreate({ onCreated }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!title) return
    setLoading(true)
    try {
      const { data } = await api.post('/posts', { title, body, image_url: image })
      setTitle(''); setBody(''); setImage('')
      if (onCreated) onCreated(data)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Failed to create post')
    } finally { setLoading(false) }
  }

  if (!user || (user.role !== 'VENDOR' && user.role !== 'ADMIN')) return null

  return (
    <form onSubmit={submit} style={{ marginBottom:16, background:'var(--navy-2)', border:'1px solid var(--border)', padding:12, borderRadius:10 }}>
      <h4 style={{ marginBottom:8 }}>Create Post</h4>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ marginBottom:8 }} />
      <textarea placeholder="Short caption" value={body} onChange={e => setBody(e.target.value)} rows={3} style={{ marginBottom:8 }} />
      <input placeholder="Image URL (optional)" value={image} onChange={e => setImage(e.target.value)} style={{ marginBottom:8 }} />
      <div style={{ display:'flex', gap:8 }}>
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : 'Post'}</button>
      </div>
    </form>
  )
}

export default function BlogFeed() {
  const [posts, setPosts] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(null)
  const limit = 8
  const sentinel = useRef()

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!sentinel.current) return
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !loading && (total === null || offset < total)) {
          load()
        }
      })
    })
    obs.observe(sentinel.current)
    return () => obs.disconnect()
  }, [sentinel.current, loading, offset, total])

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/posts?limit=${limit}&offset=${offset}`)
      // server returns { items, total, offset, limit }
      setPosts(prev => [...prev, ...data.items])
      setOffset(prev => prev + data.items.length)
      setTotal(data.total)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const onCreated = (p) => {
    setPosts(prev => [p, ...prev])
    setTotal(t => t + 1)
    setOffset(o => o + 1)
  }

  return (
    <div style={{ padding:'24px 5vw' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <h2 style={{ marginBottom:12 }}>Blog & Community</h2>
        <PostCreate onCreated={onCreated} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:16 }}>
          {posts.map(p => (
            p.is_hidden ? null : (
              <div key={p.id}>
                <PostCard post={p} />
                <PostDetail post={p} refreshPost={async () => { try { await load() } catch(e){} }} />
              </div>
            )
          ))}
        </div>
        <div ref={sentinel} style={{ height: 30 }} />
        <div style={{ textAlign:'center', marginTop:18 }}>
          {loading ? 'Loading…' : (total !== null && offset >= total ? 'No more posts' : '')}
        </div>
      </div>
    </div>
  )
}
