import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check } from 'lucide-react';

const WebcamCapture = ({ onCapture, initialImage = null }) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(initialImage);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    onCapture(imageSrc);
  }, [webcamRef, onCapture]);

  const reset = () => {
    setImage(null);
    onCapture(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ 
          position: 'relative', 
          width: '260px', 
          height: '260px', 
          borderRadius: '2rem', 
          overflow: 'hidden', 
          border: '4px solid rgba(6, 182, 212, 0.3)', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          backgroundColor: '#1e293b' 
        }}>
        {!image ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            videoConstraints={{ width: 400, height: 400, facingMode: "user" }}
          />
        ) : (
          <img src={image} alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      
      {!image ? (
        <button
          type="button"
          onClick={capture}
          className="btn btn-primary"
          style={{ width: 'auto', borderRadius: '2rem', padding: '0.75rem 2rem' }}
        >
          <Camera size={20} />
          Capture Photo
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={reset}
            className="btn btn-secondary"
            style={{ borderRadius: '2rem', background: '#334155', color: '#fff', border: 'none' }}
          >
            <RefreshCw size={18} />
            Retake
          </button>
          <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1.5rem', 
              backgroundColor: 'rgba(16, 185, 129, 0.2)', 
              color: '#34d399', 
              borderRadius: '2rem', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: '500'
            }}>
            <Check size={18} />
            Ready
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
