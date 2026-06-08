import { Router } from 'express';
import { createMenu, deleteMenu, listMenus, updateMenu } from '../controllers/menusController.js';

const router = Router();
router.get('/', listMenus);
router.post('/', createMenu);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

export default router;
