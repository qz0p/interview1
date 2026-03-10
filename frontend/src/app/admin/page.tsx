'use client';

export default function AdminPage() {
  const handleExport = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${apiUrl}/api/admin/export`, '_blank');
  };

  return (
    <div className="glass" style={{ textAlign: 'center' }}>
      <h1>관리자 대시보드</h1>
      <p>전체 지원자 현황 및 면접 결과를 엑셀로 다운로드할 수 있습니다.</p>
      
      <div style={{ marginTop: '3rem' }}>
        <button className="btn" onClick={handleExport}>면접 결과 엑셀 다운로드</button>
      </div>
    </div>
  );
}
