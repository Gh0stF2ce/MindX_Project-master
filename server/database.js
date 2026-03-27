require('dotenv').config()

const Sequelize = require('sequelize')

module.exports = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        logging: process.env.DATABASE_LOGGING === 'true',
        benchmark: true, //логирование времени выполнения запросов
        pool: {
            max: 20,
            min: 5,       // поддерживать 5 активных соединений всегда
            acquire: 5000, // 5 секунд ожидания
            idle: 30000    // 30 секунд жизни неиспользуемого соединения
        }
    },
)
