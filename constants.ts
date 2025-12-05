
import { UserSettings } from "./types";

export const VEHICLE_PRESETS = {
  sedan: { label: "Sedan (Gas)", efficiency: 8.5, maintenance: 0.09 },
  suv: { label: "SUV (Gas)", efficiency: 11.0, maintenance: 0.12 },
  truck: { label: "Truck (Gas)", efficiency: 14.0, maintenance: 0.15 },
  hybrid: { label: "Hybrid", efficiency: 5.0, maintenance: 0.08 },
  ev: { label: "Electric Vehicle", efficiency: 0, maintenance: 0.06 },
};

export const DEFAULT_SETTINGS: UserSettings = {
  origin: "",
  destination: "Union Station, Toronto",
  vehicleType: "sedan",
  fuelEfficiency: 8.5,
  gasPrice: 1.55,
  parkingCost: 20,
  goFare: 18.00,
  maintenanceCostPerKm: 0.09
};
