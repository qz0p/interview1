import { Router } from 'express';
import { exportResultsToExcel } from '../controllers/admin.controller';

const router = Router();

router.get('/export', exportResultsToExcel as any);

export default router;
