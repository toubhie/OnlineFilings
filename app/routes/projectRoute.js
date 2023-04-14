import express from 'express';
import { 
    createProject,
    updateProject,
    getAllProjects,
    deleteProject,
    assignTaskToProject
} from '../controllers/projectsController';

const router = express.Router();

router.post('/', createProject);

router.put('/:id', updateProject);

router.get('/', getAllProjects);

router.delete('/:id', deleteProject);

router.post('/assign', assignTaskToProject);


export default router;