import {
    errorMessage,
    status,
} from '../utils/status';

import { 
    getTodayStartTimeStamp,
    getTodayEndTimeStamp 
} from '../utils/helperFunctions';

import constants from '../utils/constants';

import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';

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

        const response = await dbClient.collection(constants.projectCollection).aggregate([
            {
              $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "projectId",
                as: "tasks"
              }
            },
            {
              $unwind: "$tasks"
            },
            {
              $match: {
                "tasks.dueDate": {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  $lte: new Date(new Date().setHours(23, 59, 59, 999))
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
    getAllProjects
}; 