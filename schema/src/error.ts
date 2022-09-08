import { DefinedError } from 'ajv'

export class InvalidSolarDataError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InvalidSolarDataSchemaError extends InvalidSolarDataError {
    schemaErrors: DefinedError[]

    constructor(schemaErrors: DefinedError[]) {
        super('Dane nie są zgodne ze strukturą wymaganą przez aplikację')
        this.name = this.constructor.name
        this.schemaErrors = schemaErrors
    }
}

// @todo w przyszłości InvalidSolarDataValidationError
