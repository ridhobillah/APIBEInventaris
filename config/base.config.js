require("dotenv").config()

module.exports = {
    //di simpan disini biar nanti di panggil dicontroller atau lainnya pake file ini
    web_name: process.env.WEB_NAME,
    base_url: process.env.BASE_URL,
    auth_secret: process.env.AUTH_SECRET   
}