import axios from 'axios';
import constants from '../helpers/constants';

export async function makeGetRequest(url, config){
    try {
        const response = await axios.get(url);
        //console.log(response.data);

        return response;
    } catch (err) {
        console.error(err);

        return err;
    }
}

export async function makePostRequest(url, data, config){
    return axios.post(url, data, config)
      .then(function (response) {
        //console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
}

export async function makePutRequest(url, data, config){
    return axios.put(url, data, config)
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
}

export async function makeDeleteRequest(url, data, config){
    return axios.delete(url, data, config)
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return error;
      });
}

export function getHeaderConfig() {
  let config = {
    headers: {
      //Authorization: localStorage.getItem((await constants()).tag_token),
    }
  }

  return config;
}

