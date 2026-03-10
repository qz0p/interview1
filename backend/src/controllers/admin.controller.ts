import ExcelJS from 'exceljs';
import { Response } from 'express';
import prisma from '../utils/prisma';

export const exportResultsToExcel = async (req: Request, res: any) => {
  try {
    const applications = await prisma.application.findMany({
      include: { interview: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Interview Results');

    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Name', key: 'name', width: 15 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Activities', key: 'activities', width: 30 },
      { header: 'Plan', key: 'plan', width: 30 },
      { header: 'Interviewed', key: 'isInterviewed', width: 12 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Feedback', key: 'feedback', width: 40 },
    ];

    applications.forEach((application: any) => {
      worksheet.addRow({
        studentId: application.studentId,
        name: application.name,
        phone: application.phone,
        activities: application.activities,
        plan: application.plan,
        isInterviewed: application.isInterviewed ? 'Yes' : 'No',
        score: application.interview?.score ?? 'N/A',
        feedback: application.interview?.feedback ?? 'N/A',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'interview_results.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
