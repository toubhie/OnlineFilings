import express from 'express';
import { 
    getAllProjects,
    getAllTasks
} from '../controllers/aggregationController';

const router = express.Router();

router.get('/projects', getAllProjects);

router.get('/tasks', getAllTasks);

export default router;