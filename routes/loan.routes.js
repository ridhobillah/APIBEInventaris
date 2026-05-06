const express = require('express')
const router = express.Router()

const upload = require('../middlewares/upload')
const loanController = require('../controllers/loan.controller')
const returnController = require('../controllers/return.controller')


//karena post dan put/patch sudah terikat dengan middleware upload. jadi meskipun tidak ada gambar upload di post, tetap ditambahkan tapi kosong : none()
router.post('/', upload.none(), loanController.createLoan)
router.get('/', loanController.getLoans)
// loan/:id/return : dari detail peminjaman terkait, lakukan return
router.post('/:id/return', upload.none(), returnController.createReturn);
module.exports = router