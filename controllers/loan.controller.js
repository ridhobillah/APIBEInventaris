const Validator = require("fastest-validator");
const v = new Validator();
const { Item, Loan, Return } = require("../models");
const { response } = require("../helpers/response.formatter");
const { Op } = require("sequelize");

module.exports = {
  createLoan: async (req, res) => {
    try {
      const { item_id, name, total_item, date } = req.body;

      const schema = {
        item_id: { type: "number", positive: true, integer: true },
        total_item: { type: "number", positive: true, integer: true },
        name: { type: "string", min: 3 },
        date: { type: "date" },
      };
      const data = {
        item_id: Number(item_id),
        total_item: Number(total_item),
        name: name,
        date: new Date(date),
      };
      const validate = v.validate(data, schema);
      if (validate.length > 0) {
        return res.status(400).json(response(400, "Validasi Error", validate));
      }

      const item = await Item.findByPk(item_id);
      if (!item) {
        return res
          .status(400)
          .json(
            response(400, "Data item not found. please check [item_id] value"),
          );
      }

      if (data.total_item > item.stock) {
        return res
          .status(400)
          .json(
            response(400, `Stock not available. Available only ${item.stock}`),
          );
      }

      const loan = await Loan.create(data);
      //update stok di item, kurang jumlah pinjam
      const updateStock = await Item.update(
        {
          stock: item.stock - data.total_item,
        },
        {
          where: { id: item_id },
        },
      );

      // ambil data loan dan relasi item
      const loanWithItem = await Loan.findByPk(loan.id, { include: Item });
      //include

      return res.status(201).json(response(201, "created", loanWithItem));
      //output berupa data peminjaman
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },

  //pagination loan
  getLoans: async (req, res) => {
    try {
      const { page, limit } = req.query;
      //page ambil data di halaman ke berapa limit, limit : munculkan data berapa
      //offset menentukan data yang di munculkan mulai dari berapa
      const offset = (Number(page) - 1) * Number(limit);
      //contoh : page 1 : 1-1 = 0 : limitnya 10:0*10 = 0 jadi offset 0 data mulai dari 1, halaman ke satu datanya 1-10
      //contoh : page 2 : 2-1 = 1 : limitnya 10:1*10 = 10 jadi offset 10 datanya mulai dari 11

      const { count, rows } = await Loan.findAndCountAll({
        offset: Number(offset),
        limit: Number(limit),
        include: [Item, Return], //mengambil lebih dari satu relasi,
      });
      const formatPagination = {
        data: rows, //daya yang di munculkan
        limit: limit,
        //munculin angka 1-20 atau 21-30 sesuai yang di ambil : misal offset 20 : (20+1) (20+10) : 21-30
        rows: Number(offset) + 1 + "-" + (Number(offset) + rows.length),
        total: count, //jumlah data keseluruhan
        page: page, // sedang di halaman keberapa
      };
      return res.status(200).json(response(200, "success", formatPagination));
    } catch (error) {
      return res.status(500).json(response(500, "Server Error", error.message));
    }
  },
};
