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
    let successMessage = { status: 'success' };
    const requestData = req.body;

    if (requestData.name == null || requestData.name == undefined) {
        return jsonErrorResponse(res, 'A task name must be provided', status.bad);
    }

    if (requestData.startDate == null || requestData.startDate == undefined) {
        return jsonErrorResponse(res, 'A start date must be provided', status.bad);
    }

    if (requestData.dueDate == null || requestData.dueDate == undefined) {
        return jsonErrorResponse(res, 'A due date must be provided', status.bad);
    }

    // Check is start date is greater due date
    if (moment(requestData.startDate).isAfter(moment(requestData.dueDate))) {
        return jsonErrorResponse(res, 'The due date must be greater than the start date', status.bad);
    }

    if (requestData.priority == null || requestData.priority == undefined) {
        return jsonErrorResponse(res, 'A priority must be provided', status.bad);
    }

    if (requestData.assignedTo == null || requestData.assignedTo == undefined) {
        return jsonErrorResponse(res, 'An assignee must be provided', status.bad);
    }

    if (requestData.projectId == null || requestData.projectId == undefined) {
        return jsonErrorResponse(res, 'A project Id must be provided', status.bad);
    }

    try {
        initMongoDBConnection();

        const data = {
            name: (requestData.name).trim(),
            description: requestData.description,
            status: constants.statusPending,
            priority: (requestData.priority).trim(),
            startDate: (requestData.startDate).trim(),
            dueDate: (requestData.dueDate).trim(),
            assignedTo: (requestData.assignedTo).trim(),
            projectId: (requestData.projectId).trim(),
            createdAt: getCurrentTimeStamp(),
        };

        const result = await dbClient.collection(constants.taskCollection).insertOne(data);

        if (result) {
            successMessage.message = 'Task created successfully';
            successMessage.taskId = result.insertedId;
            successMessage.status = status.success;

            res.status(status.success).send(successMessage);
        } else {
            return jsonErrorResponse(res, 'An error occurred while creating the task', status.error);
        }

    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to update/edit a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const updateTask = async (req, res) => {
    let successMessage = { status: 'success' };
    const requestData = req.body;

    //Check if the task id is passed
    if (req.params.id == null || req.params.id == undefined) {
        return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    if (requestData.name == null || requestData.name == undefined) {
        return jsonErrorResponse(res, 'A task name must be provided', status.bad);
    }

    if (requestData.startDate == null || requestData.startDate == undefined) {
        return jsonErrorResponse(res, 'A start date must be provided', status.bad);
    }

    if (requestData.dueDate == null || requestData.dueDate == undefined) {
        return jsonErrorResponse(res, 'A due date must be provided', status.bad);
    }

    // Check is start date is greater due date
    if (moment(requestData.startDate).isAfter(moment(requestData.dueDate))) {
        return jsonErrorResponse(res, 'The due date must be greater than the start date', status.bad);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
        }

        const data = {
            $set: {
                name: (requestData.name).trim(),
                description: requestData.description,
                priority: (requestData.priority).trim(),
                startDate: (requestData.startDate).trim(),
                dueDate: (requestData.dueDate).trim(),
                assignedTo: (requestData.assignedTo).trim(),
                updatedAt: getCurrentTimeStamp(),
            }
        };

        const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, data, (err, collection) => {
            if (err) {
                return jsonErrorResponse(res, 'An error occurred while updating task', status.error);
            } else {
                return collection;
            }
        });

        successMessage.message = 'Task updated successfully';
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to list all tasks
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllTasks = async (req, res) => {
    let successMessage = { status: 'success' };

    try {
        initMongoDBConnection();

        const response = await dbClient.collection(constants.taskCollection).find({}).toArray(function (err, result) {
            return err || result;
        });

        successMessage.message = 'All tasks';
        successMessage.data = response;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);

    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to delete a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const deleteTask = async (req, res) => {
    let successMessage = { status: 'success' };

    //Check if the task id is passed
    if (req.params.id == null || req.params.id == undefined) {
        return jsonErrorResponse(res, 'A task id name must be provided', status.bad);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
        }

        // delete data
        const deleteTask = await dbClient.collection(constants.taskCollection).deleteOne({ _id: new ObjectId(taskId) });

        if (!deleteTask) {
            return jsonErrorResponse(res, 'An error occurred while deleting task', status.error);
        } else {
            successMessage.message = 'Task deleted successfully';
            successMessage.taskId = taskId;
            successMessage.status = status.success;

            res.status(status.success).send(successMessage);
        }

    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to change the status of a task
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const changeStatusOfTask = async (req, res) => {
    let successMessage = { status: 'success' };
    const requestData = req.body;

    //Check if the task id is passed
    if (req.params.id == null || req.params.id == undefined) {
        return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    if (requestData.status == null || requestData.status == undefined) {
        return jsonErrorResponse(res, 'A task status must be provided', status.bad);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
        }

        const data = {
            $set: {
                status: (requestData.status).trim(),
                updatedAt: getCurrentTimeStamp(),
            }
        };

        const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, data, (err, collection) => {
            if (err) {
                return jsonErrorResponse(res, 'An error occurred while changing status of task', status.error);
            } else {
                return collection;
            }
        });

        successMessage.message = 'Task status changed successfully';
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to search tasks by name
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const searchTasksByName = async (req, res) => {
    let successMessage = { status: 'success' };

    const queryParams = req.query;

    if (queryParams.name == null || queryParams.name == undefined) {
        return jsonErrorResponse(res, 'A search parameter (task name) must be provided', status.bad);
    }

    const searchKeyword = (queryParams.name).trim();

    try {
        initMongoDBConnection();

        const regexQuery = new RegExp(searchKeyword, 'i');

        const searchResponse = await dbClient.collection(constants.taskCollection).find({ name: regexQuery }).toArray(function (err, result) {
            return err || result;
        });

        successMessage.message = 'Search completed.';
        successMessage.data = searchResponse;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to filter task list by status
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const filterTasksByStatus = async (req, res) => {
    let successMessage = { status: 'success' };
    const requestParams = req.params;

    if (requestParams.status == null || requestParams.status == undefined) {
        return jsonErrorResponse(res, 'A status must be provided', status.bad);
    }

    const statusQuery = (requestParams.status).trim();

    try {
        initMongoDBConnection();

        const filterResponse = await dbClient.collection(constants.taskCollection).find({ status: statusQuery }).toArray(function (err, result) {
            if (err) {
                return jsonErrorResponse(res, 'An error occurred while filtering task', status.error);
            } else {
                return result;
            }
        });

        successMessage.message = 'Tasks successfully filtered.';
        successMessage.data = filterResponse;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

/**
  * Method to sort tasks by start date, due date and date completed
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortTasks = async (req, res) => {
    let successMessage = { status: 'success' };
    const requestParams = req.params;

    if (requestParams.sortParameter == null || requestParams.sortParameter == undefined) {
        return jsonErrorResponse(res, 'A sort parameter must be provided', status.bad);
    }

    const sortParameter = (requestParams.sortParameter).trim();

    try {
        initMongoDBConnection();

        const sortCriteria = {};

        if (sortParameter === "startDate") {
            sortCriteria.startDate = 1; // sort by ascending start date
        } else if (sortParameter === "dueDate") {
            sortCriteria.dueDate = -1; // sort by descending due date
        } else if (sortParameter === "dateCompleted") {
            sortCriteria.dateCompleted = -1; // sort by descending date completed
        } else {
            return jsonErrorResponse(res, `Invalid sort parameter. Can only be 'startDate', 'dueDate' or 'dateCompleted'`, status.bad);
        }

        const sortResponse = await dbClient.collection(constants.taskCollection).find().sort(sortCriteria).toArray(function (err, result) {
            return err || result;
        });

        successMessage.message = 'Tasks sorted successfully.';
        successMessage.data = sortResponse;
        successMessage.sortCriteria = sortParameter;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
    } catch (error) {
        console.log(error);
    } finally {
        endMongoConnection();
    }
}

export {
    createTask,
    updateTask,
    getAllTasks,
    deleteTask,
    changeStatusOfTask,
    searchTasksByName,
    filterTasksByStatus,
    sortTasks
}; 