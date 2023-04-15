const constants = {
    projectCollection: 'projects',
    taskCollection: 'tasks',

    apiVersion: '/api/v1',
    mongoDBUri: 'mongodb://localhost:27017',

    statusStarted: 'started',
    statusInProgress: 'in-progress',
    statusCompleted: 'completed',
    statusCancelled: 'cancelled',
    statusPending: 'pending',

    taskStatusToDo: 'todo',
    taskStatusDone: 'done',
    taskStatusInProgress: 'in-progress',
    taskStatusClosed: 'closed'
}

export default constants;

