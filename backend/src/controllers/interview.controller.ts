import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getInterviewQuestion, gradeInterview } from '../services/openai.service';

export const startInterview = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const application = await prisma.application.findUnique({
      where: { phone },
      include: { interview: true },
    });

    if (!application) {
      return res.status(404).json({ error: '지원서를 찾을 수 없습니다.' });
    }

    if (application.isInterviewed) {
      return res.status(403).json({ error: '이미 면접을 완료했습니다.' });
    }

    const firstQuestion = await getInterviewQuestion([
      {
        name: application.name,
        className: application.className,
        project: application.project,
        regret: application.regret,
        goal: application.goal,
      },
    ]);

    res.json({ question: firstQuestion });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { phone, qa, isFinished } = req.body;

    const application = await prisma.application.findUnique({
      where: { phone },
    });

    if (!application) return res.status(404).json({ error: '지원서를 찾을 수 없습니다.' });

    if (isFinished) {
      const formattedQA = [];
      for (let i = 0; i < qa.length; i += 2) {
        formattedQA.push({
          question: qa[i]?.content,
          answer: qa[i + 1]?.content,
        });
      }

      const { score, feedback } = await gradeInterview(application, formattedQA);

      await prisma.application.update({
        where: { id: application.id },
        data: { isInterviewed: true },
      });

      await prisma.interview.create({
        data: {
          applicationId: application.id,
          qa: formattedQA,
          score,
          feedback,
        },
      });

      // score/feedback은 관리자만 볼 수 있도록 응답에서 제외
      return res.json({ message: '면접이 완료되었습니다.' });
    }

    const nextQuestion = await getInterviewQuestion([
      {
        name: application.name,
        className: application.className,
        project: application.project,
        regret: application.regret,
        goal: application.goal,
      },
      ...qa,
    ]);

    res.json({ question: nextQuestion });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
