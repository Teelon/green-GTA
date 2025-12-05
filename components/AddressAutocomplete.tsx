import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  loadingLocation?: boolean;
  onLocationClick?: () => void;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  loadingLocation,
  onLocationClick 
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Library refs
  const PlacesLib = useRef<any>(null);
  const sessionToken = useRef<any>(null);

  // Sync internal query with external value if it changes independently
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize Google Maps Places Library (New)
  useEffect(() => {
    const initLibrary = async () => {
      try {
        if (window.google && window.google.maps && window.google.maps.importLibrary) {
          const places = await window.google.maps.importLibrary("places");
          PlacesLib.current = places;
          
          if (places.AutocompleteSessionToken) {
            sessionToken.current = new places.AutocompleteSessionToken();
          }
        }
      } catch (error) {
        console.error("Failed to load Google Maps Places library", error);
      }
    };
    initLibrary();
  }, []);

  useEffect(() => {
    let active = true;

    const fetchSuggestions = async () => {
      // Don't fetch if query is too short
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      // If dropdown isn't meant to be open, don't fetch (e.g. initial load)
      if (!isOpen) return;

      // Ensure library is loaded
      if (!PlacesLib.current) {
        if (window.google?.maps?.importLibrary) {
           PlacesLib.current = await window.google.maps.importLibrary("places");
        } else {
           return;
        }
      }

      try {
        const { AutocompleteSuggestion } = PlacesLib.current;
        
        if (!AutocompleteSuggestion) return;

        const request = {
          input: debouncedQuery,
          includedRegionCodes: ["ca"], // Restrict to Canada
          sessionToken: sessionToken.current
        };

        const { suggestions: results } = await AutocompleteSuggestion.fetchSuggestions(request);
        
        if (active) {
          setSuggestions(results || []);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Silently fail or clear suggestions on error
        if (active) setSuggestions([]);
      }
    };

    fetchSuggestions();

    return () => { active = false; };
  }, [debouncedQuery, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (suggestion: any) => {
    // In Places Library (New), suggestion has a `placePrediction` property
    const prediction = suggestion.placePrediction;
    
    // Extract the best available text
    const text = prediction?.text?.text || prediction?.mainText?.text || "";
    
    setQuery(text);
    onChange(text);
    setSuggestions([]);
    setIsOpen(false);

    // Refresh session token after selection
    if (PlacesLib.current?.AutocompleteSessionToken) {
      sessionToken.current = new PlacesLib.current.AutocompleteSessionToken();
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-medium text-slate-500 uppercase mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          autoComplete="off"
        />
        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((s, idx) => {
            const prediction = s.placePrediction;
            const mainText = prediction?.mainText?.text;
            const secondaryText = prediction?.secondaryText?.text;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 border-b border-slate-100 last:border-0 flex items-start transition-colors"
              >
                <MapPin className="w-3 h-3 mt-1 mr-2 text-emerald-500 flex-shrink-0" />
                <div className="truncate">
                  <span className="font-medium">{mainText}</span>
                  <span className="text-xs text-slate-500 ml-1">
                    {secondaryText}
                  </span>
                </div>
              </button>
            );
          })}
          <div className="px-2 py-1 flex justify-end">
             <img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Powered by Google" className="h-4 object-contain" />
          </div>
        </div>
      )}

      {onLocationClick && (
        <button 
          onClick={onLocationClick}
          disabled={loadingLocation}
          className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center transition-colors disabled:opacity-50"
        >
          {loadingLocation ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin"/>
          ) : (
            <MapPin className="w-3 h-3 mr-1"/>
          )}
          Use Current Location
        </button>
      )}
    </div>
  );
};