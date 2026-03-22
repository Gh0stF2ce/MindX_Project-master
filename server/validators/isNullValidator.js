function validateCheck(isBool, msg) {
    if (isBool) {
        throw new Error(`${msg}`)
    }
}

module.exports = validateCheck