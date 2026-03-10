import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'END LINE — 끝내자, 제대로.',
  description: '남한고등학교 3학년 IT·AI 프로젝트 완성 동아리 엔드라인 지원 페이지',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
