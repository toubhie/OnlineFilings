import express from 'express';
import 'babel-polyfill';
import cors from 'cors';
import env from './env';
import projectRoute from './routes/projectRoute';
import taskRoute from './routes/taskRoute';
import aggregationRoute from './routes/aggregationRoute';
import path from 'path';
import { getCurrentTimeStamp } from './utils/helperFunctions';
import { initMongoDBConnection } from './db/dbConnection';
import { status } from './utils/status';
import { jsonErrorResponse } from './utils/responseHelper';

const app = async () => {

  const app = express();

  app.get('/api/v1/health', function (req, res) {
    const data = {
      message: 'To-Do list service is up!',
      uptime: `Service has been running for ${process.uptime().toFixed(2)} seconds`,
      date: getCurrentTimeStamp()
    }

    res.status(200).send(data);
  });

  // Add middleware for parsing URL encoded bodies (which are usually sent by browser)
  app.use(cors());
  // Add middleware for parsing JSON and urlencoded data and populating `req.body`
  var bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: "5000mb" }));
  app.use(bodyParser.urlencoded({ limit: "5000mb", extended: true, parameterLimit: 50000 }));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/api/v1/projects', projectRoute);
  app.use('/api/v1/tasks', taskRoute);
  app.use('/api/v1/aggregation', aggregationRoute);

  app.use("*", (req, res) => {
    return jsonErrorResponse(res, `Invalid Request`, status.bad);
  })

  initMongoDBConnection();

  app.listen(env.port).on('listening', () => {
    console.log(`🚀 Live on ${env.port}`);
  });
};

app();


// export default app;