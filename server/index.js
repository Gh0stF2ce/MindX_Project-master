require('dotenv').config()
const express = require('express')
const router = require('./routes/indexRouter.js')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require("helmet")
const fileUpload = require('express-fileupload')
const sequelize = require('./database.js')
const { InvadersData, User } = require('./models')
const errorHandler = require('./middlewares/ErrorHandlingMiddleware')
const path = require('path')

const PORT = process.env.PORT

const corsOptions = {
    origin: ['https://playmindx.online'],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true
}

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
    message: 'Слишком много запросов, пожалуйста, повторите попытку позже.'
})

const app = express()
if (process.env.MODE === 'PROD') {
    app.use(cors(corsOptions))
    app.use(limiter);
    app.use(helmet());
} else {
    app.use(cors({ origin: true, credentials: true }))
}
app.use(express.json())
app.use('/api', express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)
app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.query('CREATE EXTENSION IF NOT EXISTS citext');
        await sequelize.sync()

        const queryInterface = sequelize.getQueryInterface();
        const userTable = User.getTableName();
        const userColumns = await queryInterface.describeTable(userTable);
        if (!userColumns.email) {
            await queryInterface.addColumn(userTable, 'email', {
                type: sequelize.Sequelize.CITEXT,
                allowNull: true,
            });
        }
        if (!userColumns.isEmailVerified) {
            await queryInterface.addColumn(userTable, 'isEmailVerified', {
                type: sequelize.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
        if (!userColumns.isTwoFactorEnabled) {
            await queryInterface.addColumn(userTable, 'isTwoFactorEnabled', {
                type: sequelize.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
        if (!userColumns.tokenVersion) {
            await queryInterface.addColumn(userTable, 'tokenVersion', {
                type: sequelize.Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            });
        }

        const invadersTable = InvadersData.getTableName();
        const invadersColumns = await queryInterface.describeTable(invadersTable);
        if (!invadersColumns.schoolClass) {
            await queryInterface.addColumn(invadersTable, 'schoolClass', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
            });
        }

        app.listen(PORT, () => console.log(`Сервер запущен на ${PORT} порту`))
    } catch (e) {
        console.log(e)
    }
}
start()
