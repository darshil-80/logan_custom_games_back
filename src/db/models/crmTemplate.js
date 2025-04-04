export default (sequelize, DataTypes) => {
  const CrmTemplate = sequelize.define('CrmTemplate', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    underscored: true,
    schema: 'public',
    tableName: 'crm_templates',
    timestamps: true
  })

  return CrmTemplate
}
