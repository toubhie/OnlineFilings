import express from 'express';
import { 
    createTask,
    updateTask,
    getAllTasks,
    deleteTask,
    changeStatusOfTask,
    searchTasksByName,
    filterTasksByStatus,
    sortTasks
} from '../controllers/tasksController';

const router = express.Router();

router.post('/', createTask);

router.put('/:id', updateTask);

router.get('/', getAllTasks);

router.delete('/:id', deleteTask);

router.patch('/:id', changeStatusOfTask);

router.get('/search', searchTasksByName);

router.get('/status/:status', filterTasksByStatus);

router.get('/sort/:sortParameter', sortTasks);


export default router;