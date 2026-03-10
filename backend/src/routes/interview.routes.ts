import { Router } from 'express';
import { startInterview, submitAnswer } from '../controllers/interview.controller';

const router = Router();

router.post('/start', startInterview);
router.post('/answer', submitAnswer);

export default router;
