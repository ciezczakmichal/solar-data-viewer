import currency, { Options } from 'currency.js'
import { TariffItem } from 'format'

const currencyOptions: Options = {
    symbol: 'zł',
    pattern: `# !`,
    separator: ' ',
    decimal: ',',
}

/**
 * Zwraca koszt pobrania (zakupu) podanej ilości energii.
 * @param energy Ilość energii w kWh
 */
export function calculateEnergyCost(
    energy: number,
    tariffDb: TariffItem[]
): currency {
    let result = currency(0, currencyOptions)

    for (const item of tariffDb) {
        // biblioteka zastosuje zaokrąglenie do pełnych groszy
        result = result.add(item.factorNetto * energy)
    }

    // dolicz podatek
    return result.multiply(1.23)
}
