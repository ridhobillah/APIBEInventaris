const express = require('express')
const router = express.Router()

const upload = require('../middlewares/upload')
const itemController = require('../controllers/item.controller')

//routes.httpMethod('/path', middleware, controller)
//prefix route didefinisikan di app.js jadi kalau path '/' sama dengan '/Items/create'
//single('image') : ambil 1 file yg di upload di inputan image
router.post('/', upload.single('image'), itemController.createItem);
router.get('/', itemController.getItem);
router.get('/:id', itemController.showItem);
router.put('/:id', upload.single('image'), itemController.updateItem);
router.delete('/:id', itemController.deleteItem);


module.exports = router