import { status } from '../utils/status';

import { getCurrentTimeStamp } from '../utils/helperFunctions';

import constants from '../utils/constants';

import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';

const dbClient = getClient();

import { jsonErrorResponse } from '../utils/responseHelper';


/**
  * Method to create a new task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const createTask = async (req, res) => {
    const successMessage = { status: 'success' };

    // Get body parameters to create a new task
    const { name, description, startDate, dueDate, priority, assignedTo } = req.body;

    // Validate parameters to make sure they are provided
    if (!name) {
        return jsonErrorResponse(res, 'A task name must be provided', status.bad);
    }

    if (!startDate || !moment(startDate).isValid()) {
        return jsonErrorResponse(res, 'A valid start date must be provided', status.bad);
    }

    if (!dueDate || !moment(dueDate).isValid()) {
        return jsonErrorResponse(res, 'A valid due date must be provided', status.bad);
    }

    // Check if start date is greater than due date
    if (moment(startDate).isAfter(moment(dueDate))) {
        return jsonErrorResponse(res, 'The due date must be greater than the start date', status.bad);
    }

    if (!priority) {
        return jsonErrorResponse(res, 'A priority must be provided', status.bad);
    }

    if (!assignedTo) {
        return jsonErrorResponse(res, 'An assignee must be provided', status.bad);
    }

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Data object to create a new document in the task collection
        const data = {
            name: name.trim(),
            description,
            status: constants.taskStatusToDo,
            priority: priority.trim(),
            startDate: moment(startDate).toDate(),
            dueDate: moment(dueDate).toDate(),
            assignedTo: assignedTo.trim(),
            createdAt: getCurrentTimeStamp(),
        };

        // Insert the document into the the collection
        const result = await dbClient.collection(constants.taskCollection).insertOne(data);

        successMessage.message = 'Task created successfully';
        successMessage.taskId = result.insertedId;
        successMessage.status = status.success;

        // Return successful JSON response back to the client
        res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error);
        return jsonErrorResponse(res, 'An error occurred while creating the task', status.error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to update/edit a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const updateTask = async (req, res) => {
    const successMessage = { status: 'success' };
    const requestData = req.body;
    const taskId = req.params.id;

    // Check if the task id is passed
    if (!taskId) {
        return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    // Check if at least one field can be updated
    if (!requestData.name && !requestData.description && !requestData.priority && !requestData.startDate && !requestData.dueDate && !requestData.assignedTo) {
        return jsonErrorResponse(res, 'At least one field must be provided to update the task', status.bad);
    }

    // Check if document with task id exists in the collection
    const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

    // Return JSON error response if task does not exist
    if (!checkIfTaskExist) {
        return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
    }

    // Build update query
    const updateQuery = {
        $set: {
            name: requestData.name,
            description: requestData.description,
            priority: requestData.priority,
            startDate: requestData.startDate,
            dueDate: requestData.dueDate,
            assignedTo: requestData.assignedTo,
            updatedAt: getCurrentTimeStamp(),
        },
    };

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Update task in database
        const updatedTask = await dbClient.collection(constants.taskCollection).findOneAndUpdate(
            { _id: new ObjectId(taskId) },
            updateQuery,
            { returnOriginal: false }
        );

        // Check if task was updated successfully
        if (updatedTask.value) {
            successMessage.message = 'Task updated successfully';
            successMessage.status = status.success;
            successMessage.task = updatedTask.value;

            res.status(status.success).send(successMessage);
        } else {
            return jsonErrorResponse(res, 'An error occurred while updating task', status.error);
        }
    } catch (error) {
        console.log(error);
        return jsonErrorResponse(res, 'An error occurred while updating task', status.error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to list all tasks
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllTasks = async (req, res) => {
    const successMessage = { status: 'success' };

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Query to get all tasks from the collection
        const tasks = await dbClient.collection(constants.taskCollection).find({}).toArray();

        successMessage.message = 'All tasks';
        successMessage.data = tasks;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.error(error);
        jsonErrorResponse(res, 'An error occurred while getting all tasks', status.error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to list all tasks by project id
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllTasksByProjectId = async (req, res) => {
    const successMessage = { status: 'success' };

    // Get project id from the query
    const { projectId } = req.query;

    // Check if the project id is passed
    if (!projectId) {
        return jsonErrorResponse(res, 'A project id must be provided', status.bad);
    }

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Filter the tasks collection by project id
        const filterResponse = await dbClient.collection(constants.taskCollection).find({ "project.projectId": projectId }).toArray();

        successMessage.message = 'Tasks gotten successfully';
        successMessage.status = status.success;
        successMessage.data = filterResponse;

        res.status(status.success).send(successMessage);
    } catch (error) {
        return jsonErrorResponse(res, 'An error occurred while getting tasks by project id', status.error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to delete a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const deleteTask = async (req, res) => {
    const successMessage = { status: 'success' };

    // Destructure the req.params object and get the task id
    const { id: taskId } = req.params;

    //Check if the task id is passed
    if (!taskId) {
        return jsonErrorResponse(res, 'A task id name must be provided', status.bad);
    }

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Check if document with task id exists in the collection
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
        }

        // delete data from the collection
        const deleteResponse = await dbClient.collection(constants.taskCollection).deleteOne({ _id: new ObjectId(taskId) });

        // Check if the delete was successful
        if (!deleteResponse) {
            return jsonErrorResponse(res, 'An error occurred while deleting task', status.error);
        } else {
            successMessage.message = 'Task deleted successfully';
            successMessage.status = status.success;

            res.status(status.success).send(successMessage);
        }

    } catch (error) {
        console.log(error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to change the status of a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const changeStatusOfTask = async (req, res) => {
    const { id } = req.params;
    const { status: taskStatus } = req.body;

    // Validate parameters
    if (!id) {
        return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    if (!taskStatus) {
        return jsonErrorResponse(res, 'A task status must be provided', status.bad);
    }

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Check if document with task id exists in the collection
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(id) });

        if (!checkIfTaskExist) {
            return jsonErrorResponse(res, `Task with id ${id} does not exist`, status.notfound);
        }

        // Prepare the update object
        const data = {
            $set: {
                status: taskStatus,
                updatedAt: getCurrentTimeStamp(),
            },
        };

        // Check the task status to handle start and due dates

        if (taskStatus === constants.taskStatusDone || taskStatus === constants.taskStatusClosed) {
            data.$set.dateCompleted = moment().toDate();
        
        } else if (taskStatus === constants.taskStatusToDo) {
            // Ideally we would prompt the the user to choose their new start and due dates
            const newStartDate = moment().toDate();
            const newDueDate = moment().add(1, 'day').toDate();

            data.$set.startDate = newStartDate;
            data.$set.dueDate = newDueDate;
            data.$set.dateCompleted = null;
        
        } else {
            // Handle other statuses like cancelled, etc...
            data.$set.dateCompleted = null;
        }

        // Update the task status
        const updateResult = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(id) }, data);

        if (!updateResult.matchedCount) {
            return jsonErrorResponse(res, `Task with id ${id} could not be updated`, status.error);
        }

        const successMessage = {
            status: status.success,
            message: 'Task status changed successfully',
        };

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to search tasks by name
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const searchTasksByName = async (req, res) => {
    const successMessage = { message: 'Search completed.', status: status.success };
    const { name } = req.query;

    // Validate name parameter is passed
    if (!name) {
        return jsonErrorResponse(res, 'A search parameter (task name) must be provided', status.bad);
    }

    const searchKeyword = name.trim();

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Creating a regex object to perform a search
        const regexQuery = new RegExp(searchKeyword, 'i');

        // Searches the collection for the document using the search keywork
        const searchResponse = await dbClient.collection(constants.taskCollection).findOne({ name: regexQuery });

        successMessage.data = searchResponse;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to filter task list by status
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const filterTasksByStatus = async (req, res) => {
    const { status: taskStatus } = req.params;

    // Validate parameters
    if (!taskStatus) {
        return jsonErrorResponse(res, 'A status must be provided', status.bad);
    }

    try {
        // Initialize mongo db connection
        await initMongoDBConnection();

        // Filter the task collection using the status of a task
        const filterResponse = await dbClient.collection(constants.taskCollection).find({ status: taskStatus.trim() }).toArray();

        const successMessage = {
            status: status.success,
            message: 'Tasks successfully filtered.',
            data: filterResponse,
        };

        res.status(status.success).send(successMessage);
    } catch (error) {
        return jsonErrorResponse(res, 'An error occurred while filtering tasks', status.error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

/**
  * Method to sort tasks by start date, due date and date completed
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortTasks = async (req, res) => {
    const successMessage = { status: 'success' };
    const requestParams = req.params;

    if (!requestParams.sortParameter) {
        return jsonErrorResponse(res, 'A sort parameter must be provided', status.bad);
    }

    const sortParameter = requestParams.sortParameter.trim();

    try {
                // Initialize mongo db connection
        await initMongoDBConnection();

        const sortCriteria = {};

        switch (sortParameter) {
            case "startDate":
                sortCriteria.startDate = 1; // sort by ascending start date
                break;
            case "dueDate":
                sortCriteria.dueDate = -1; // sort by descending due date
                break;
            case "dateCompleted":
                sortCriteria.dateCompleted = -1; // sort by descending date completed
                break;
            default:
                return jsonErrorResponse(res, `Invalid sort parameter. Can only be 'startDate', 'dueDate' or 'dateCompleted'`, status.bad);
        }

        const sortResponse = await dbClient.collection(constants.taskCollection).find().sort(sortCriteria).toArray();

        successMessage.message = 'Tasks sorted successfully.';
        successMessage.data = sortResponse;
        successMessage.sortCriteria = sortParameter;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        // Close mongodb connection
        await endMongoConnection();
    }
}

export {
    createTask,
    updateTask,
    getAllTasks,
    getAllTasksByProjectId,
    deleteTask,
    changeStatusOfTask,
    searchTasksByName,
    filterTasksByStatus,
    sortTasks
}; 