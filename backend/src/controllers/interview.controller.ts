import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { getInterviewQuestion, gradeInterview } from '../services/openai.service';

export const startInterview = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const application = await prisma.application.findUnique({
      where: { studentId },
      include: { interview: true },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.isInterviewed) {
      return res.status(403).json({ error: 'You have already completed the interview' });
    }

    // Initial greeting and first question
    const firstQuestion = await getInterviewQuestion([
      { name: application.name, activities: application.activities, plan: application.plan },
      { role: 'assistant', content: `Hello ${application.name}, I am your AI interviewer. Let's start. Can you tell me more about your interest in this club?` },
    ]);

    res.json({ question: firstQuestion });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { studentId, qa, isFinished } = req.body; // qa is array of {role, content}
    
    const application = await prisma.application.findUnique({
      where: { studentId },
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (isFinished) {
      // Grade and save
      const transcript = qa.filter((m: any) => m.role !== 'system');
      const formattedQA = [];
      for (let i = 0; i < transcript.length; i += 2) {
        formattedQA.push({
          question: transcript[i]?.content,
          answer: transcript[i + 1]?.content,
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

      return res.json({ message: 'Interview finished', score, feedback });
    }

    const nextQuestion = await getInterviewQuestion([
      { name: application.name, activities: application.activities, plan: application.plan },
      ...qa,
    ]);

    res.json({ question: nextQuestion });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
