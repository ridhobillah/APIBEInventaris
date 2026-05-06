const Validator = require("fastest-validator");
const v = new Validator();
const { Item, Return } = require("../models");
const { response } = require("../helpers/response.formatter");
const { Op } = require("sequelize");
const fs = require("fs"); //file system melakukan sesuai yang berhubungan dengan lokasi file mau, cari lokasi mau di hapus apa di apa
const path = require("path");

module.exports = {
  createItem: async (req, res) => {
    try {
      //ambil inputan (payload) : req.body
      const { name, stock } = req.body;
      // const { image } = req.file;

      //validasi
      const schema = {
        name: { type: "string", min: 3 },
        stock: { type: "number", positive: true, integer: true }, // kenapa pake integer: true karena nilai stock ga desimal
      };

      //menyiapkan data yag akan divalidasi
      const data = {
        name: name, //fieldDatabase : namaDarireq
        stock: Number(stock), // karena req.body json berupa string, jd stock diubah ke tipe data number pake Number
      };

      const validate = v.validate(data, schema);
      if (validate.length > 0) {
        //jika hasil validate ada error
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      //cek jika image tidak di upload (req.file : mangambil input file)
      if (!req.file) {
        return res
          .status(400)
          .json(response(400, "Validasi Error", "Image not found"));
      }

      //proses menyimpan data melalui ORM sequelize
      const item = await Item.create({
        //Item : disamain sama yang di model
        name: data.name, //ambil dari object data yang divalidasi sebelumnya
        stock: data.stock,
        image: req.file.filename, // ambil filename hasil dari middleware multer
      });
      return res.status(201).json(response(201, "created", item));
    } catch (error) {
      // penanganan error kodingan di try
      // res : parameter func untuk memberikan response (hasil)
      //response : method dar helpers formates untuk format hasil outputnya output dalam bentuk json
      return response.status(500).json(500, "Server Error", error.message);
    }
  },

  getItem: async (req, res) => {
    // req input, res output
    try {
      //req query : ambil params di postman/ambil data acuan untuk search/sort
      //shortBy : mengurutkan sesuai field apa
      //order : ASC/DESC, opsi pengurutan
      const { name, shortBy, order } = req.query;
      const items = await Item.findAll({
        where: name
          ? {
              name: {
                [Op.like]: `%${name}%`, //mencari yang mirip
              },
            }
          : {},
        // kalau diparams portman ada shortBy dan order, jalanin pengurutan, klo g ada pake default. misal shortBy 'stock' order 'DESC
        order: shortBy && order ? [[shortBy, order]] : [],
      }); //findAll = mengambil semua data

      //pagination Item
      const { page, limit } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows } = await Item.findAndCountAll({
        offset: Number(offset),
        limit: Number(limit),
      });
      const formatPagination = {
        data: rows,
        limit: limit,

        rows: Number(offset) + 1 + "-" + (Number(offset) + rows.length),
        total: count,
        page: page,
      };
      return res.status(200).json(response(200, "success", formatPagination));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }


  },

  showItem: async (req, res) => {
    try {
      //req.params : ambil path dinamis, /items/2. ambil angka 2 (id)
      const { id } = req.params;
      //findByPk : mencari berdasarkan primary key (id)
      const item = await Item.findByPk(id);
      // jika ada yang di cari tidak ada di database artinya angka id nya salah
      if (!item) {
        return res.status(400).json(response(400, "Data [id] not found"));
      }
      return res.status(200).json(response(200, "success", item));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  updateItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, stock } = req.body;

      const schema = {
        name: { type: "string", min: 3 },
        stock: { type: "number", positive: true, integer: true },
      };

      const data = {
        name: name,
        stock: Number(stock),
      };

      const validate = v.validate(data, schema);
      if (validate.length > 0) {
        //jika hasil validate ada error
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const item = await Item.findByPk(id);
      if (!item) {
        return res
          .status(400)
          .json(response(400, "valdate Error", "Data not found"));
      }

      // kalau ada file, file lama di hapus
      if (req.file) {
        const imageName = item.getDataValue("image");
        const filePath = path.join(__dirname, "../uploads", imageName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      //hasil dari update proses hanya true/false
      const updateProcess = await Item.update(
        {
          name: data.name,
          stock: data.stock,
          image: req.file ? req.file.filename : item.getDataValue("image"),
        },
        {
          where: { id: id },
        },
      );

      //ambil data baru yang uda diupdate
      const newItem = await Item.findByPk(id);
      return res.status(200).json(response(200, "success", newItem));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;

      //ambil data item untuk diambil gambar dan dihapus
      const item = await Item.findByPk(id);
      const imageName = item.getDataValue("image");
      const filePath = path.join(__dirname, "../uploads", imageName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const deleteProcess = await Item.destroy({
        where: { id: id },
      });
      return res.status(200).json(response(200, "deleted"));
    } catch (error) {
      return res.status(500).json(response(500, "Server error", error.message));
    }
  },
};

//500 : error di kodingan
//400 : kesalahan validasi
//401 (error) : ngasih tau pengguna kalo dia harus login lagi
//201 : berhasil buat data
//200 : berhasil mengambil data
