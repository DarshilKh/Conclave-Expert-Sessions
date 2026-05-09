import { Router } from 'express';
import {
  getExperts,
  getExpertById,
  getCategories,
} from '../controllers/expertController.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getExperts);
router.get('/:id', getExpertById);

export default router;
