'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tarefa extends Model {
    static associate(models) {
      // Definindo o relacionamento entre Tarefa e Usuario
      Tarefa.belongsTo(models.Usuario, { 
        foreignKey: 'id_usuario', // Relacionamento com a tabela de usuários
        as: 'usuario', // Alias para acessar a associação
      });
    }
  }

  Tarefa.init(
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false, // Garantir que sempre haja um id_usuario
      },
      descricao: {
        type: DataTypes.STRING,
        allowNull: false, // Garantir que a descrição seja fornecida
      },
      setor: {
        type: DataTypes.STRING,
        allowNull: false, // Garantir que o setor seja fornecido
      },
      prioridade: {
        type: DataTypes.STRING,
        validate: {
          isIn: [['baixa', 'média', 'alta']], // Define os valores permitidos
        },
      },
      data_cadastro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Define o valor padrão para a data de cadastro
      },
      status: {
        type: DataTypes.STRING,
        validate: {
          isIn: [['a fazer', 'fazendo', 'pronto']], // Define os valores permitidos
        },
      },
    },
    {
      sequelize,
      modelName: 'Tarefa',
    }
  );
  
  return Tarefa;
};
