import { Router } from 'express';
import { createTransaction, deleteTransaction, listTransactions } from '../controllers/transactionsController.js';

const router = Router();
router.get('/', listTransactions);
router.post('/', createTransaction);
router.delete('/:id', deleteTransaction);

export default router;
