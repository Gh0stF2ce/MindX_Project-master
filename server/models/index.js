const User = require('./user.js')
const Role = require('./role.js')
const Game = require('./game.js')
const AccessGame = require('./accessGame.js')
const UserAnswer = require('./userAnswer.js')
const CarouselData = require('./carouselData.js')
const Question = require('./question.js')
const Theme = require('./theme.js')
const QuestionGame = require('./questionGame.js')
const ThemeGame = require('./themeGame')
const Image = require('./image.js')
const Bonus = require('./bonus.js')
const InvadersData = require('./invadersData.js')
const SecurityEvent = require('./securityEvent.js')
const AuthCode = require('./authCode.js')
const TrustedDevice = require('./trustedDevice.js')
const UserSession = require('./userSession.js')


Game.hasOne(CarouselData, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
CarouselData.belongsTo(Game)
Game.hasMany(AccessGame, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
AccessGame.belongsTo(Game)
Game.hasMany(QuestionGame, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
QuestionGame.belongsTo(Game)
Game.hasMany(ThemeGame, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
ThemeGame.belongsTo(Game)
Game.hasMany(Bonus, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
Bonus.belongsTo(Game)
Game.hasOne(InvadersData, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
InvadersData.belongsTo(Game)

User.hasMany(UserAnswer, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
UserAnswer.belongsTo(User)
User.hasMany(Bonus, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
Bonus.belongsTo(User)
User.hasMany(SecurityEvent, { onDelete: 'SET NULL', foreignKey: { allowNull: true } })
SecurityEvent.belongsTo(User)
User.hasMany(AuthCode, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
AuthCode.belongsTo(User)
User.hasMany(TrustedDevice, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
TrustedDevice.belongsTo(User)
User.hasMany(UserSession, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
UserSession.belongsTo(User)

Image.hasMany(Game, { foreignKey: { allowNull: true } })
Game.belongsTo(Image)
Image.hasMany(Question, { foreignKey: { allowNull: true } })
Question.belongsTo(Image)

Role.hasMany(User, { onDelete: 'SET DEFAULT', foreignKey: { allowNull: false, defaultValue: 'aff50f23-2fbc-41be-ba07-c1c69c5e388c' } })
User.belongsTo(Role)
Role.hasMany(AccessGame, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
AccessGame.belongsTo(Role)

Theme.hasMany(ThemeGame, { onDelete: 'RESTRICT', foreignKey: { allowNull: false } })
ThemeGame.belongsTo(Theme)

Question.hasMany(QuestionGame, { onDelete: 'RESTRICT', foreignKey: { allowNull: false } })
QuestionGame.belongsTo(Question)

QuestionGame.hasMany(UserAnswer, { onDelete: 'CASCADE', foreignKey: { allowNull: false } })
UserAnswer.belongsTo(QuestionGame)

module.exports = {
    User, Role, Game, AccessGame,
    UserAnswer, CarouselData, InvadersData,
    Question, Theme, ThemeGame, QuestionGame, Image, Bonus, SecurityEvent, AuthCode, TrustedDevice, UserSession
}
