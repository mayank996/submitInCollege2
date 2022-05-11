const express = require('express')
const router = express.Router()
const rooms = require('../controllers/rooms')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAuthorR, validateRoom } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage: storage })

router.route('/')
    .get(catchAsync(rooms.index))
    .post(isLoggedIn, upload.array('image'), validateRoom, catchAsync(rooms.createRoom))

router.get('/new', isLoggedIn, rooms.renderNewForm)

router.route('/:id')
    .get(catchAsync(rooms.showRoom))
    .put(isLoggedIn, isAuthorR, upload.array('image'), validateRoom, catchAsync(rooms.updateRoom))
    .delete(isLoggedIn, isAuthorR, catchAsync(rooms.deleteRoom))


router.get('/:id/edit', isLoggedIn, isAuthorR, catchAsync(rooms.renderEditForm))

module.exports = router