import { IsNumber, IsOptional, IsString } from 'class-validator'

export class PlantProperties {
    // lokalizacja - miejscowość
    @IsOptional()
    @IsString()
    location?: string | null

    // moc instalacji w kWp
    @IsNumber()
    installationPower!: number

    // kąt nachylenia paneli
    @IsOptional()
    @IsNumber()
    pitch?: number | null

    // orientacja - kierunek skierowania paneli
    @IsOptional()
    @IsNumber()
    orientation?: number | null

    // powierzchnia paneli w m^2
    @IsOptional()
    @IsNumber()
    panelsArea?: number | null

    // koszt inwestycji
    // @todo osobne gromadzenie kosztów i dopłat
    @IsNumber()
    investmentCost!: number

    // współczynnik ilości energii dostępnej do pobrania (w magazynie)
    @IsNumber()
    energyInWarehouseFactor!: number
}
