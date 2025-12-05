
import React from "react";
import { Navigation, Car, Loader2 } from "lucide-react";
import { UserSettings } from "../types";
import { VEHICLE_PRESETS } from "../constants";
import { AddressAutocomplete } from "./AddressAutocomplete";

interface ConfigurationPanelProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onCalculate: () => void;
  analyzing: boolean;
  error: string | null;
  getUserLocation: () => void;
  loadingLocation: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  settings,
  setSettings,
  onCalculate,
  analyzing,
  error,
  getUserLocation,
  loadingLocation
}) => {
  const handleVehicleChange = (type: UserSettings["vehicleType"]) => {
    setSettings(prev => ({
      ...prev,
      vehicleType: type,
      fuelEfficiency: VEHICLE_PRESETS[type].efficiency,
      maintenanceCostPerKm: VEHICLE_PRESETS[type].maintenance
    }));
  };

  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible relative z-20">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-emerald-600" />
            Route Details
          </h2>
        </div>
        <div className="p-5 space-y-4">
          
          <AddressAutocomplete 
            label="Origin"
            placeholder="e.g. 123 Main St, Mississauga"
            value={settings.origin}
            onChange={(val) => setSettings(s => ({ ...s, origin: val }))}
            onLocationClick={getUserLocation}
            loadingLocation={loadingLocation}
          />

          <AddressAutocomplete 
            label="Destination"
            placeholder="e.g. Union Station, Toronto"
            value={settings.destination}
            onChange={(val) => setSettings(s => ({ ...s, destination: val }))}
          />

          <button
            onClick={onCalculate}
            disabled={analyzing}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center relative z-0"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Route...
              </>
            ) : (
              <>
                Calculate Savings
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative z-10">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center">
            <Car className="w-5 h-5 mr-2 text-emerald-600" />
            Vehicle & Costs
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Vehicle Type</label>
            <select
              value={settings.vehicleType}
              onChange={(e) => handleVehicleChange(e.target.value as any)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {Object.entries(VEHICLE_PRESETS).map(([key, data]) => (
                <option key={key} value={key}>{data.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Fuel Econ (L/100km)</label>
              <input
                type="number"
                value={settings.fuelEfficiency}
                onChange={(e) => setSettings(s => ({ ...s, fuelEfficiency: Number(e.target.value) }))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Gas Price ($/L)</label>
              <input
                type="number"
                step="0.01"
                value={settings.gasPrice}
                onChange={(e) => setSettings(s => ({ ...s, gasPrice: Number(e.target.value) }))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Daily Parking ($)</label>
              <input
                type="number"
                value={settings.parkingCost}
                onChange={(e) => setSettings(s => ({ ...s, parkingCost: Number(e.target.value) }))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1">GO Fare (Round Trip)</label>
              <input
                type="number"
                value={settings.goFare}
                onChange={(e) => setSettings(s => ({ ...s, goFare: Number(e.target.value) }))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
