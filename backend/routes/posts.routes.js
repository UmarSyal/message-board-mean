const express = require('express');

const postsController = require('../controllers/posts.controller');
const authTokenMiddleware = require('../middlewares/auth-token.middleware');
const fileUploadMiddleware = require('../middlewares/file-upload.middleware');

const router = express.Router();

router.post('', authTokenMiddleware, fileUploadMiddleware, postsController.createPost);

router.get('', postsController.getPosts);

router.get('/:id', postsController.getPost);

router.put('/:id', authTokenMiddleware, fileUploadMiddleware, postsController.updatePost);

router.delete('/:id', authTokenMiddleware, postsController.deletePost);

module.exports = router;
