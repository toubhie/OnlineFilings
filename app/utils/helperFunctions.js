import moment from 'moment';

/**
   * isEmpty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
const isEmpty = (input) => {
  if (input === undefined || input === '') {
    return true;
  }
  if (input.replace(/\s/g, '').length) {
    return false;
  } return true;
};

/**
   * empty helper method
   * @param {string, integer} input
   * @returns {Boolean} True or False
   */
const empty = (input) => {
  if (input === undefined || input === '') {
    return true;
  }
};

/**
   * get current timestamp helper method
   * @returns {String} returns current timestamp
   */
const getCurrentTimeStamp = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
   * check if null or undefined method
   * @param {string} input
   * @returns {string} input or empty string if empty or undefined
   */
const checkIfNullOrUndefined = (input) => {
  if (input === undefined || input === null) {
    input = '';
  }
  
  return input;
};

/**
   * Get start of today's timestamp helper method
   * @returns {String} returns current timestamp
   */
const getTodayStartTimeStamp = () => {
  return moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
};

/**
   * Get end of today's timestamp helper method
   * @returns {String} returns current timestamp
   */
const getTodayEndTimeStamp = () => {
  return moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
};

export {
  isEmpty,
  empty,
  getCurrentTimeStamp,
  checkIfNullOrUndefined,
  getTodayStartTimeStamp,
  getTodayEndTimeStamp
};