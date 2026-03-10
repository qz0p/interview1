'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    className: '',
    project: '',
    regret: '',
    goal: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      if (!res.ok) throw new Error(data.error || '제출 실패');

      router.push(`/interview?phone=${encodeURIComponent(formData.phone)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.badge}>남한고등학교 3학년 정규 동아리</div>
        <h1 className={styles.title}>
          END<span className={styles.accent}>LINE</span>
        </h1>
        <p className={styles.slogan}>끝내자, 제대로.</p>
        <p className={styles.desc}>
          1·2학년 때의 아쉬운 프로젝트를<br />3학년에서 완성으로 바꾸는 동아리
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>동아리 지원서</h2>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>이름</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
              />
            </div>
            <div className={styles.field}>
              <label>반</label>
              <input
                type="text"
                name="className"
                required
                value={formData.className}
                onChange={handleChange}
                placeholder="예: 3-2"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>전화번호</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
            />
          </div>

          <div className={styles.field}>
            <label>1·2학년 때 진행한 프로젝트 소개</label>
            <textarea
              name="project"
              required
              rows={4}
              value={formData.project}
              onChange={handleChange}
              placeholder="어떤 프로젝트였는지, 무엇을 만들었는지 설명해주세요."
            />
          </div>

          <div className={styles.field}>
            <label>아쉬웠던 점</label>
            <textarea
              name="regret"
              required
              rows={3}
              value={formData.regret}
              onChange={handleChange}
              placeholder="당시 프로젝트에서 아쉬웠거나 완성하지 못한 부분을 적어주세요."
            />
          </div>

          <div className={styles.field}>
            <label>3학년에서 이루고 싶은 목표</label>
            <textarea
              name="goal"
              required
              rows={3}
              value={formData.goal}
              onChange={handleChange}
              placeholder="엔드라인에서 어떤 것을 완성하고 싶은지 적어주세요."
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? '제출 중...' : '지원서 제출 및 AI 면접 시작 →'}
          </button>
        </form>
      </div>
    </main>
  );
}
