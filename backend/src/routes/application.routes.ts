import { Router } from 'express';
import { submitApplication, getApplicationStatus } from '../controllers/application.controller';

const router = Router();

router.post('/', submitApplication);
router.get('/:phone', getApplicationStatus);

export default router;
