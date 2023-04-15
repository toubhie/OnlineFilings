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
  const successMessage = { status: 'success' };

  try {
    const { name, description, startDate, dueDate } = req.body;

    if (!name) {
      return jsonErrorResponse(res, 'A project name must be provided', status.bad);
    }

    if (!startDate) {
      return jsonErrorResponse(res, 'A start date must be provided', status.bad);
    }

    if (!dueDate) {
      return jsonErrorResponse(res, 'A due date must be provided', status.bad);
    }

    const startDateMoment = moment(startDate, 'YYYY-MM-DD', true);
    const dueDateMoment = moment(dueDate, 'YYYY-MM-DD', true);

    if (!startDateMoment.isValid()) {
      return jsonErrorResponse(res, 'Invalid start date format', status.bad);
    }

    if (!dueDateMoment.isValid()) {
      return jsonErrorResponse(res, 'Invalid due date format', status.bad);
    }

    if (startDateMoment.isAfter(dueDateMoment)) {
      return jsonErrorResponse(res, 'The due date must be greater than the start date', status.bad);
    }

    // Initialize mongo db connection
    await initMongoDBConnection();

    const data = {
      name: name.trim(),
      description: description.trim(),
      status: constants.statusStarted,
      startDate: startDateMoment.toDate(),
      dueDate: dueDateMoment.toDate(),
      createdAt: getCurrentTimeStamp()
    };

    const result = await dbClient.collection(constants.projectCollection).insertOne(data);

    if (result.insertedId) {
      successMessage.message = 'Project created successfully';
      successMessage.status = status.success;
      successMessage.projectId = result.insertedId;

      res.status(status.success).send(successMessage);
    } else {
      return jsonErrorResponse(res, 'An error occurred while creating project', status.error);
    }
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while creating project', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to update/edit a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const updateProject = async (req, res) => {
  const requestData = req.body;
  const successMessage = { status: 'success' };
  const { id: projectId } = req.params;

  // Check if the project id is passed
  if (!projectId) {
    return jsonErrorResponse(res, 'A project id must be provided', status.bad);
  }

  const fields = ['name', 'status', 'startDate', 'dueDate'];
  for (let field of fields) {
    if (requestData[field] == null) {
      return jsonErrorResponse(res, `A ${field} must be provided`, status.bad);
    }
    requestData[field] = requestData[field].trim();
  }

  // Check if start date is greater than due date
  if (moment(requestData.startDate).isAfter(moment(requestData.dueDate))) {
    return jsonErrorResponse(res, 'The due date must be greater than the start date', status.bad);
  }

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
    }

    const data = {
      $set: {
        name: requestData.name,
        description: requestData.description,
        status: requestData.status,
        startDate: requestData.startDate,
        dueDate: requestData.dueDate,
        updatedAt: getCurrentTimeStamp(),
      }
    };

    const result = await dbClient.collection(constants.projectCollection).updateOne({ _id: new ObjectId(projectId) }, data);

    if (result.modifiedCount > 0) {
      successMessage.message = 'Project updated successfully';
      successMessage.status = status.success;

      res.status(status.success).send(successMessage);
    } else {
      return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
    }
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to list all projects
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllProjects = async (req, res) => {
  const successMessage = { status: 'success' };

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const response = await dbClient.collection(constants.projectCollection).find({}).toArray();

    successMessage.message = 'All projects';
    successMessage.data = response;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);

  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to delete a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const deleteProject = async (req, res) => {
  const successMessage = { status: 'success' };

  const { id: projectId } = req.params;

  //Check if the project id is passed
  if (!projectId) {
    return jsonErrorResponse(res, 'A project id must be provided', status.bad);
  }

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const projectId = req.params.id;

    // Check if ID exists
    const checkIfProjectExist = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!checkIfProjectExist) {
      return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
    }

    // Delete the data in the collection
    const deleteTask = await dbClient.collection(constants.projectCollection).deleteOne({ _id: new ObjectId(projectId) });

    if (deleteTask.deletedCount === 0) {
      return jsonErrorResponse(res, 'No projects were deleted', status.error);
    }

    successMessage.message = 'Project deleted successfully';
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);

  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to assign a task to a project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const assignTaskToProject = async (req, res) => {
  const { taskId, projectId } = req.body;

  if (!taskId) {
    return jsonErrorResponse(res, 'A task id must be provided', status.bad);
  }

  if (!projectId) {
    return jsonErrorResponse(res, 'A project id must be provided', status.bad);
  }

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const taskData = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });
    const projectData = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(projectId) });

    if (!taskData) {
      return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
    }

    if (!projectData) {
      return jsonErrorResponse(res, `Project with id ${projectId} does not exist`, status.notfound);
    }

    if (taskData.project !== undefined && taskData.project.projectId === projectId) {
      return jsonErrorResponse(res, 'Task is already in the destination project', status.bad);
    }

    const newDataForTaskCollection = {
      $set: {
        project: {
          projectId,
          projectName: projectData.name,
        },
        updatedAt: getCurrentTimeStamp(),
      },
    };

    const newDataForProjectCollection = {
      $push: {
        tasks: {
          taskId,
          taskName: taskData.name,
        },
      },
    };

    const { modifiedCount: taskModifiedCount } = await dbClient
      .collection(constants.taskCollection)
      .updateOne({ _id: new ObjectId(taskId) }, newDataForTaskCollection);

    const { modifiedCount: projectModifiedCount } = await dbClient
      .collection(constants.projectCollection)
      .updateOne({ _id: new ObjectId(projectId) }, newDataForProjectCollection);

    if (taskModifiedCount === 0 || projectModifiedCount === 0) {
      return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
    }

    const successMessage = {
      message: `Task (${taskId}) has successfully been assigned to project with id: ${projectId}`,
      status: status.success,
    };

    res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while updating project', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to move a task from one project to another project
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const moveTaskBetweenProjects = async (req, res) => {
  const successMessage = { status: 'success' };
  const { taskId, sourceProjectId, destinationProjectId } = req.body;

  if (!taskId) {
    return jsonErrorResponse(res, 'A task id must be provided', status.bad);
  }

  if (!sourceProjectId) {
    return jsonErrorResponse(res, 'A source project id must be provided', status.bad);
  }

  if (!destinationProjectId) {
    return jsonErrorResponse(res, 'A destination project id must be provided', status.bad);
  }

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const task = await dbClient.collection(constants.taskCollection).findOne({ _id: new ObjectId(taskId) });

    if (!task) {
      return jsonErrorResponse(res, `Task with id ${taskId} does not exist`, status.notfound);
    }

    const sourceProject = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(sourceProjectId) });

    if (!sourceProject) {
      return jsonErrorResponse(res, `Source project with id ${sourceProjectId} does not exist`, status.notfound);
    }

    const destinationProject = await dbClient.collection(constants.projectCollection).findOne({ _id: new ObjectId(destinationProjectId) });

    if (!destinationProject) {
      return jsonErrorResponse(res, `Destination project with id ${destinationProjectId} does not exist`, status.notfound);
    }

    if (task.project && task.project.projectId !== sourceProjectId) {
      return jsonErrorResponse(res, 'Task is not in the source project', status.bad);
    }

    if (task.project && task.project.projectId === destinationProjectId) {
      return jsonErrorResponse(res, 'Task is already in the destination project', status.bad);
    }

    const newDataForDestinationProjectCollection = {
      $push: {
        tasks: {
          taskId,
          taskName: task.name
        }
      }
    };

    await dbClient.collection(constants.projectCollection).updateOne({ _id: new ObjectId(destinationProjectId) }, newDataForDestinationProjectCollection);

    await dbClient.collection(constants.projectCollection).updateOne(
      { _id: new ObjectId(sourceProjectId) },
      { $pull: { tasks: taskId } }
    );

    const newDataForTaskCollection = {
      $set: {
        project: {
          projectId: destinationProjectId,
          projectName: destinationProject.name
        },
        updatedAt: getCurrentTimeStamp()
      }
    };

    await dbClient.collection(constants.taskCollection).updateOne({ _id: new ObjectId(taskId) }, newDataForTaskCollection);

    successMessage.message = `Task (${taskId}) has successfully been moved to project with id: ${destinationProjectId}`;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }

}

/**
  * Method to filter tasks by project name
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const filterTasksByProjectName = async (req, res) => {
  const successMessage = { status: 'success' };
  const { projectName } = req.query;

  if (!projectName) {
    return jsonErrorResponse(res, 'A project name must be provided', status.bad);
  }

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const filteredTasks = await dbClient.collection(constants.taskCollection)
      .find({ "project.projectName": projectName.trim() })
      .toArray();

    if (filteredTasks.length === 0) {
      return jsonErrorResponse(res, 'No tasks found for the specified project name', status.notfound);
    }

    successMessage.message = 'Tasks successfully filtered.';
    successMessage.data = filteredTasks;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while assigning task', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
  }
}

/**
  * Method to sort projects by dates (startDate & dueDate)
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const sortProjectsByDates = async (req, res) => {
  const successMessage = { status: 'success' };
  const queryParams = req.query;

  if (!queryParams.sortParameter) {
    return jsonErrorResponse(res, 'A sort parameter must be provided.', status.bad);
  }

  const sortParameter = queryParams.sortParameter.trim();

  try {
    // Initialize mongo db connection
    await initMongoDBConnection();

    const sortCriteria = {};

    if (sortParameter === 'startDate') {
      sortCriteria.startDate = 1; // sort by ascending start date
    } else if (sortParameter === 'dueDate') {
      sortCriteria.dueDate = -1; // sort by descending due date
    } else {
      return jsonErrorResponse(res, `Invalid sort parameter. Can only be 'startDate' or 'dueDate'.`, status.bad);
    }

    const sortResponse = await dbClient.collection(constants.projectCollection).find().sort(sortCriteria).toArray();

    successMessage.message = 'Projects sorted successfully.';
    successMessage.data = sortResponse;
    successMessage.sortParameter = sortParameter;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    return jsonErrorResponse(res, 'An error occurred while sorting projects.', status.error);
  } finally {
    // Close mongodb connection
    await endMongoConnection();
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