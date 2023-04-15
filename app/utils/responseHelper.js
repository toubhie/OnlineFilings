import { errorMessage } from './status';

const printJSONErrorResponse = (res, message, status) => {
    errorMessage.message = message;
    errorMessage.status = status;

    return res.status(status).send(errorMessage);
};

export {
    printJSONErrorResponse
};