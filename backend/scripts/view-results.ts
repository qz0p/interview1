/**
 * END LINE - 면접 결과 조회 스크립트
 * 실행: npx ts-node scripts/view-results.ts
 *
 * - DB에서 모든 지원자 + 면접 결과를 가져옵니다.
 * - 터미널에 표로 출력합니다.
 * - 엑셀 파일(results.xlsx)로 저장합니다.
 */

import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const applications = await prisma.application.findMany({
    include: { interview: true },
    orderBy: { createdAt: 'asc' },
  });

  if (applications.length === 0) {
    console.log('\n아직 지원자가 없습니다.\n');
    return;
  }

  // ── 터미널 출력 ──────────────────────────────────────
  console.log('\n========================================');
  console.log('  END LINE 동아리 면접 결과');
  console.log('========================================\n');

  applications.forEach((app, idx) => {
    const iv = app.interview;
    console.log(`[${idx + 1}] ${app.name} (${app.className}) | ${app.phone}`);
    console.log(`  프로젝트: ${app.project}`);
    console.log(`  아쉬웠던 점: ${app.regret}`);
    console.log(`  목표: ${app.goal}`);
    console.log(`  면접 여부: ${app.isInterviewed ? '완료' : '미완료'}`);
    if (iv) {
      console.log(`  점수: ${iv.score ?? 'N/A'}`);
      console.log(`  피드백: ${iv.feedback ?? 'N/A'}`);

      const qa = iv.qa as { question: string; answer: string }[];
      if (qa && qa.length > 0) {
        console.log('  면접 Q&A:');
        qa.forEach((item, qIdx) => {
          console.log(`    Q${qIdx + 1}. ${item.question}`);
          console.log(`    A${qIdx + 1}. ${item.answer}`);
        });
      }
    }
    console.log('');
  });

  // ── 엑셀 저장 ────────────────────────────────────────
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('면접 결과');

  sheet.columns = [
    { header: '이름', key: 'name', width: 12 },
    { header: '반', key: 'className', width: 10 },
    { header: '전화번호', key: 'phone', width: 16 },
    { header: '프로젝트 소개', key: 'project', width: 40 },
    { header: '아쉬웠던 점', key: 'regret', width: 35 },
    { header: '목표', key: 'goal', width: 35 },
    { header: '면접 완료', key: 'done', width: 10 },
    { header: '점수', key: 'score', width: 8 },
    { header: 'AI 피드백', key: 'feedback', width: 50 },
    { header: '면접 Q&A', key: 'qa', width: 80 },
  ];

  // 헤더 스타일
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6B21A8' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  applications.forEach((app) => {
    const iv = app.interview;
    const qa = iv?.qa as { question: string; answer: string }[] | undefined;
    const qaText = qa
      ? qa.map((q, i) => `Q${i + 1}. ${q.question}\nA${i + 1}. ${q.answer}`).join('\n\n')
      : '';

    sheet.addRow({
      name: app.name,
      className: app.className,
      phone: app.phone,
      project: app.project,
      regret: app.regret,
      goal: app.goal,
      done: app.isInterviewed ? '완료' : '미완료',
      score: iv?.score ?? '',
      feedback: iv?.feedback ?? '',
      qa: qaText,
    });
  });

  // 줄바꿈 적용
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { wrapText: true, vertical: 'top' };
    }
  });

  const outputPath = path.join(__dirname, '..', 'results.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ 총 ${applications.length}명 조회 완료`);
  console.log(`📁 엑셀 저장 위치: ${outputPath}\n`);
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
