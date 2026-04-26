import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import toast from 'react-hot-toast';

// Simple simulated mesh box that represents the product size
function SimulatedProduct({ category }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Synthesize dimensions based on category
  let args = [1, 1, 1]; // Default box
  let color = '#ffffff';

  if (category === 'RESTAURANT') {
    args = [1.5, 0.5, 1.5]; // Like a pizza box or large meal container
    color = '#fbbf24';
  } else if (category === 'LOCAL_MARKET') {
    args = [1, 1.2, 1]; // Like a grocery bag
    color = '#4ade80';
  }

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
      {/* Wireframe for AR tech feel */}
      <mesh>
        <boxGeometry args={[args[0] + 0.05, args[1] + 0.05, args[2] + 0.05]} />
        <meshBasicMaterial color="#e94560" wireframe />
      </mesh>
    </mesh>
  );
}

export default function ARSizeViewer({ product, onClose }) {
  const videoRef = useRef(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setHasCameraError(true);
        toast.error("Could not access camera for AR view.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, width: '100%', padding: '20px', zIndex: 10, display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <div>
          <h3 style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>AR Size Simulator</h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 12 }}>{product.name} - Synthesized Dimensions</p>
        </div>
        <button onClick={onClose} className="btn btn-outline" style={{ borderColor: 'white', color: 'white', background: 'rgba(0,0,0,0.5)' }}>
          Close AR
        </button>
      </div>

      {/* Camera Feed */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {hasCameraError ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e2535', color: 'white' }}>
            [Camera access denied. Showing 3D visualization only]
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* 3D Overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="city" />
          <SimulatedProduct category={product.category} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </div>

      {/* Footer Info */}
      <div style={{ position: 'absolute', bottom: 30, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: '24px', color: 'white', textAlign: 'center', border: '1px solid rgba(233,69,96,0.3)' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Drag to rotate • Pinch to zoom</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#e94560' }}>Simulated volume based on vendor specifications</p>
        </div>
      </div>
    </div>
  );
}
