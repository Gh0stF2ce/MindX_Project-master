const jwt = require('jsonwebtoken')

const generateJwt = (id, username, role, tokenVersion = 0, sessionId = null) => {
    return jwt.sign(
        { id, username, role, tokenVersion, sessionId },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

module.exports = generateJwt
