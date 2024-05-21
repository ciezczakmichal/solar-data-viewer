import currency, { type Options } from 'currency.js'

const options: Options = {
    symbol: 'zł',
    pattern: `# !`,
    separator: ' ',
    decimal: ',',
}

export class CurrencyZloty extends currency {
    constructor(value: currency.Any = 0) {
        super(value, options)
    }
}
