import { Router } from 'express';
import { getPublicContent } from '../controllers/contentController.js';

export const contentRouter = Router();

contentRouter.get('/', getPublicContent);