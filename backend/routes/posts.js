const express = require('express');
const multer = require('multer');

const Post = require('../models/post');
const authTokenMiddleware = require('../middlewares/auth-token.middleware');

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg'
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const origName = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    const fileName = origName + '-' + Date.now() + '.' + ext;
    cb(null, fileName);
  }
});

router.post('',
  authTokenMiddleware,
  multer({ storage: storage }).single('image'),
  (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + '/images/' + req.file.filename,
      creator: req.userInfo.id
    });
    post.save()
      .then((result) => {
        console.log('Post created successfully:');
        console.log(result);
        res.status(201).json({
          message: 'Post created successfully!'
        });
      })
      .catch((error) => {
        console.log('Post create failed:');
        console.log(error);
        res.json({
          message: 'Post create failed!'
        });
      });
  }
);

router.get('',
  (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    const query = Post.find();
    let posts;

    if (pageSize && currentPage) {
      query.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    query.then((results) => {
      posts = results;
      return Post.count();
    })
      .then((count) => {
        res.status(200).json({
          message: 'Posts fetched successfully!',
          posts: posts,
          totalPosts: count
        });
      })
      .catch((error) => {
        console.log('Posts fetching failed:');
        console.log(error);
        res.json({
          message: 'Posts fetching failed!'
        });
      });
  }
);

router.get('/:id',
  (req, res, next) => {
    Post.findOne({ _id: req.params.id })
      .then((result) => {
        console.log('Post fetched successfully:');
        console.log(result);
        res.status(200).json({
          message: 'Post fetched successfully!',
          post: result
        });
      })
      .catch((error) => {
        console.log('Post not found:');
        console.log(error);
        res.status(404).json({
          message: 'Post not found!'
        });
      });
  }
);

router.put('/:id',
  authTokenMiddleware,
  multer({ storage: storage }).single('image'),
  (req, res, next) => {
    if (req.file) {
      const url = req.protocol + '://' + req.get('host');
      req.body.imagePath = url + '/images/' + req.file.filename;
    }
    req.body.creator = req.userInfo.id;

    Post.updateOne(
      { _id: req.params.id, creator: req.userInfo.id },
      req.body
    )
      .then((result) => {
        const message = result.modifiedCount > 0 ? 'Post updated successfully!' : 'Authorization denied';
        const statusCode = result.modifiedCount > 0 ? 200 : 401;
        res.status(statusCode).json({
          message: message
        });
      })
      .catch((error) => {
        console.log('Post update failed:');
        console.log(error);
        res.json({
          message: 'Post update failed!'
        });
      });
  }
);

router.delete('/:id',
  authTokenMiddleware,
  (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator: req.userInfo.id })
      .then((result) => {
        const message = result.deletedCount > 0 ? 'Post deleted successfully!' : 'Authorization denied';
        const statusCode = result.deletedCount > 0 ? 200 : 401;
        res.status(statusCode).json({
          message: message
        });
      })
      .catch((error) => {
        console.log('Post deletion failed:');
        console.log(error);
        res.json({
          message: 'Post deletion failed!'
        });
      });
  }
);

module.exports = router;
