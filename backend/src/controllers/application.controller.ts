import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { studentId, name, phone, activities, plan } = req.body;

    if (!studentId || !name || !phone || !activities || !plan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const application = await prisma.application.create({
      data: {
        studentId,
        name,
        phone,
        activities,
        plan,
      },
    });

    res.status(201).json(application);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This student ID has already applied' });
    }
    console.error('Application submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const application = await prisma.application.findUnique({
      where: { studentId },
      include: { interview: true },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
