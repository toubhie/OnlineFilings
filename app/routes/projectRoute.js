import express from 'express';
import {
    createProject,
    updateProject,
    getAllProjects,
    deleteProject,
    assignTaskToProject,
    moveTaskBetweenProjects,
    filterTasksByProjectName,
    sortProjectsByDates
} from '../controllers/projectsController';

const router = express.Router();

router.post('/', createProject);

router.put('/:id', updateProject);

router.get('/', getAllProjects);

router.delete('/:id', deleteProject);

router.post('/assign-task', assignTaskToProject);

router.post('/move-task-between-projects', moveTaskBetweenProjects);

router.get('/filter', filterTasksByProjectName);

router.get('/sort', sortProjectsByDates);

export default router;