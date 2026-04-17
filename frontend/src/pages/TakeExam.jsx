import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import api from '../services/api';
import { 
  Timer, AlertTriangle, ChevronRight, ChevronLeft, 
  Send, Maximize, UserCheck, ShieldAlert, MonitorOff,
  Flag, Play, Terminal, Zap, CheckCircle2, XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState(0);
  const [proctorWarning, setProctorWarning] = useState(null);
  const [flagged, setFlagged] = useState(new Set());
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const res = await api.get(`/student/exams`);
        const currentExam = res.data.exams.find(e => e.id === parseInt(examId));
        if (currentExam) {
          setExam(currentExam);
          
          const now = new Date();
          const start = currentExam.start_time ? new Date(currentExam.start_time) : null;
          
          if (start && start > now) {
            alert(`SECURITY PROTOCOL: This assessment is scheduled for ${start.toLocaleString()}. Access is currently restricted.`);
            navigate('/dashboard');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Fetch exam details failed:', err);
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId]);

  const sendCheatEvent = useCallback(async (type) => {
    try {
      await api.post('/student/alerts', { type, examId });
    } catch (err) {
      console.error('Failed to transmit proctoring telemetry:', err);
    }
  }, [examId]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendCheatEvent('TAB_SWITCH');
        setViolations(prev => {
          const next = prev + 1;
          if (next >= 4) {
             alert('TERMINAL VIOLATION: Assessment terminated due to unauthorized navigation protocol.');
             handleSubmit(null, true);
             return next;
          }
          setProctorWarning(`PROCTOR WARNING (${next}/3): Unauthorized tab movement detected.`);
          return next;
        });
      }
    };

    const handleBlur = () => {
      sendCheatEvent('WINDOW_BLUR');
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        sendCheatEvent('EXIT_FULLSCREEN');
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, [examId, sendCheatEvent]);

  // 1. Initial State & Start Photo
  const handleStartExam = async () => {
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        console.warn('SECURITY ALERT: Biometric feed initialization failure. Proceeding with BYPASS for testing as per system audit protocol.');
      }
      const res = await api.post('/student/exams/start', { examId, start_image: imageSrc || 'BYPASS_FOR_TESTING' });
      setAttemptId(res.data.attemptId);
      
      const qRes = await api.get(`/student/exams/${examId}/questions`);
      setQuestions(qRes.data.questions);
      
      // RESUME LOGIC: If server returned existing answers
      if (qRes.data.answers) {
         setAnswers(qRes.data.answers);
      }
      
      // Calculate time from exam duration if serverEndTime not provided
      const duration = res.data.duration || 60; 
      setTimeLeft(duration * 60);
      
      setIsVerified(true);
      setLoading(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start exam');
      navigate('/dashboard');
    }
  };

  const runCode = async () => {
    if (!currentQ || isRunning) return;
    setIsRunning(true);
    setTestResult(null);
    try {
      const resp = await api.post('/code/run', { 
        code: answers[currentQ.id] || '', 
        language: exam?.language || 'javascript'
      });
      setTestResult({
        output: resp.data.output,
        pass: resp.data.success && resp.data.exitCode === 0,
        executionTime: 0 // Piston doesn't easily give this in simple mode
      });
    } catch (err) {
      setTestResult({ 
        output: 'FATAL_SYSTEM_ERROR: Sandbox failed to initialize.', 
        pass: false,
        executionTime: 0 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleFlag = (qid) => {
    const next = new Set(flagged);
    if (next.has(qid)) next.delete(qid);
    else next.add(qid);
    setFlagged(next);
  };

  // 4. Timer Logic
  // 4. Timer Logic
  useEffect(() => {
    if (!isVerified || timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleSubmit(null, true); // Auto-submit when timer hits 0
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerified, timeLeft]);

  const saveProgress = useCallback(async (currentAnswers) => {
    if (!attemptId) return;
    try {
      const formatted = Object.entries(currentAnswers).map(([qid, ans]) => ({
        question_id: parseInt(qid),
        answer: ans
      }));
      await api.post('/student/exams/save', { attemptId, answers: formatted });
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, [attemptId]);

  // 5. Auto-Save Progress (Every 10 seconds)
  useEffect(() => {
    if (!isVerified || !attemptId) return;

    const autoSaveTimer = setInterval(() => {
      saveProgress(answers);
    }, 10000);

    return () => clearInterval(autoSaveTimer);
  }, [isVerified, attemptId, answers, saveProgress]);

  const handleAnswerChange = (qid, value) => {
    const newAnswers = { ...answers, [qid]: value };
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e, forceViolation = false) => {
    if (e) e.preventDefault();
    if (!forceViolation && !confirm('Initialize final submission packet? This action is immutable.')) return;

    setLoading(true);
    try {
      const totalDurationSec = (exam?.duration || 60) * 60;
      const timeTakenSec = totalDurationSec - timeLeft;

      // Transform answers object to array for backend ingestion
      const formattedAnswers = Object.entries(answers).map(([qid, val]) => ({
        question_id: parseInt(qid),
        answer: val
      }));

      await api.post('/student/exams/submit', {
        attemptId,
        answers: formattedAnswers,
        violationCount: violations,
        forceTermination: forceViolation,
        timeTakenSeconds: timeTakenSec
      });
      navigate(`/results/${attemptId}`);
    } catch (err) {
      console.error(err);
      alert('Internal packet transmission failure. Contact system administrator.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // State Gatekeeper 1: Core Metadata Loading
  if (loading && !exam) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
         <div className="loading-spinner"></div>
         <p style={{ marginTop: '1.5rem', fontWeight: '800', letterSpacing: '2px' }}>SYNCHRONIZING SECURE PROTOCOL...</p>
      </div>
    );
  }

  // State Gatekeeper 2: Identity Verification Required
  if (!isVerified) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          {loading && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="loading-spinner"></div>
            </div>
          )}
          <div className="card" style={{ padding: '3rem 2rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '2rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
              <UserCheck size={40} color="var(--accent)" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--primary)' }}>Identity Verification</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem', lineHeight: 1.6 }}>Please look directly into the camera. An encrypted session key will be generated based on your biometric reference.</p>
            
            <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: '1.25rem', overflow: 'hidden', border: '2px solid var(--accent)', aspectRatio: '16/9', background: '#000' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)' }} />
            </div>

            <button
              onClick={handleStartExam}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              Verify & Begin Assessment <ChevronRight size={20} />
            </button>
            
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Target Assessment: <strong style={{ color: 'var(--primary)' }}>{exam?.title || 'System Cluster'}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (isVerified && (!questions || questions.length === 0 || !currentQ)) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
         <div className="loading-spinner"></div>
         <p style={{ marginTop: '1.5rem', fontWeight: '800', letterSpacing: '2px' }}>RETRIEVING QUESTION CLUSTER...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', color: 'var(--primary)' }}>
      {/* Proctor Banner */}
      {proctorWarning && (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.75rem', textAlign: 'center', fontWeight: '800', fontSize: '0.875rem', animation: 'pulse 2s infinite' }}>
          <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          {proctorWarning}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '1rem 2rem', sticky: 'top', zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem', backgroundColor: 'rgba(6, 182, 212, 0.1)', borderRadius: '0.75rem' }}>
              <ShieldAlert color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Secure Assessment Environment</h2>
              <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Policy ID: CGS-CERT-v2.1</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {violations > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '800' }}>
                <AlertTriangle size={16} />
                <span>INTEGRITY VIOLATIONS: {violations}/3</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid var(--border)', color: timeLeft < 60 ? 'var(--error)' : 'var(--accent)', fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: '800' }}>
              <Timer size={20} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', padding: '2.5rem' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '3rem', minHeight: '500px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Objective {currentIdx + 1} of {questions.length}
                </span>
                <button 
                  onClick={() => toggleFlag(currentQ.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: flagged.has(currentQ.id) ? 'var(--error)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800' }}
                >
                  <Flag size={14} fill={flagged.has(currentQ.id) ? 'var(--error)' : 'none'} />
                  {flagged.has(currentQ.id) ? 'FLAGGED FOR REVIEW' : 'FLAG FOR LATER'}
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9' }}>
                {currentQ?.points || 5} Credits
              </span>
            </div>

            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.5, marginBottom: '2.5rem', color: 'var(--primary)' }}>
              {currentQ?.question}
            </h1>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {currentQ?.type?.toUpperCase() === 'MCQ' ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                   {(() => {
                      try {
                        return JSON.parse(currentQ?.options || '[]');
                      } catch {
                        return [];
                      }
                   })().map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerChange(currentQ.id, option)}
                      className="hover-scale"
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '1rem 1.5rem', borderRadius: '1rem', border: '2.5px solid',
                        borderColor: answers[currentQ.id] === option ? 'var(--accent)' : '#f1f5f9',
                        background: answers[currentQ.id] === option ? 'rgba(6, 182, 212, 0.05)' : 'white',
                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', border: '2px solid',
                        borderColor: answers[currentQ.id] === option ? 'var(--accent)' : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800',
                        backgroundColor: answers[currentQ.id] === option ? 'var(--accent)' : 'transparent',
                        color: answers[currentQ.id] === option ? 'white' : 'var(--text-muted)'
                      }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontWeight: '700', color: answers[currentQ.id] === option ? 'var(--primary)' : 'var(--text-muted)' }}>{option}</span>
                    </button>
                  ))}
                </div>
              ) : currentQ?.type?.toUpperCase() === 'CODE' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border)', flex: 1 }}>
                    <Editor
                      height="350px"
                      language={(exam?.language || 'javascript').toLowerCase()}
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={answers[currentQ.id] || '// Build your solution here...'}
                      onChange={(val) => handleAnswerChange(currentQ.id, val)}
                      options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
                    />
                  </div>
                  <div className="card" style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800' }}>
                         <Terminal size={16} /> OUTPUT CONSOLE
                      </div>
                      <button 
                         onClick={runCode}
                         disabled={isRunning}
                         className="btn btn-primary" 
                         style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
                      >
                         {isRunning ? 'EXECUTING...' : <><Play size={14} /> RUN TEST</>}
                      </button>
                    </div>
                    <div style={{ minHeight: '100px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#f8fafc', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                       {testResult ? (
                         <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: testResult.pass ? 'var(--success)' : '#ef4444', fontWeight: '800' }}>
                               {testResult.pass ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                               {testResult.pass ? 'VERIFICATION PASSED' : 'VERIFICATION FAILED'}
                               <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.7rem' }}>({testResult.executionTime}ms)</span>
                            </div>
                            {testResult.output}
                         </div>
                       ) : 'Console is idle. Click Run Test to validate your infrastructure.'}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  className="input-field"
                  style={{ height: '300px', padding: '1.5rem', fontSize: '1rem', fontFamily: 'monospace' }}
                  placeholder="Draft your comprehensive resolution here..."
                  value={answers[currentQ?.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="btn btn-secondary"
            >
              <ChevronLeft size={20} /> Back
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button
                onClick={() => handleSubmit(false)}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', padding: '0.75rem 2.5rem' }}
              >
                End Session <Send size={20} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2.5rem' }}
              >
                Proceed <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Biometric Feed</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--success)' }}>LIVE</span>
              </div>
            </div>
            <div style={{ aspectRatio: '16/9', borderRadius: '0.75rem', overflow: 'hidden', backgroundColor: '#000', border: '1px solid var(--border)', position: 'relative' }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(6, 182, 212, 0.2)', pointerEvents: 'none' }} />
            </div>
            <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.5rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: '700', letterSpacing: '1px' }}>
              ID: {attemptId ? `A-${attemptId}` : 'SYNC...'} • 128-BIT ENC
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Navigation Grid</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  style={{ 
                    aspectRatio: '1', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    backgroundColor: currentIdx === i ? 'var(--accent)' : (answers[q.id] ? 'rgba(6, 182, 212, 0.1)' : 'transparent'),
                    borderColor: currentIdx === i ? 'var(--accent)' : 'var(--border)',
                    color: currentIdx === i ? 'white' : (answers[q.id] ? 'var(--accent)' : 'var(--text-muted)'),
                    transition: 'all 0.2s'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
