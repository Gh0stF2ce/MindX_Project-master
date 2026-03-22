const argon2 = require('argon2')

const generateHashPassword = (password) => {
    return argon2.hash(password, {
        type: argon2.argon2id, // Рекомендуемый режим Argon2id
        hashLength: 32,       // Длина хэша
        memoryCost: 2 ** 16, // Память (1024 MB)
        timeCost: 3,         // Количество итераций
        parallelism: 4       // Количество параллельных потоков
    })
}

module.exports = generateHashPassword