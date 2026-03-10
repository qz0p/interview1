'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InterviewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('id');
  
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    startInterview();
  }, [studentId]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'assistant', content: data.question }]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const isLast = messages.length >= 9; // ~5 rounds of Q&A
      const res = await fetch(`${apiUrl}/api/interviews/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          qa: newMessages,
          isFinished: isLast,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isLast) {
        setFinished(true);
        setResult(data);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.question }]);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    return (
      <div className="glass" style={{ textAlign: 'center' }}>
        <h2>면접 완료!</h2>
        <p>수고하셨습니다. 결과는 자동으로 기록되었습니다.</p>
        <div style={{ marginTop: '2rem' }}>
          <p>내 점수 (예상): {result?.score}</p>
          <p>피드백: {result?.feedback}</p>
        </div>
        <button className="btn" onClick={() => window.location.href='/'}>홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="glass">
      <h2>AI 면접 진행 중</h2>
      <p>질문에 답변을 입력해 주세요.</p>
      
      <div className="chat-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'assistant' ? 'ai' : 'user'}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="message ai">생각 중...</div>}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="답변을 입력하세요..."
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn" onClick={handleSend} disabled={loading}>전송</button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
