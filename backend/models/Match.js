const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user1_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user2_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'matched', 'rejected'),
    allowNull: false
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'matches',
  timestamps: true,
  // Tắt tự động tạo foreign key constraints
  foreignKeyConstraint: false
});

// Bật association để join User khi truy vấn Match
Match.associate = (models) => {
  Match.belongsTo(models.User, { foreignKey: 'user1_id', as: 'User1' });
  Match.belongsTo(models.User, { foreignKey: 'user2_id', as: 'User2' });
};

module.exports = Match;