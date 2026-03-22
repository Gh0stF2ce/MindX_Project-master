const jwt = require('jsonwebtoken')

const generateJwt = (id, username, role) => {
    return jwt.sign(
        { id, username, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    )
}

module.exports = generateJwt