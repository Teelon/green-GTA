
import React from "react";
import { Bus } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Bus className="h-8 w-8" />
          <h1 className="text-2xl font-bold tracking-tight">GreenCommute GTA</h1>
        </div>
        <div className="hidden md:flex items-center text-emerald-100 text-sm">
          <span className="mr-4">Save Money. Save Time. Save the Planet.</span>
        </div>
      </div>
    </header>
  );
};
