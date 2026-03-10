'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    phone: '',
    activities: '',
    plan: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      alert('Application submitted! Now starting the interview.');
      router.push(`/interview?id=${formData.studentId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>동아리 지원하기</h1>
        <p style={{ textAlign: 'center' }}>AI 면접을 통해 당신의 열정을 보여주세요.</p>

        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>학번</label>
            <input
              type="text"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              placeholder="예: 20240001"
            />
          </div>

          <div className="input-group">
            <label>이름</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>전화번호</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="010-0000-0000"
            />
          </div>

          <div className="input-group">
            <label>활동 이력 (자신이 활동한 내용 입력)</label>
            <textarea
              required
              rows={4}
              value={formData.activities}
              onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>동아리 계획</label>
            <textarea
              required
              rows={4}
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
            />
          </div>

          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? '제출 중...' : '지원서 제출 및 면접 시작'}
          </button>
        </form>
      </div>
    </main>
  );
}
