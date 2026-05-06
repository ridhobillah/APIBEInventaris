const jwt = require('jsonwebtoken')
const { response } = require('../helpers/response.formatter')
const { auth_secret } = require('../config/base.config')

module.exports = {
    checkToken: async (req, res, next) => {
        const token = req.header("Authorization");
        if(!token) {
            return res.status(401).json(response(401, "unauthorized", "Please login anf try again!"));
        }

        try {
            const check = jwt.verify(token, auth_secret);
            //karena nanti pengguna perlu data identitas pengguna panggil payload yg dikirim jwt.sign() di logincontroller dan di simpan di req. data payload tersimpan di const check hasil verify ada userId name email
            req.user = check;
            next(); //lanjutkan proses routing yg dimintai
        } catch (error) {
            //jika terjadi error ini hubungannya dengan token jadi kasi 401 (suruh login lagi)
            return res.status(401).json(response(401, "unauthorized", "please login and try again!"))
        }
    }
}


