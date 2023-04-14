import {
    errorMessage,
    status,
} from '../utils/status';

import { getCurrentTimeStamp } from '../utils/helperFunctions';

import constants from '../utils/constants';

import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';

const dbClient = getClient();


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
        errorMessage.message = 'A task name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.startDate == null || requestData.startDate == undefined) {
        errorMessage.message = 'A start date must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.endDate == null || requestData.endDate == undefined) {
        errorMessage.message = 'An end date must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    // Check is start date is greater end date
    if (moment(requestData.startDate).isAfter(moment(requestData.endDate))) {
        errorMessage.message = 'End date must be greater than start date';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.priority == null || requestData.priority == undefined) {
        errorMessage.message = 'A priority must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.assignedTo == null || requestData.assignedTo == undefined) {
        errorMessage.message = 'An assignee must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.projectId == null || requestData.projectId == undefined) {
        errorMessage.message = 'A project Id must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    try {
        initMongoDBConnection();

        const data = {
            name: (requestData.name).trim(),
            description: requestData.description,
            status: constants.statusPending,
            priority: (requestData.priority).trim(),
            startDate: (requestData.startDate).trim(),
            endDate: (requestData.endDate).trim(),
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
            errorMessage.message = 'An error occurred while creating the task';
            errorMessage.status = status.error;

            return res.status(status.error).send(errorMessage);
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
        errorMessage.message = 'A task id name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.name == null || requestData.name == undefined) {
        errorMessage.message = 'A task name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.startDate == null || requestData.startDate == undefined) {
        errorMessage.message = 'A start date must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.endDate == null || requestData.endDate == undefined) {
        errorMessage.message = 'An end date must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    // Check is start date is greater end date
    if (moment(requestData.startDate).isAfter(moment(requestData.endDate))) {
        errorMessage.message = 'End date must be greater than start date';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            errorMessage.message = `Task with id ${taskId} does not exist`;
            errorMessage.status = status.bad;

            return res.status(status.bad).send(errorMessage);
        }

        const data = {
            $set: {
                name: (requestData.name).trim(),
                description: requestData.description,
                priority: (requestData.priority).trim(),
                startDate: (requestData.startDate).trim(),
                endDate: (requestData.endDate).trim(),
                assignedTo: (requestData.assignedTo).trim(),
                updatedAt: getCurrentTimeStamp(),
            }
        };

        const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, data, (err, collection) => {
            if (err) {
                errorMessage.message = 'An error occurred while updating task';
                errorMessage.status = status.error;

                return res.status(status.error).send(errorMessage);
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
        errorMessage.message = 'A task id name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            errorMessage.message = `Task with id ${taskId} does not exist`;
            errorMessage.status = status.bad;

            return res.status(status.bad).send(errorMessage);
        }

        // delete data
        const deleteTask = await dbClient.collection(constants.taskCollection).deleteOne({ _id: new ObjectId(taskId) });

        if (!deleteTask) {
            errorMessage.message = 'An error occurred while deleting task';
            errorMessage.status = status.error;

            return res.status(status.error).send(errorMessage);
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
        errorMessage.message = 'A task id name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    if (requestData.status == null || requestData.status == undefined) {
        errorMessage.message = 'A task status must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    try {
        initMongoDBConnection();

        const taskId = req.params.id;

        // Check if ID exists
        const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

        if (!checkIfTaskExist) {
            errorMessage.message = `Task with id ${taskId} does not exist`;
            errorMessage.status = status.bad;

            return res.status(status.bad).send(errorMessage);
        }

        const data = {
            $set: {
                status: (requestData.status).trim(),
                updatedAt: getCurrentTimeStamp(),
            }
        };

        const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, data, (err, collection) => {
            if (err) {
                errorMessage.message = 'An error occurred while changing status of task';
                errorMessage.status = status.error;

                return res.status(status.error).send(errorMessage);
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
        errorMessage.message = 'A search parameter (name) must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    const searchKeyword = (queryParams.name).trim();

    try {
        initMongoDBConnection();

        const regexQuery = new RegExp(searchKeyword, 'i');
        
        const searchResponse = await dbClient.collection(constants.taskCollection).find({ name: regexQuery }).toArray(function (err, result){
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
        errorMessage.message = 'A status must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    const statusQuery = (requestParams.status).trim();

    try {
        initMongoDBConnection();

        const filterResponse = await dbClient.collection(constants.taskCollection).find({ status: statusQuery }).toArray(function (err, result) {
            if (err) {
                errorMessage.message = 'An error occurred while filtering task';
                errorMessage.status = status.error;

                return res.status(status.error).send(errorMessage);
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
  * Method to sort tasks by start date, end date and date completed
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortTasks = async (req, res) => {
    let successMessage = { status: 'success' };
    const requestParams = req.params;

    if (requestParams.sortParameter == null || requestParams.sortParameter == undefined) {
        errorMessage.message = 'A sort parameter must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    const sortParameter = (requestParams.sortParameter).trim();

    try {
        initMongoDBConnection();

        const sortCriteria = {};

        if (sortParameter === "startDate") {
            sortCriteria.startDate = 1; // sort by ascending start date
        } else if (sortParameter === "endDate") {
            sortCriteria.endDate = -1; // sort by descending end date
        } else if (sortParameter === "dateCompleted") {
            sortCriteria.dateCompleted = -1; // sort by descending date completed
        } else {
            errorMessage.message = `Invalid sort parameter. Can only be 'startDate', 'endDate' or 'dateCompleted'`;
            errorMessage.status = status.bad;

            return res.status(status.bad).send(errorMessage);
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