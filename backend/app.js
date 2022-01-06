const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

mongoose.connect(process.env.MONGO_LOCAL_DB)
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
