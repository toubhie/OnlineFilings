import { MongoClient } from "mongodb";
import env from './../env';
import constants from "../utils/constants";

const client = new MongoClient(constants.mongoDBUri); // Mongo Client


// init method is to connect with mongo database. 
const initMongoDBConnection = async () => {
  try {
    //connect to the local mongoDB 
    await client.connect();
    console.log(`Connected To Database ${env.database}`);
  } catch (error) {
    console.log(error);
    throw new Error("Cannot connect to Mongo DB");
  }
};

// closeConnection method is used to end connection with the database. 
const endMongoConnection = async () => {
  try {
    await client.close();
    console.log('DB connection closed');
  } catch (error) {
    console.log(error);
    throw new Error("Mongo DB connection failed to close");
  }
};

// getClient Method is used to get the database client.
const getClient = () => {
  try {
    return client.db(env.database); // selecting the db
  } catch (error) {
    console.log(error);
  }

};

export {
  initMongoDBConnection,
  endMongoConnection,
  getClient
};
