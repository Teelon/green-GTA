
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { UserSettings, CommuteData } from "./types";
import { DEFAULT_SETTINGS } from "./constants";
import { analyzeRoute } from "./services/routeService";
import { Header } from "./components/Header";
import { ConfigurationPanel } from "./components/ConfigurationPanel";
import { ResultsPanel } from "./components/ResultsPanel";

const App = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [commuteData, setCommuteData] = useState<CommuteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawMapResponse, setRawMapResponse] = useState<string>("");

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = `${position.coords.latitude}, ${position.coords.longitude}`;
          setSettings(s => ({ ...s, origin: loc }));
          setLoadingLocation(false);
        },
        (err) => {
          console.error(err);
          setError("Unable to retrieve location. Please enter manually.");
          setLoadingLocation(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleCalculateRoute = async () => {
    if (!settings.origin || !settings.destination) {
      setError("Please enter both origin and destination.");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setCommuteData(null);

    try {
      const result = await analyzeRoute(settings.origin, settings.destination);
      setCommuteData(result.data);
      setRawMapResponse(result.rawMapText);
    } catch (err: any) {
      console.error(err);
      setError("Failed to calculate route data. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ConfigurationPanel 
            settings={settings}
            setSettings={setSettings}
            onCalculate={handleCalculateRoute}
            analyzing={analyzing}
            error={error}
            getUserLocation={getUserLocation}
            loadingLocation={loadingLocation}
          />
          <ResultsPanel 
            commuteData={commuteData}
            settings={settings}
            rawMapResponse={rawMapResponse}
          />
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
