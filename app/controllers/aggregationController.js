import { status } from '../utils/status';

import {
  getTodayStartTimeStamp,
  getTodayEndTimeStamp
} from '../utils/helperFunctions';

import constants from '../utils/constants';

import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';

const dbClient = getClient();

/**
  * Method to list all the projects that have a task with a due date set to “today”
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllProjects = async (req, res) => {
  let successMessage = { status: 'success' };

  const startTime = getTodayStartTimeStamp();
  const endTime = getTodayEndTimeStamp();

  try {
    await initMongoDBConnection();

    const response = dbClient.collection(constants.projectCollection).aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project.projectId",
          as: "projects"
        }
      },
      {
        $unwind: "$projects"
      },
      {
        $match: {
          "projects.dueDate": {
            $gte: startTime,
            $lte: endTime
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" }
        }
      }
    ]).toArray();;

    successMessage.message = 'All projects';
    successMessage.data = response;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);

  } catch (error) {
    console.log(error);
  }
}

/**
  * Method to list all the tasks that have a project with a due date set to “today”
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllTasks = async (req, res) => {
  let successMessage = { status: 'success' };

  const startTime = getTodayStartTimeStamp();
  const endTime = getTodayEndTimeStamp();

  try {
    await initMongoDBConnection();

    const response = dbClient.collection(constants.taskCollection).aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project.projectId",
          foreignField: "_id",
          as: "tasks"
        }
      },
      {
        $unwind: "$tasks"
      },
      {
        $match: {
          "tasks.dueDate": {
            $gte: startTime,
            $lte: endTime
          }
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          startDate: { $first: "$startDate" },
          dueDate: { $first: "$dueDate" }
        }
      }
    ]).toArray();

    successMessage.message = 'All tasks';
    successMessage.data = response;
    successMessage.status = status.success;

    res.status(status.success).send(successMessage);

  } catch (error) {
    console.log(error);
  }
}

export {
  getAllProjects,
  getAllTasks
}; 