const Validator = require("fastest-validator");
const v = new Validator();
const { Item, Loan, Return } = require("../models");
const { response } = require("../helpers/response.formatter");
const { Op, where } = require("sequelize");


module.exports = {
    createReturn: async (req, res) => {
        try {
            // nama di {} bisa disamakan dengan field di modelnya
            const { loan_id, total_item, notes, date} = req.body;

            const schema = {
                loan_id: {type: "number", positive: true, integer: true},
                total_item: {type: "number", positive: true, integer: true},
                notes: {type:"string"},
                date: {type:"date"},
            }

            const data = {
                loan_id: Number(loan_id),
                total_item: Number(total_item),
                notes: notes ?? "-",
                date: new Date(date)
            }

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validasi Error", validate));
            }

            const loan = await Loan.findByPk(loan_id, {include: Item});
            //sekaligus mengambil data itemnya untuk di gunakan stocknya akan di update
            //kalau data peminjaman ga ada
            if (!loan) {
                return res.status(400).json(response(400, "Validasi Error", "Data loan not found"));
            }

            //data total_item pengembalian data tidak boleh kurang dari peninjaman
            if(data.total_item > loan.total_item) {
                return res.status(400).json(response(400, " Validasi Error", " Total return item more than loan item"));
            }

            // menambahkan data return 
            const returnData = await Return.create(data);
            //value untuk return sudah ada di const data semuanya
            const updateStock = await Item.update({
                stock: loan.Item.stock + data.total_item
            }, {
                where: {id : loan.item_id} //data id ada nya di relasi Item dari data loan
            });

            //kembalikan data item, peminjaman, pengembalian
            const loanWithItemReturn = await Loan.findByPk(loan_id, {include: [Item, Return]});
            return res.status(201).json(response(201, 'created', loanWithItemReturn));


        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
}