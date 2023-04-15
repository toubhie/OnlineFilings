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

    const start = getTodayStartTimeStamp();
    const end = getTodayEndTimeStamp();

    try {
        initMongoDBConnection();

        // select * from projects inner join tasks on t.projectId = p.id

        const response = await dbClient.collection(constants.taskCollection).aggregate([
            {
              $lookup: {
                from: "tasks",
                localField: "projectId",
                foreignField: "_id",
                as: "tasks"
              }
            },
            {
              $match: {
                "tasks.dueDate": { $gte: start, $lt: end }
              }
            }
          ]);

          console.log('response');
          console.log(response);

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
  * Method to list all the tasks that have a project with a due date set to “today”
  * @param {object} req
  * @param {object} res
  * @returns {object} JSON object
  */
const getAllTasks = async (req, res) => {
    let successMessage = { status: 'success' };

    const start = getTodayStartTimeStamp();
    const end = getTodayEndTimeStamp();

    try {
        initMongoDBConnection();

        // select * from projects inner join tasks on t.projectId = p.id

        const response = await dbClient.collection(constants.taskCollection).aggregate([
            {
              $lookup: {
                from: "tasks",
                localField: "projectId",
                foreignField: "_id",
                as: "tasks"
              }
            },
            {
              $match: {
                "tasks.dueDate": { $gte: start, $lt: end }
              }
            }
          ]);

          console.log('response');
          console.log(response);

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

export {
    getAllProjects,
    getAllTasks
}; 