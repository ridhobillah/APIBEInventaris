'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Returns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      loan_id: {
        type: Sequelize.BIGINT
      },
      total_item: {
        type: Sequelize.INTEGER
      },
      notes: {
        type: Sequelize.TEXT
      },
      date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    //mendefinisikan fk
    await queryInterface.addConstraint("Returns", {
      fields: ['loan_id'],
      type: 'foreign key',
      name: 'fk_custom_loan_id',
      references : {
        table: "Items",
        field: 'id'
      },
      onDelete: 'CASCADE', //jika pk dihapus, data fk ikut terhapus
      onUpdate: 'CASCADE' //jika pk id diubah, id fk ikut terubah
    });
    
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Returns');
  }
};