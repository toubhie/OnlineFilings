import { status } from '../utils/status';
import { getCurrentTimeStamp } from '../utils/helperFunctions';
import constants from '../utils/constants';
import { getClient, endMongoConnection, initMongoDBConnection } from '../db/dbConnection';
import { ObjectId } from 'mongodb';
import moment from 'moment';
import { jsonErrorResponse } from '../utils/responseHelper';
import { createTask, updateTask, getAllTasks, deleteTask, changeStatusOfTask, searchTasksByName, filterTasksByStatus, sortTasks } from './tasksController';

jest.mock('../utils/status');
jest.mock('../utils/helperFunctions');
jest.mock('../utils/constants');
jest.mock('../db/dbConnection');
jest.mock('mongodb');
jest.mock('moment');
jest.mock('../utils/responseHelper');

describe('createTask', () => {
  it('should expose a function', () => {
    expect(createTask).toBeDefined();
  });

  it('createTask should return expected output', async () => {
    // const retValue = await createTask(req,res);
    expect(false).toBeTruthy();
  });

  test('should create a task successfully', async () => {
    const mockReq = {
      body: {
        name: 'Test task',
        description: 'This is a test task',
        startDate: '2023-04-15',
        dueDate: '2023-04-30',
        priority: 'High',
        assignedTo: 'John Doe',
        projectId: '1234'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await createTask(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'success',
      message: 'Task created successfully',
      taskId: expect.any(String)
    });
  });

  test('should return bad request if task name is not provided', async () => {
    const mockReq = {
      body: {
        description: 'This is a test task',
        startDate: '2023-04-15',
        dueDate: '2023-04-30',
        priority: 'High',
        assignedTo: 'John Doe',
        projectId: '1234'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await createTask(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'bad',
      message: 'A task name must be provided'
    });
  });

  test('should return bad request if start date is not provided', async () => {
    const mockReq = {
      body: {
        name: 'Test task',
        description: 'This is a test task',
        dueDate: '2023-04-30',
        priority: 'High',
        assignedTo: 'John Doe',
        projectId: '1234'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await createTask(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'bad',
      message: 'A start date must be provided'
    });
  });

  test('should return bad request if due date is not provided', async () => {
    const mockReq = {
      body: {
        name: 'Test task',
        description: 'This is a test task',
        startDate: '2023-04-15',
        priority: 'High',
        assignedTo: 'John Doe',
        projectId: '1234'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await createTask(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'bad',
      message: 'A due date must be provided'
    });
  });

  test('should return bad request if due date is before start date', async () => {
    const mockReq = {
      body: {
        name: 'Test task',
        description: 'This is a test task',
        startDate: '2023-04-30',
        dueDate: '2023-04-15',
        priority: 'High',
        assignedTo: 'John Doe',
        projectId: '1234'
      }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    await createTask(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith({
      status: 'bad',
      message: 'The due date must be greater than the start date'
    });
  });
});

describe('updateTask', () => {
  it('should expose a function', () => {
    expect(updateTask).toBeDefined();
  });

  it('updateTask should return expected output', async () => {
    // const retValue = await updateTask(req,res);
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

describe('deleteTask', () => {
  it('should expose a function', () => {
    expect(deleteTask).toBeDefined();
  });

  it('deleteTask should return expected output', async () => {
    // const retValue = await deleteTask(req,res);
    expect(false).toBeTruthy();
  });
});

describe('changeStatusOfTask', () => {
  it('should expose a function', () => {
    expect(changeStatusOfTask).toBeDefined();
  });

  it('changeStatusOfTask should return expected output', async () => {
    // const retValue = await changeStatusOfTask(req,res);
    expect(false).toBeTruthy();
  });
});

describe('searchTasksByName', () => {
  it('should expose a function', () => {
    expect(searchTasksByName).toBeDefined();
  });

  it('searchTasksByName should return expected output', async () => {
    // const retValue = await searchTasksByName(req,res);
    expect(false).toBeTruthy();
  });
});

describe('filterTasksByStatus', () => {
  it('should expose a function', () => {
    expect(filterTasksByStatus).toBeDefined();
  });

  it('filterTasksByStatus should return expected output', async () => {
    // const retValue = await filterTasksByStatus(req,res);
    expect(false).toBeTruthy();
  });
});

describe('sortTasks', () => {
  it('should expose a function', () => {
    expect(sortTasks).toBeDefined();
  });

  it('sortTasks should return expected output', async () => {
    // const retValue = await sortTasks(req,res);
    expect(false).toBeTruthy();
  });
});