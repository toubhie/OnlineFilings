import { errorMessage } from './status';

const jsonErrorResponse = (res, message, status) => {
    errorMessage.message = message;
    errorMessage.status = status;

    return res.status(status).send(errorMessage);
};

export {
    jsonErrorResponse
};