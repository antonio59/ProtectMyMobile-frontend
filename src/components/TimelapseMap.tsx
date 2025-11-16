import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// Dynamic import for Leaflet to avoid SSR issues
let L: any;

interface TheftData {
  date: string;
  borough: string;
  lat: number;
  lng: number;
  thefts: number;
}

// Sample data based on Met Police statistics and GovSpendBase
const sampleData: TheftData[] = [
  // January 2024
  { date: '2024-01', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 580 },
  { date: '2024-01', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 245 },
  { date: '2024-01', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 198 },
  { date: '2024-01', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 156 },
  { date: '2024-01', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 142 },
  { date: '2024-01', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 134 },
  { date: '2024-01', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 128 },
  { date: '2024-01', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 118 },
  { date: '2024-01', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 95 },
  { date: '2024-01', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 82 },
  
  // February 2024
  { date: '2024-02', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 612 },
  { date: '2024-02', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 268 },
  { date: '2024-02', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 215 },
  { date: '2024-02', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 172 },
  { date: '2024-02', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 158 },
  { date: '2024-02', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 145 },
  { date: '2024-02', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 142 },
  { date: '2024-02', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 132 },
  { date: '2024-02', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 108 },
  { date: '2024-02', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 91 },
  
  // March 2024
  { date: '2024-03', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 695 },
  { date: '2024-03', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 298 },
  { date: '2024-03', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 245 },
  { date: '2024-03', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 195 },
  { date: '2024-03', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 182 },
  { date: '2024-03', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 168 },
  { date: '2024-03', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 165 },
  { date: '2024-03', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 152 },
  { date: '2024-03', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 125 },
  { date: '2024-03', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 105 },
  
  // April 2024
  { date: '2024-04', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 728 },
  { date: '2024-04', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 315 },
  { date: '2024-04', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 268 },
  { date: '2024-04', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 212 },
  { date: '2024-04', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 198 },
  { date: '2024-04', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 185 },
  { date: '2024-04', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 182 },
  { date: '2024-04', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 168 },
  { date: '2024-04', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 142 },
  { date: '2024-04', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 118 },
  
  // May 2024
  { date: '2024-05', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 782 },
  { date: '2024-05', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 342 },
  { date: '2024-05', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 295 },
  { date: '2024-05', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 235 },
  { date: '2024-05', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 218 },
  { date: '2024-05', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 205 },
  { date: '2024-05', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 198 },
  { date: '2024-05', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 185 },
  { date: '2024-05', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 158 },
  { date: '2024-05', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 132 },
  
  // June 2024
  { date: '2024-06', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 845 },
  { date: '2024-06', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 378 },
  { date: '2024-06', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 325 },
  { date: '2024-06', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 258 },
  { date: '2024-06', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 242 },
  { date: '2024-06', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 228 },
  { date: '2024-06', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 218 },
  { date: '2024-06', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 205 },
  { date: '2024-06', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 175 },
  { date: '2024-06', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 148 },
  
  // July 2024
  { date: '2024-07', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 892 },
  { date: '2024-07', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 405 },
  { date: '2024-07', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 352 },
  { date: '2024-07', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 282 },
  { date: '2024-07', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 265 },
  { date: '2024-07', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 248 },
  { date: '2024-07', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 238 },
  { date: '2024-07', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 225 },
  { date: '2024-07', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 192 },
  { date: '2024-07', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 165 },
  
  // August 2024
  { date: '2024-08', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 825 },
  { date: '2024-08', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 385 },
  { date: '2024-08', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 335 },
  { date: '2024-08', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 268 },
  { date: '2024-08', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 252 },
  { date: '2024-08', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 235 },
  { date: '2024-08', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 228 },
  { date: '2024-08', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 212 },
  { date: '2024-08', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 182 },
  { date: '2024-08', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 158 },
  
  // September 2024
  { date: '2024-09', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 768 },
  { date: '2024-09', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 358 },
  { date: '2024-09', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 312 },
  { date: '2024-09', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 248 },
  { date: '2024-09', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 235 },
  { date: '2024-09', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 218 },
  { date: '2024-09', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 212 },
  { date: '2024-09', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 198 },
  { date: '2024-09', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 168 },
  { date: '2024-09', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 145 },
  
  // October 2024
  { date: '2024-10', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 712 },
  { date: '2024-10', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 332 },
  { date: '2024-10', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 288 },
  { date: '2024-10', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 232 },
  { date: '2024-10', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 218 },
  { date: '2024-10', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 205 },
  { date: '2024-10', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 198 },
  { date: '2024-10', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 185 },
  { date: '2024-10', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 158 },
  { date: '2024-10', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 135 },
  
  // November 2024
  { date: '2024-11', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 685 },
  { date: '2024-11', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 318 },
  { date: '2024-11', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 275 },
  { date: '2024-11', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 222 },
  { date: '2024-11', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 208 },
  { date: '2024-11', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 195 },
  { date: '2024-11', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 188 },
  { date: '2024-11', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 175 },
  { date: '2024-11', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 148 },
  { date: '2024-11', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 128 },
  
  // December 2024
  { date: '2024-12', borough: 'Westminster', lat: 51.4975, lng: -0.1357, thefts: 845 },
  { date: '2024-12', borough: 'Camden', lat: 51.5290, lng: -0.1255, thefts: 395 },
  { date: '2024-12', borough: 'Islington', lat: 51.5416, lng: -0.1022, thefts: 342 },
  { date: '2024-12', borough: 'Kensington and Chelsea', lat: 51.4991, lng: -0.1938, thefts: 275 },
  { date: '2024-12', borough: 'Southwark', lat: 51.5030, lng: -0.0900, thefts: 258 },
  { date: '2024-12', borough: 'Lambeth', lat: 51.4570, lng: -0.1231, thefts: 242 },
  { date: '2024-12', borough: 'Hackney', lat: 51.5450, lng: -0.0553, thefts: 235 },
  { date: '2024-12', borough: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, thefts: 218 },
  { date: '2024-12', borough: 'Newham', lat: 51.5255, lng: 0.0352, thefts: 188 },
  { date: '2024-12', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2339, thefts: 162 },
];

export default function TimelapseMap() {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds per month
  const [mounted, setMounted] = useState(false);
  
  const uniqueMonths = Array.from(new Set(sampleData.map(d => d.date))).sort();
  const currentMonth = uniqueMonths[currentMonthIndex];
  
  // Get data for current month
  const currentData = sampleData.filter(d => d.date === currentMonth);
  
  // Calculate total thefts for current month
  const totalThefts = currentData.reduce((sum, d) => sum + d.thefts, 0);
  
  // Format current month for display
  const currentMonthDisplay = new Date(currentMonth + '-01').toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    if (mapRef.current) return; // Map already initialized
    
    // Dynamic import of Leaflet
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      L = leaflet.default;
      
      // Fix for default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      
      const map = L.map('timelapse-map').setView([51.5074, -0.1278], 11);
      
      // Use dark theme tiles from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
      }).addTo(map);
      
      mapRef.current = map;
    })();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Update markers when month changes
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server
    if (!mapRef.current || !L) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add new markers for current month
    currentData.forEach(item => {
      const radius = Math.sqrt(item.thefts) * 2; // Scale radius based on theft count
      const opacity = Math.min(item.thefts / 1000, 0.8); // Max opacity at 1000 thefts
      
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: radius,
        fillColor: '#ef4444',
        color: '#fca5a5',
        weight: 2,
        opacity: 1,
        fillOpacity: opacity,
      }).addTo(mapRef.current!);
      
      marker.bindPopup(`
        <div class="text-sm bg-neutral-900 text-white p-3 rounded-lg border border-neutral-700">
          <strong class="font-bold text-lg">${item.borough}</strong><br/>
          <span class="text-neutral-300">Thefts:</span> <strong class="text-red-400">${item.thefts}</strong><br/>
          <span class="text-neutral-300">Month:</span> <span class="text-neutral-100">${new Date(item.date + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
        </div>
      `);
      
      markersRef.current.push(marker);
    });
  }, [currentMonth]);
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentMonthIndex((prev) => {
        if (prev >= uniqueMonths.length - 1) {
          setIsPlaying(false);
          return 0; // Loop back to start
        }
        return prev + 1;
      });
    }, playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, uniqueMonths.length]);
  
  const handlePlay = () => setIsPlaying(!isPlaying);
  
  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentMonthIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentMonthIndex((prev) => Math.min(uniqueMonths.length - 1, prev + 1));
  };
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentMonthIndex(parseInt(e.target.value));
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch(e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          handlePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Home':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentMonthIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentMonthIndex(uniqueMonths.length - 1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, uniqueMonths.length]);
  
  return (
    <div className="space-y-4">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {mounted && `Currently viewing ${currentMonthDisplay}. Total thefts: ${totalThefts}. Month ${currentMonthIndex + 1} of ${uniqueMonths.length}. ${isPlaying ? 'Animation playing' : 'Animation paused'}.`}
      </div>
      
      {/* Map Container */}
      <div className="relative">
        <div 
          id="timelapse-map" 
          className="w-full h-[400px] md:h-[600px] lg:h-[700px] rounded-lg shadow-lg border-2 border-neutral-700 bg-neutral-900"
          role="application"
          aria-label="Interactive theft hotspot map"
        />
        
        {/* Current Month Display Overlay - Hidden on very small screens */}
        <div className="hidden sm:block absolute top-4 left-4 bg-neutral-900/95 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg border-2 border-primary z-[1000]">
          <div className="text-xs md:text-sm text-neutral-400 mb-1">Current Period</div>
          <div className="text-lg md:text-2xl font-bold text-white">
            {currentMonthDisplay}
          </div>
          <div className="text-xs md:text-sm text-neutral-400 mt-1">
            Total: <span className="font-bold text-red-400">{totalThefts.toLocaleString()}</span> thefts
          </div>
        </div>
      </div>
      
      {/* Integrated Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        {/* Mobile: Show month info at top */}
        <div className="sm:hidden mb-4 pb-4 border-b border-neutral-200">
          <div className="text-center">
            <div className="text-lg font-bold text-neutral-900">{currentMonthDisplay}</div>
            <div className="text-sm text-neutral-600">
              Total: <span className="font-bold text-red-600">{totalThefts.toLocaleString()}</span> thefts
            </div>
          </div>
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <button
              onClick={handlePrevious}
              disabled={currentMonthIndex === 0}
              className="p-2 md:p-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              title="Previous Month (Arrow Left)"
              aria-label="Previous month"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={handlePlay}
              className="p-3 md:p-3.5 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentMonthIndex === uniqueMonths.length - 1}
              className="p-2 md:p-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              title="Next Month (Arrow Right)"
              aria-label="Next month"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
          
          {/* Timeline Slider */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <label htmlFor="timeline-slider" className="text-xs text-neutral-600">
                Timeline
              </label>
              <span className="text-xs text-neutral-500">
                {currentMonthIndex + 1} / {uniqueMonths.length}
              </span>
            </div>
            <input
              id="timeline-slider"
              type="range"
              min="0"
              max={uniqueMonths.length - 1}
              value={currentMonthIndex}
              onChange={handleSliderChange}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Timeline slider"
              aria-valuemin={0}
              aria-valuemax={uniqueMonths.length - 1}
              aria-valuenow={currentMonthIndex}
              aria-valuetext={currentMonthDisplay}
            />
          </div>
          
          {/* Speed Control */}
          <div className="flex items-center gap-2 justify-between md:justify-start">
            <label htmlFor="speed-select" className="text-sm font-medium text-neutral-700 whitespace-nowrap">
              Speed:
            </label>
            <select
              id="speed-select"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Playback speed"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <details className="text-xs text-neutral-600">
            <summary className="cursor-pointer hover:text-neutral-900 font-medium">
              ⌨️ Keyboard Shortcuts
            </summary>
            <ul className="mt-2 space-y-1 ml-4">
              <li><kbd className="px-1.5 py-0.5 bg-neutral-100 rounded">Space</kbd> - Play/Pause</li>
              <li><kbd className="px-1.5 py-0.5 bg-neutral-100 rounded">←</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded">→</kbd> - Previous/Next Month</li>
              <li><kbd className="px-1.5 py-0.5 bg-neutral-100 rounded">Home</kbd> <kbd className="px-1.5 py-0.5 bg-neutral-100 rounded">End</kbd> - First/Last Month</li>
            </ul>
          </details>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h3 className="font-semibold mb-4 text-neutral-900 flex items-center">
          <span className="mr-2">📊</span> How to Read the Map
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Circle Size */}
          <div>
            <div className="font-medium text-neutral-700 mb-2 flex items-center">
              <span className="mr-2">⭕</span> Circle Size
            </div>
            <div className="space-y-1 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Small (0-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Medium (100-500)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
                <span>Large (500+)</span>
              </div>
            </div>
          </div>
          
          {/* Intensity */}
          <div>
            <div className="font-medium text-neutral-700 mb-2 flex items-center">
              <span className="mr-2">🎨</span> Color Intensity
            </div>
            <div className="space-y-1 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-30"></div>
                <span>Low density</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-60"></div>
                <span>Medium density</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
                <span>High density</span>
              </div>
            </div>
          </div>
          
          {/* Interaction */}
          <div>
            <div className="font-medium text-neutral-700 mb-2 flex items-center">
              <span className="mr-2">👆</span> Interaction
            </div>
            <div className="text-sm text-neutral-600 space-y-1">
              <p>• Click circles for details</p>
              <p>• Zoom with scroll wheel</p>
              <p>• Pan by dragging map</p>
            </div>
          </div>
          
          {/* Navigation */}
          <div>
            <div className="font-medium text-neutral-700 mb-2 flex items-center">
              <span className="mr-2">⌨️</span> Navigation
            </div>
            <div className="text-sm text-neutral-600 space-y-1">
              <p>• Space to play/pause</p>
              <p>• Arrows for prev/next</p>
              <p>• Home/End for start/end</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Source */}
      <div className="bg-blue-50 border-l-4 border-primary rounded-r-lg p-4">
        <p className="text-sm text-neutral-700">
          <strong className="text-neutral-900">Data Source:</strong> Based on Metropolitan Police statistics and modeled after{' '}
          <a 
            href="https://www.govspendbase.uk/phones-timelapse" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            GovSpendBase Phones Timelapse
          </a>. 
          Data represents estimated monthly theft patterns across London boroughs for 2024.
        </p>
      </div>
    </div>
  );
}
