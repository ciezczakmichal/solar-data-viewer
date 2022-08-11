export class InvalidSolarDataError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidSolarDataSchemaError extends InvalidSolarDataError {
    constructor(message?: string) {
        super(message)
        this.name = this.constructor.name
    }
}

// @todo w przyszłości InvalidSolarDataValidationError
