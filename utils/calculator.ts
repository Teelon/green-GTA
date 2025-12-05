
import { CommuteData, UserSettings } from "../types";

export const calculateFinancials = (data: CommuteData, settings: UserSettings) => {
  const dailyDrivingGas = data.distanceKm * 2 * (settings.fuelEfficiency / 100) * settings.gasPrice;
  const dailyMaintenance = data.distanceKm * 2 * settings.maintenanceCostPerKm;
  
  const dailyDrivingTotal = dailyDrivingGas + dailyMaintenance + Number(settings.parkingCost);
  const dailyTransitTotal = Number(settings.goFare);

  const savingsDaily = dailyDrivingTotal - dailyTransitTotal;
  const savingsMonthly = savingsDaily * 20; // 20 working days
  const savingsYearly = savingsDaily * 240; // 240 working days

  return {
    dailyDrivingTotal,
    dailyTransitTotal,
    savingsDaily,
    savingsMonthly,
    savingsYearly
  };
};

export const calculateEmissions = (data: CommuteData, settings: UserSettings) => {
  const daysPerYear = 240;
  const dailyLiters = data.distanceKm * 2 * (settings.fuelEfficiency / 100);
  const dailyCO2DrivingKg = dailyLiters * 2.3;
  const dailyCO2TransitKg = dailyCO2DrivingKg * 0.3; // Approx 70% efficient relative to single car
  const co2SavedKg = (dailyCO2DrivingKg - dailyCO2TransitKg) * daysPerYear;
  
  return {
    co2SavedKg,
    treesEquivalent: Math.round(Math.max(0, co2SavedKg) / 20)
  };
};
