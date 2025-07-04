const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserPhoto = sequelize.define('UserPhoto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  photo_url: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'user_photos',
  timestamps: true
});

module.exports = UserPhoto;