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
  * Method to create a new project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const createProject = async (req, res) => {
  let successMessage = { status: 'success' };
  const requestData = req.body;

  if (requestData.name == null || requestData.name == undefined) {
    errorMessage.message = 'A project name must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.startDate == null || requestData.startDate == undefined) {
    errorMessage.message = 'A start date must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.dueDate == null || requestData.dueDate == undefined) {
    errorMessage.message = 'An due date must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  // Check is start date is greater due date
  if (moment(requestData.startDate).isAfter(moment(requestData.dueDate))) {
    errorMessage.message = 'due date must be greater than start date';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  try {
    initMongoDBConnection();

    const data = {
      name: (requestData.name).trim(),
      description: requestData.description,
      status: constants.statusStarted,
      startDate: (requestData.startDate).trim(),
      dueDate: (requestData.dueDate).trim(),
      createdAt: getCurrentTimeStamp(),
    };

    const result = await dbClient.collection(constants.projectCollection).insertOne(data);

    if (result) {
      successMessage.message = 'Project created successfully';
      successMessage.projectId = result.insertedId;
      successMessage.status = status.success;

      res.status(status.success).send(successMessage);
    } else {
      errorMessage.message = 'An error occurred while creating project';
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
  * Method to update/edit a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const updateProject = async (req, res) => {
  let successMessage = { status: 'success' };
  const requestData = req.body;

  //Check if the project id is passed
  if (req.params.id == null || req.params.id == undefined) {
    errorMessage.message = 'A project id name must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.name == null || requestData.name == undefined) {
    errorMessage.message = 'A project name must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.status == null || requestData.status == undefined) {
    errorMessage.message = 'A project status must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.startDate == null || requestData.startDate == undefined) {
    errorMessage.message = 'A start date must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  if (requestData.dueDate == null || requestData.dueDate == undefined) {
    errorMessage.message = 'An due date must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  // Check is start date is greater due date
  if (moment(requestData.startDate).isAfter(moment(requestData.dueDate))) {
    errorMessage.message = 'due date must be greater than start date';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  try {
    initMongoDBConnection();

    const projectId = req.params.id;

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      errorMessage.message = `Project with id ${projectId} does not exist`;
      errorMessage.status = status.bad;

      return res.status(status.bad).send(errorMessage);
    }

    const data = {
      $set: {
        name: (requestData.name).trim(),
        description: requestData.description,
        status: (requestData.status).trim(),
        startDate: (requestData.startDate).trim(),
        dueDate: (requestData.dueDate).trim(),
        updatedAt: getCurrentTimeStamp(),
      }
    };

    await dbClient.collection(constants.projectCollection).updateOne({ _id: new ObjectId(projectId) }, data, (err, collection) => {
      if (err) {
        errorMessage.message = 'An error occurred while updating project';
        errorMessage.status = status.error;

        return res.status(status.error).send(errorMessage);
      } else {
        successMessage.message = 'Project updated successfully';
        successMessage.collection = collection;
        successMessage.status = status.success;

        res.status(status.success).send(successMessage);
      }
    });
  } catch (error) {
    console.log(error);
  } finally {
    endMongoConnection();
  }
}

/**
  * Method to list all projects
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllProjects = async (req, res) => {
  let successMessage = { status: 'success' };

  try {
    initMongoDBConnection();

    const response = await dbClient.collection(constants.projectCollection).find({}).toArray(function (err, result) {
      return err || result;
    })

    successMessage.message = 'All projects';
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
  * Method to delete a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const deleteProject = async (req, res) => {
  let successMessage = { status: 'success' };

  //Check if the project id is passed
  if (req.params.id == null || req.params.id == undefined) {
    errorMessage.message = 'A project id name must be provided';
    errorMessage.status = status.notfound;

    return res.status(status.notfound).send(errorMessage);
  }

  try {
    initMongoDBConnection();

    const projectId = req.params.id;

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      errorMessage.message = `Project with id ${projectId} does not exist`;
      errorMessage.status = status.bad;

      return res.status(status.bad).send(errorMessage);
    }

    // delete data
    const deleteTask = await dbClient.collection(constants.projectCollection).deleteOne({ _id: new ObjectId(projectId) });

    if (!deleteTask) {
      errorMessage.message = 'An error occurred while deleting project';
      errorMessage.status = status.error;

      return res.status(status.error).send(errorMessage);
    } else {
      successMessage.message = 'Project deleted successfully';
      successMessage.projectId = deleteTask;
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
  * Method to assign a task to a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const assignTaskToProject = async (req, res) => {
  let successMessage = { status: 'success' };
  const requestData = req.body;

  try {
    //Check if the task id is passed
    if (req.params.taskId == null || req.params.taskId == undefined) {
      errorMessage.message = 'A task id must be provided';
      errorMessage.status = status.notfound;

      return res.status(status.notfound).send(errorMessage);
    }

    //Check if the project id is passed
    if (req.params.projectId == null || req.params.projectId == undefined) {
      errorMessage.message = 'A project id must be provided';
      errorMessage.status = status.notfound;

      return res.status(status.notfound).send(errorMessage);
    }

    try {
      initMongoDBConnection();

      const taskId = req.params.taskId;
      const projectId = req.params.projectId;

      // Check if task id exists
      const checkIfTaskExist = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

      if (!checkIfTaskExist) {
        errorMessage.message = `Task with id ${taskId} does not exist`;
        errorMessage.status = status.bad;

        return res.status(status.bad).send(errorMessage);
      }

      // Check if project id exists
      const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

      if (!checkIfProjectExist) {
        errorMessage.message = `Project with id ${projectId} does not exist`;
        errorMessage.status = status.bad;

        return res.status(status.bad).send(errorMessage);
      }

      const data = {
        projectId: (requestData.projectId).trim(),
        updatedAt: getCurrentTimeStamp(),
      };

      const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, data, (err, collection) => {
        if (err) {
          errorMessage.message = 'An error occurred while assigning task';
          errorMessage.status = status.error;

          return res.status(status.error).send(errorMessage);
        } else {
          return collection;
        }
      });

      successMessage.message = `Task (${taskId}) has successfully been assigned to project with id: ${projectId}`;
      successMessage.status = status.success;

      res.status(status.success).send(successMessage);
    } catch (error) {
      console.log(error);
    } finally {
      endMongoConnection();
    }
  } catch (error) {
    console.log(error);
  }
}

/**
  * Method to filter tasks by project name
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const filterTasksByProjectName = async (req, res) => {
  let successMessage = { status: 'success' };
  const queryParams = req.query;

    if (queryParams.projectName == null || queryParams.projectName == undefined) {
        errorMessage.message = 'A project name must be provided';
        errorMessage.status = status.notfound;

        return res.status(status.notfound).send(errorMessage);
    }

    const projectName = (queryParams.projectName).trim();

  try {
      initMongoDBConnection();

      // Get project by 

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
  * Method to sort projects by dates (startDate & dueDate)
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortProjectsByDates = async (req, res) => {
  let successMessage = { status: 'success' };
  const queryParams = req.query;

  if (queryParams.sortParameter == null || queryParams.sortParameter == undefined) {
      errorMessage.message = 'A sort parameter must be provided';
      errorMessage.status = status.notfound;

      return res.status(status.notfound).send(errorMessage);
  }

  const sortParameter = (queryParams.sortParameter).trim();

  try {
      initMongoDBConnection();

      const sortCriteria = {};

      if (sortParameter === "startDate") {
          sortCriteria.startDate = 1; // sort by ascending start date
      } else if (sortParameter === "dueDate") {
          sortCriteria.dueDate = -1; // sort by descending due date
      } else {
          errorMessage.message = `Invalid sort parameter. Can only be 'startDate' or 'dueDate'`;
          errorMessage.status = status.bad;

          return res.status(status.bad).send(errorMessage);
      }

      const sortResponse = await dbClient.collection(constants.projectCollection).find().sort(sortCriteria).toArray(function (err, result) {
          return err || result;
      });
     
      successMessage.message = 'Projects sorted successfully.';
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
  createProject,
  updateProject,
  getAllProjects,
  deleteProject,
  assignTaskToProject,
  filterTasksByProjectName,
  sortProjectsByDates
}; 