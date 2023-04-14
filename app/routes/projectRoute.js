import express from 'express';
import { 
    createProject,
    updateProject,
    getAllProjects,
    deleteProject,
    assignTaskToProject,
    filterTasksByProjectName,
    sortProjectsByDates
} from '../controllers/projectsController';

const router = express.Router();

router.post('/', createProject);

router.put('/:id', updateProject);

router.get('/', getAllProjects);

router.delete('/:id', deleteProject);

router.post('/:projectId/tasks/:taskId', assignTaskToProject);

router.get('/:projectName/tasks', filterTasksByProjectName);

router.get('/sort', sortProjectsByDates);

export default router;