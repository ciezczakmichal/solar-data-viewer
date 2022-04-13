import { IsNumber } from 'class-validator'

export class PlantProperties {
    // współczynnik ilości energii dostępnej do pobrania (w magazynie)
    @IsNumber()
    energyInWarehouseFactor!: number

    // moc instalacji w kWp
    @IsNumber()
    installationPower!: number

    // koszt inwestycji
    // @todo osobne gromadzenie kosztów i dopłat
    @IsNumber()
    investmentCost!: number
}
