import { Router } from 'express';
import { dailyReport, exportReportController } from '../controllers/reportsController.js';

const router = Router();
router.get('/daily', dailyReport);
router.get('/export', exportReportController);

export default router;
