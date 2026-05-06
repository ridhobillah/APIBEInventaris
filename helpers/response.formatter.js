module.exports = {
    // key object yang akan di panggil pas exports di file lain
    response: (status, message, data) => {
        if (data) {
            return {
                status: status,
                message: message,
                data: data,
            }
        } else {
            // kalau response gaada data misal nya error hasil di postmannya jangan kirim key data dijsonnya
            return {
                status: status,
                message: message,
            }
        }
    }
}