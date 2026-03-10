'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function InterviewContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phone) return;
    startInterview();
  }, [phone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages([{ role: 'assistant', content: data.question }]);
      setQuestionCount(1);
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
      const newCount = questionCount + 1;
      const isLast = newCount > 5;

      const res = await fetch(`${apiUrl}/api/interviews/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, qa: newMessages, isFinished: isLast }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (isLast) {
        setFinished(true);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.question }]);
        setQuestionCount(newCount);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    return (
      <div className={styles.done}>
        <div className={styles.doneIcon}>✓</div>
        <h2>면접 완료!</h2>
        <p>수고하셨습니다.<br />결과는 추후 개별 연락을 통해 알려드립니다.</p>
        <a href="/" className={styles.backBtn}>처음으로</a>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.logo}>ENDLINE</span>
        <span className={styles.progress}>{questionCount} / 5</span>
      </div>

      <div className={styles.chat}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.bubble} ${m.role === 'assistant' ? styles.ai : styles.user}`}>
            {m.role === 'assistant' && <span className={styles.aiLabel}>AI 면접관</span>}
            <p>{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className={`${styles.bubble} ${styles.ai}`}>
            <span className={styles.aiLabel}>AI 면접관</span>
            <p className={styles.typing}>답변 생성 중...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="답변을 입력하세요..."
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>로딩 중...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
