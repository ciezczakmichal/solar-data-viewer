export interface PlantProperties {
    // lokalizacja - miejscowość
    location?: null | string

    // moc instalacji w kWp
    installationPower: number

    // kąt nachylenia paneli
    pitch?: null | number

    // orientacja - kierunek skierowania paneli
    orientation?: null | number

    // powierzchnia paneli w m^2
    panelsArea?: null | number

    // koszt inwestycji
    // @todo osobne gromadzenie kosztów i dopłat
    investmentCost: number

    // współczynnik ilości energii dostępnej do pobrania (w magazynie)
    energyInWarehouseFactor: number
}
