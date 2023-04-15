import { status } from '../utils/status';
import { getCurrentTimeStamp } from '../utils/helperFunctions';
import constants from '../utils/constants';
import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import { printJSONErrorResponse } from '../utils/responseHelper';
import { createProject, updateProject, getAllProjects, deleteProject, assignTaskToProject, filterTasksByProjectName, sortProjectsByDates } from './projectsController';

jest.mock('../utils/status');
jest.mock('../utils/helperFunctions');
jest.mock('../utils/constants');
jest.mock('../db/dbConnection');
jest.mock('mongodb');
jest.mock('moment');
jest.mock('../utils/responseHelper');

describe('createProject', () => {
  it('should expose a function', () => {
		expect(createProject).toBeDefined();
	});
  
  it('createProject should return expected output', async () => {
    // const retValue = await createProject(req,res);
    expect(false).toBeTruthy();
  });
});

describe('updateProject', () => {
  it('should expose a function', () => {
		expect(updateProject).toBeDefined();
	});
  
  it('updateProject should return expected output', async () => {
    // const retValue = await updateProject(req,res);
    expect(false).toBeTruthy();
  });
});

describe('getAllProjects', () => {
  it('should expose a function', () => {
		expect(getAllProjects).toBeDefined();
	});
  
  it('getAllProjects should return expected output', async () => {
    // const retValue = await getAllProjects(req,res);
    expect(false).toBeTruthy();
  });
});

describe('deleteProject', () => {
  it('should expose a function', () => {
		expect(deleteProject).toBeDefined();
	});
  
  it('deleteProject should return expected output', async () => {
    // const retValue = await deleteProject(req,res);
    expect(false).toBeTruthy();
  });
});

describe('assignTaskToProject', () => {
  it('should expose a function', () => {
		expect(assignTaskToProject).toBeDefined();
	});
  
  it('assignTaskToProject should return expected output', async () => {
    // const retValue = await assignTaskToProject(req,res);
    expect(false).toBeTruthy();
  });
});

describe('filterTasksByProjectName', () => {
  it('should expose a function', () => {
		expect(filterTasksByProjectName).toBeDefined();
	});
  
  it('filterTasksByProjectName should return expected output', async () => {
    // const retValue = await filterTasksByProjectName(req,res);
    expect(false).toBeTruthy();
  });
});

describe('sortProjectsByDates', () => {
  it('should expose a function', () => {
		expect(sortProjectsByDates).toBeDefined();
	});
  
  it('sortProjectsByDates should return expected output', async () => {
    // const retValue = await sortProjectsByDates(req,res);
    expect(false).toBeTruthy();
  });
});