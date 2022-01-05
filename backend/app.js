const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const usersRoutes = require('./routes/users');

const app = express();
const atlasDB = 'mongodb+srv://admin:ps4hCO76VXccdgTE@cluster0.w6qo5.mongodb.net/message-board?retryWrites=true&w=majority'
const localDB = 'mongodb://localhost:27017/message-board-mean'

mongoose.connect(localDB)
  .then(() => {
    console.log('Database Connection Successful!');
  })
  .catch(() => {
    console.log('Database Connection Failed!');
  });

app.use(bodyParser.json());

app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  next();
});

app.use('/api/posts', postsRoutes);

app.use('/api/users', usersRoutes);

module.exports = app;
