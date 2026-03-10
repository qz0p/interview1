import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { phone, name, className, project, regret, goal } = req.body;

    if (!phone || !name || !className || !project || !regret || !goal) {
      return res.status(400).json({ error: '모든 항목을 입력해주세요.' });
    }

    const application = await prisma.application.create({
      data: { phone, name, className, project, regret, goal },
    });

    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: '이미 지원한 전화번호입니다.' });
    }
    console.error('Application submission error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

export const getApplicationStatus = async (req: Request, res: Response) => {
  try {
    const phone = req.params.phone as string;
    const application = await prisma.application.findUnique({
      where: { phone },
      include: { interview: true },
    });

    if (!application) {
      return res.status(404).json({ error: '지원서를 찾을 수 없습니다.' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
