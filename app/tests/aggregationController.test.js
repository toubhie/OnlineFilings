import { status } from '../utils/status';
import { 
    getTodayStartTimeStamp,
    getTodayEndTimeStamp 
} from '../utils/helperFunctions';
import constants from '../utils/constants';
import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { getAllProjects, getAllTasks } from './aggregationController';

jest.mock('../utils/status');
jest.mock('../utils/helperFunctions');
jest.mock('../utils/constants');
jest.mock('../db/dbConnection');

describe('getAllProjects', () => {
  it('should expose a function', () => {
		expect(getAllProjects).toBeDefined();
	});
  
  it('getAllProjects should return expected output', async () => {
    // const retValue = await getAllProjects(req,res);
    expect(false).toBeTruthy();
  });
});

describe('getAllTasks', () => {
  it('should expose a function', () => {
		expect(getAllTasks).toBeDefined();
	});
  
  it('getAllTasks should return expected output', async () => {
    // const retValue = await getAllTasks(req,res);
    expect(false).toBeTruthy();
  });
});