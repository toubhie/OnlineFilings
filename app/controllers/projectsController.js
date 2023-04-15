import { status } from '../utils/status';

import { getCurrentTimeStamp } from '../utils/helperFunctions';

import constants from '../utils/constants';

import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';

const dbClient = getClient();

import { jsonErrorResponse } from '../utils/responseHelper';

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
    return jsonErrorResponse(res, 'A project name must be provided', status.bad);
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
      return jsonErrorResponse(res, 'An error occurred while creating project', status.error);
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
    return jsonErrorResponse(res, 'A project id must be provided', status.bad);
  }

  if (requestData.name == null || requestData.name == undefined) {
    return jsonErrorResponse(res, 'A project name must be provided', status.bad);
  }

  if (requestData.status == null || requestData.status == undefined) {
    return jsonErrorResponse(res, 'A project status must be provided', status.bad);
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

    const projectId = req.params.id;

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
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
        return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
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
    return jsonErrorResponse(res, 'A project id must be provided', status.bad);
  }

  try {
    initMongoDBConnection();

    const projectId = req.params.id;

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
    }

    // delete data
    const deleteTask = await dbClient.collection(constants.projectCollection).deleteOne({ _id: new ObjectId(projectId) });

    if (!deleteTask) {
      return jsonErrorResponse(res, 'An error occurred while deleting project', status.error);
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
    if (requestData.taskId == null || requestData.taskId == undefined) {
      return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    //Check if the project id is passed
    if (requestData.projectId == null || requestData.projectId == undefined) {
      return jsonErrorResponse(res, 'A project id must be provided', status.bad);
    }

    try {
      initMongoDBConnection();

      const taskId = requestData.taskId;
      const projectId = requestData.projectId;

      // Check if task id exists
      const taskData = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

      if (!taskData) {
        return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
      }

      // Check if project id exists
      const projectData = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

      if (!projectData) {
        return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
      }

      // Check if the task is already in the destination project
      if (taskData.project !== undefined && taskData.project.projectId === projectId) {
        return jsonErrorResponse(res, 'Task is already in the destination project', status.bad);
      }

      const newDataForTaskCollection = {
        $set: {
          project: {
            projectId: projectId,
            projectName: projectData.name
          },
          updatedAt: getCurrentTimeStamp()
        }
      };

      const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, newDataForTaskCollection, (err, collection) => {
        if (err) {
          return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
        } else {
          return collection;
        }
      });

      const newDataForProjectCollection = {
        $push: {
          tasks: {
            taskId: taskId,
            taskName: taskData.name
          }
        }
      }

      //Add task to task object in project collection
      const updateProjectResponse = await dbClient.collection(constants.projectCollection).updateOne({ _id: new ObjectId(projectId) }, newDataForProjectCollection, (err, collection) => {
        if (err) {
          return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
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
  * Method to move a task from one project to another project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const moveTaskBetweenProjects = async (req, res) => {
  let successMessage = { status: 'success' };
  const requestData = req.body;

  try {
    //Check if the task id is passed
    if (requestData.taskId == null || requestData.taskId == undefined) {
      return jsonErrorResponse(res, 'A task id must be provided', status.bad);
    }

    //Check if the project id is passed
    if (requestData.sourceProjectId == null || requestData.sourceProjectId == undefined) {
      return jsonErrorResponse(res, 'A source project id must be provided', status.bad);
    }

    if (requestData.destinationProjectId == null || requestData.destinationProjectId == undefined) {
      return jsonErrorResponse(res, 'A destination project id must be provided', status.bad);
    }

    try {
      initMongoDBConnection();

      const taskId = requestData.taskId;
      const sourceProjectId = requestData.sourceProjectId;
      const destinationProjectId = requestData.destinationProjectId;

      // Check if task id exists
      const taskData = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

      if (!taskData) {
        return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
      }

      // Check if source project id exists
      const sourceProjectData = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(sourceProjectId) });

      if (!sourceProjectData) {
        return jsonErrorResponse(res, `Source project with id ${sourceProjectId} does not exist`, status.notfound);
      }

      // Check if desctination project id exists
      const destinationProjectData = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(destinationProjectId) });

      if (!destinationProjectData) {
        return jsonErrorResponse(res, `Destination project with id ${destinationProjectId} does not exist`, status.notfound);
      }

      // Check if the task is in the source project
      if (taskData.project !== undefined && taskData.project.projectId !== sourceProjectId) {
        return jsonErrorResponse(res, 'Task is not in the source project', status.bad);
      }

      // Check if the task is already in the destination project
      if (taskData.project !== undefined && taskData.project.projectId === destinationProjectId) {
        return jsonErrorResponse(res, 'Task is already in the destination project', status.bad);
      }


      const newDataForDestinationProjectCollection = {
        $push: {
          tasks: {
            taskId: taskId,
            taskName: taskData.name
          }
        }
      }

      //Add task to task object in destination project collection
      const updateDestinationProjectResponse = await dbClient.collection(constants.projectCollection).updateOne({ _id: new ObjectId(destinationProjectId) }, newDataForDestinationProjectCollection, (err, collection) => {
        if (err) {
          return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
        } else {
          return collection;
        }
      });


      //Remove task from source project collection
      const result = await dbClient.collection(constants.projectCollection).updateOne(
        { _id: new ObjectId(sourceProjectId) },
        { $pull: { tasks: { $in: [taskId] } } }
      );

      console.log('result', result);

      //Update task collection with new project id
      const newDataForTaskCollection = {
        $set: {
          project: {
            projectId: destinationProjectId,
            projectName: destinationProjectData.name
          },
          updatedAt: getCurrentTimeStamp()
        }
      };

      const updateResponse = await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, newDataForTaskCollection, (err, collection) => {
        if (err) {
          return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
        } else {
          return collection;
        }
      });

      successMessage.message = `Task (${taskId}) has successfully been moved to project with id: ${destinationProjectId}`;
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
    return jsonErrorResponse(res, 'A project name must be provided', status.bad);
  }

  const projectName = (queryParams.projectName).trim();

  try {
    initMongoDBConnection();

    const filterResponse = await dbClient.collection(constants.taskCollection).find({ "project.projectName": projectName }).toArray(function (err, result) {
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
  * Method to sort projects by dates (startDate & dueDate)
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortProjectsByDates = async (req, res) => {
  let successMessage = { status: 'success' };
  const queryParams = req.query;

  if (queryParams.sortParameter == null || queryParams.sortParameter == undefined) {
    return jsonErrorResponse(res, 'A sort parameter must be provided', status.bad);
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
      return jsonErrorResponse(res, `Invalid sort parameter. Can only be 'startDate' or 'dueDate'`, status.bad);
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
  moveTaskBetweenProjects,
  filterTasksByProjectName,
  sortProjectsByDates
}; 