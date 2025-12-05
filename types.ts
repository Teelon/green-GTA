
export interface CommuteData {
  distanceKm: number;
  drivingTimeMins: number;
  transitTimeMins: number;
  transitSummary: string;
  sourceUrls: string[];
}

export interface UserSettings {
  origin: string;
  destination: string;
  vehicleType: "sedan" | "suv" | "truck" | "hybrid" | "ev";
  fuelEfficiency: number; // L/100km
  gasPrice: number; // CAD/L
  parkingCost: number; // CAD/day
  goFare: number; // CAD round trip
  maintenanceCostPerKm: number; // CAD/km
}
