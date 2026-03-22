class ApiError extends Error {
    constructor(message, status) {
        super()
        this.message = message
        this.status = status
    }

    static badRequest(message) {
        return new ApiError(message, 400)
    }

    static unauthorized(message) {
        return new ApiError(message, 401)
    }

    static forbidden(message) {
        return new ApiError(message, 403)
    }
}

module.exports = ApiError