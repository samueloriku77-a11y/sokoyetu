import { useRef, useState, useEffect } from 'react'
import api from '../api'

export default function Capture({ listingId, requireCamera = true, onDone }) {
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      videoRef.current.srcObject = s
      await videoRef.current.play()
      setStream(s)
      setCapturing(true)
    } catch (err) {
      console.error('Camera start failed', err)
      setCapturing(false)
    }
  }

  async function takePhoto() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.8))
    await uploadCapture(blob)
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setCapturing(false)
  }

  async function uploadCapture(fileBlob) {
    try {
      // gather metadata
      let coords = null
      if (navigator.geolocation) {
        coords = await new Promise((resolve) => navigator.geolocation.getCurrentPosition(p => resolve(p.coords), () => resolve(null), { enableHighAccuracy: true, maximumAge: 30000 }))
      }

      const metadata = {
        timestamp: new Date().toISOString(),
        gps: coords ? { lat: coords.latitude, lng: coords.longitude } : null,
        user_agent: navigator.userAgent,
        vendor_id: JSON.parse(localStorage.getItem('user') || 'null')?.id || null,
        session_hash: localStorage.getItem('session_hash') || Math.random().toString(36).slice(2)
      }

      const fd = new FormData()
      fd.append('file', fileBlob, 'capture.jpg')
      fd.append('metadata', JSON.stringify(metadata))

      const res = await api.post(`/listings/${listingId}/capture`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onDone && onDone(res.data)
    } catch (err) {
      console.error('Upload failed', err)
      alert('Upload failed: ' + (err.response?.data?.detail || err.message))
    }
  }

  return (
    <div>
      {(!capturing && requireCamera) && (
        <div>
          <button className="btn" onClick={startCamera}>Open Camera</button>
        </div>
      )}

      {capturing && (
        <div>
          <video ref={videoRef} style={{ width: '100%', maxHeight: 480 }} playsInline />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={takePhoto}>Capture</button>
            <button className="btn" onClick={() => { stream?.getTracks().forEach(t => t.stop()); setCapturing(false) }}>Cancel</button>
          </div>
        </div>
      )}

      {!navigator.mediaDevices && (
        <div>
          <p>Camera not available — choose file</p>
          <input type="file" accept="image/*" capture="environment" onChange={e => uploadCapture(e.target.files[0])} />
        </div>
      )}
    </div>
  )
}
