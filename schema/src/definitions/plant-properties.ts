export interface PlantProperties {
    // lokalizacja - miejscowość
    location?: string | null

    // moc instalacji w kWp
    installationPower: number

    // kąt nachylenia paneli
    pitch?: number | null

    // orientacja - kierunek skierowania paneli
    orientation?: number | null

    // powierzchnia paneli w m^2
    panelsArea?: number | null

    // koszt inwestycji
    // @todo osobne gromadzenie kosztów i dopłat
    investmentCost: number

    // współczynnik ilości energii dostępnej do pobrania (w magazynie)
    energyInWarehouseFactor: number
}
