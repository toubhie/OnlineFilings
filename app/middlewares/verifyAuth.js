//app/middleware/verifyAuth.js
 
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  errorMessage, status,
} from '../helpers/status';

import env from '../env';

import { getPropertyValue } from '../controllers/staticDataController';

import constants from '../helpers/constants';

import axios from 'axios';

dotenv.config();

/**
   * Verify Token
   * @param {object} req 
   * @param {object} res 
   * @param {object} next
   * @returns {object|void} response object 
   */

const verifyToken = async (req, res, next) => {
  //console.log(req.headers);
  const { authorization, userid } = req.headers;
  //console.log(authorization);
  if (!authorization) {
    errorMessage.message = 'Token not provided';
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded = jwt.verify(authorization, env.secret);
    req.user = {
      user_id: decoded.user_id,
      email_address: decoded.email_address,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      organization: decoded.organization,
      token: authorization
    };

    if(userid == decoded.user_id) {
      next();
    } else {
      errorMessage.message = 'Authentication Failed';
      return res.status(status.unauthorized).send(errorMessage);
    }
  } catch (error) {
    console.log(error);
    errorMessage.message = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};

/**
   * Verify Bitt Token
   * @param {object} req 
   * @param {object} res 
   * @param {object} next
   * @returns {object|void} response object 
   */

const verifyBittToken = async (req, res) => {
  let successMessage = { status: status.success };
  let errorMessage = { status: status.error };
  console.log(req.headers);
  const { token } = req.params;
  if (!token) {
    errorMessage.message = 'Token not provided';
    errorMessage.status = status.bad;
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded =  jwt.decode(token);
    let user = {
      expiry: decoded.expiry,
      iss: decoded.iss,
      token_type: decoded.token_type,
      userid: decoded.userid
    };
    successMessage.data = user;
    successMessage.token = token;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.message = 'Authentication Failed. '+String(error);
    errorMessage.status = status.unauthorized;
    return res.status(status.unauthorized).send(errorMessage);
  }
};

const verifyTokensForEnairaWithdrawal = async (req, res, next) => {
  const { customertoken, fitoken, fiuserid } = req.headers;

  if (!customertoken && !fitoken) {
    errorMessage.message = 'Customer or FI token not provided';
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded = jwt.decode(fitoken);
    req.fiUser = {
      expiry: decoded.expiry,
      iss: decoded.iss,
      token_type: decoded.token_type,
      userid: decoded.userid,
      fitoken
    };

    req.customerToken = customertoken;
    
    if(fiuserid == decoded.userid) {
      next();
    } else {
      errorMessage.message = 'FI Authentication Failed';
      return res.status(status.unauthorized).send(errorMessage);
    }
  } catch (error) {
    console.log(error);
    errorMessage.message = 'FI Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};

const verifyBittTokenNew = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    errorMessage.message = 'Token not provided';
    return res.status(status.bad).send(errorMessage);
  }

  try{
    axios({
      url: `${(await constants()).bitt_decode_jwt_url}/${authorization}`,
      method: 'get',
    })
      .then(async (response) => {
        if(response.data != null && typeof response.data !== 'undefined') {
          req.user = {
            token: authorization
          };

          next();
        } else {
          errorMessage.message = 'Authentication Failed';
          return res.status(status.unauthorized).send(errorMessage);
        }
      })
      .catch(function (error) {
        console.log(error);

        errorMessage.message = "An error occured decoding token";
        errorMessage.code = 'ENSVC-9044';
        errorMessage.status = status.error;

        res.status(status.unauthorized).send(errorMessage);
      })
  } catch(error){
    console.log(error);
    errorMessage.message = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};

const verifyTokensForWebTransfers = async (req, res, next) => {
  const { authorization, userid, authorization_bitttoken } = req.headers;

  if (!authorization && !authorization_bitttoken) {
    errorMessage.message = 'Authorization or Bitt Authorization tokens not provided';
    return res.status(status.bad).send(errorMessage);
  }
  try {
    const decoded = jwt.verify(authorization, env.secret);
    req.user = {
      user_id: decoded.user_id,
      email_address: decoded.email_address,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      organization: decoded.organization,
      token: authorization
    };

    if(userid == decoded.user_id) {

      //Verify Bitt token
      axios({
        url: `${(await constants()).bitt_decode_jwt_url}/${authorization_bitttoken}`,
        method: (await constants()).get,
        headers: {
          userId: userid,
          Authorization: authorization
        }
      })
      .then(async (response) => {
        if(response.data != null && typeof response.data !== 'undefined') {
          req.user = {
            token: authorization_bitttoken
          };
  
          next();
        } else {
          errorMessage.message = 'Authentication Failed';
          return res.status(status.unauthorized).send(errorMessage);
        }
      })
      .catch(function (error) {
        console.log(error);
  
        errorMessage.message = "An error occured decoding authorization_bitttoken or Invalid Token";
        errorMessage.code = 'ENSVC-9044';
        errorMessage.status = status.error;

        res.status(status.unauthorized).send(errorMessage);
      })

    } else {
      errorMessage.message = 'Authentication Failed';
      return res.status(status.unauthorized).send(errorMessage);
    }
  } catch (error) {
    console.log(error);
    errorMessage.message = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};

export {
  verifyToken,
  verifyBittToken,
  verifyTokensForEnairaWithdrawal,
  verifyBittTokenNew,
  verifyTokensForWebTransfers
};