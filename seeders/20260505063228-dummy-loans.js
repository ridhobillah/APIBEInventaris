'use strict';
const { Item } = require('../models')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // ambil data item semua untuk akses id nya buat FK item_id
    const items = await Item.findAll();

    //loop sebanyak 20 data
    let dummyData = [];
    for(let index = 1; index <= 20; index++) {
      // mengambil secara acak id dari data item
      const itemId = items[Math.floor(Math.random()*items.length)];
      //math random menghasilkan angka 0-1 termasuk desimal items.length itung jumlah item contoh hasil random 0.5 length itemsnya 3
      //0.5 * 3 = 1.5 : kemudian dimath.floor diambil angka sebelum koma = 1 jadi item_id atau 0.9 * 3 = 2.7 jadi item_id nya 2 atau 1 * 3 = 3 jadi item_id nya 3
      let data = {
        item_id: itemId.id, //itemId isinya full data item yang indexnya antara 0.2
        name: `Peminjam Ke-${index}`,
        total_item: 1,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dummyData.push(data); //simpan data ke array
    }

    await queryInterface.bulkInsert('Loans', dummyData);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Loans', null, {});
  }
};
