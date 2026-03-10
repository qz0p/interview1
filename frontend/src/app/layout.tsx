import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Club Interview Portal',
  description: 'Apply and interview with AI for our club.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="container">
          <nav className="navbar">
            <div className="logo">AI INTERVIEW</div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
