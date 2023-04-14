import { MongoClient } from "mongodb";
import env from './../env';
import constants from "../utils/constants";

const client = new MongoClient(constants.mongoDBUri); // Mongo Client, used later for connection purpose.

/*
  init method is used to connect the client with database. 
*/
const initMongoDBConnection = async () => {
  try {
    //connect to the local mongoDB 
    await client.connect(err => {
      if (err) console.log(err);
      console.log(`Connected To Database ${env.database}`);
    });
  } catch (error) {
    console.log(error);
  }
};

/*
  closeConnection method is used to end connection with the database. 
*/
const endMongoConnection = async () => {
  try {
    await client.close(err => {
      if (err) console.log(err);
      console.log('Connection closed');
    });
  } catch (error) {
    console.log(error);
  }
};

/*
  Get Client Method is used to get the database client.
*/
const getClient = () => {
  return client.db(env.database); // selecting the db
};

export { 
  initMongoDBConnection, 
  endMongoConnection,
  getClient 
};
