// Redesigned Timelapse Map - Borough-level Choropleth with Analytics
// Security: No residential addresses, aggregated borough data only

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet
let L: any;

interface BoroughData {
  date: string;
  borough: string;
  thefts: number;
}

interface BoroughStats {
  name: string;
  thefts: number;
  trend: 'up' | 'down' | 'same';
  change: number;
}

// Aggregated borough-level data (NO individual addresses)
// Note: In production, this data is fetched from Supabase 'theft_data_points' table
const boroughData: BoroughData[] = [
  // ... static data as fallback ...
  // January 2024
  { date: '2024-01', borough: 'Westminster', thefts: 1250 },
  { date: '2024-01', borough: 'Camden', thefts: 520 },
  { date: '2024-01', borough: 'Islington', thefts: 420 },
  { date: '2024-01', borough: 'Kensington and Chelsea', thefts: 330 },
  { date: '2024-01', borough: 'Southwark', thefts: 300 },
  { date: '2024-01', borough: 'Lambeth', thefts: 285 },
  { date: '2024-01', borough: 'Hackney', thefts: 270 },
  { date: '2024-01', borough: 'Tower Hamlets', thefts: 250 },
  { date: '2024-01', borough: 'Newham', thefts: 200 },
  { date: '2024-01', borough: 'Hammersmith and Fulham', thefts: 175 },
  
  // February 2024
  { date: '2024-02', borough: 'Westminster', thefts: 1320 },
  { date: '2024-02', borough: 'Camden', thefts: 560 },
  { date: '2024-02', borough: 'Islington', thefts: 450 },
  { date: '2024-02', borough: 'Kensington and Chelsea', thefts: 360 },
  { date: '2024-02', borough: 'Southwark', thefts: 330 },
  { date: '2024-02', borough: 'Lambeth', thefts: 310 },
  { date: '2024-02', borough: 'Hackney', thefts: 295 },
  { date: '2024-02', borough: 'Tower Hamlets', thefts: 280 },
  { date: '2024-02', borough: 'Newham', thefts: 225 },
  { date: '2024-02', borough: 'Hammersmith and Fulham', thefts: 190 },
  
  // March 2024
  { date: '2024-03', borough: 'Westminster', thefts: 1450 },
  { date: '2024-03', borough: 'Camden', thefts: 620 },
  { date: '2024-03', borough: 'Islington', thefts: 510 },
  { date: '2024-03', borough: 'Kensington and Chelsea', thefts: 410 },
  { date: '2024-03', borough: 'Southwark', thefts: 380 },
  { date: '2024-03', borough: 'Lambeth', thefts: 350 },
  { date: '2024-03', borough: 'Hackney', thefts: 340 },
  { date: '2024-03', borough: 'Tower Hamlets', thefts: 320 },
  { date: '2024-03', borough: 'Newham', thefts: 260 },
  { date: '2024-03', borough: 'Hammersmith and Fulham', thefts: 220 },
  
  // April 2024
  { date: '2024-04', borough: 'Westminster', thefts: 1520 },
  { date: '2024-04', borough: 'Camden', thefts: 650 },
  { date: '2024-04', borough: 'Islington', thefts: 550 },
  { date: '2024-04', borough: 'Kensington and Chelsea', thefts: 440 },
  { date: '2024-04', borough: 'Southwark', thefts: 410 },
  { date: '2024-04', borough: 'Lambeth', thefts: 385 },
  { date: '2024-04', borough: 'Hackney', thefts: 370 },
  { date: '2024-04', borough: 'Tower Hamlets', thefts: 350 },
  { date: '2024-04', borough: 'Newham', thefts: 290 },
  { date: '2024-04', borough: 'Hammersmith and Fulham', thefts: 245 },
  
  // May 2024
  { date: '2024-05', borough: 'Westminster', thefts: 1620 },
  { date: '2024-05', borough: 'Camden', thefts: 700 },
  { date: '2024-05', borough: 'Islington', thefts: 600 },
  { date: '2024-05', borough: 'Kensington and Chelsea', thefts: 480 },
  { date: '2024-05', borough: 'Southwark', thefts: 450 },
  { date: '2024-05', borough: 'Lambeth', thefts: 420 },
  { date: '2024-05', borough: 'Hackney', thefts: 405 },
  { date: '2024-05', borough: 'Tower Hamlets', thefts: 385 },
  { date: '2024-05', borough: 'Newham', thefts: 320 },
  { date: '2024-05', borough: 'Hammersmith and Fulham', thefts: 270 },
  
  // June 2024
  { date: '2024-06', borough: 'Westminster', thefts: 1750 },
  { date: '2024-06', borough: 'Camden', thefts: 760 },
  { date: '2024-06', borough: 'Islington', thefts: 660 },
  { date: '2024-06', borough: 'Kensington and Chelsea', thefts: 530 },
  { date: '2024-06', borough: 'Southwark', thefts: 495 },
  { date: '2024-06', borough: 'Lambeth', thefts: 465 },
  { date: '2024-06', borough: 'Hackney', thefts: 445 },
  { date: '2024-06', borough: 'Tower Hamlets', thefts: 425 },
  { date: '2024-06', borough: 'Newham', thefts: 360 },
  { date: '2024-06', borough: 'Hammersmith and Fulham', thefts: 300 },
];

// Peak hours data (aggregated from Met Police reports)
const peakHoursData = [
  { hour: '0-4am', thefts: 180 },
  { hour: '4-8am', thefts: 320 },
  { hour: '8-12pm', thefts: 580 },
  { hour: '12-4pm', thefts: 820 },
  { hour: '4-8pm', thefts: 1240 },
  { hour: '8pm-12am', thefts: 960 },
];

export default function TimelapseMapRedesigned() {
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState(2024);
  const [viewMode, setViewMode] = useState<'london' | 'uk'>('uk');

  // Mock data for UK cities (to be replaced with DB fetch)
  const ukCityData = [
    { name: 'London', lat: 51.5074, lng: -0.1278, count: 80588 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426, count: 12450 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904, count: 9800 },
    { name: 'Leeds', lat: 53.8008, lng: -1.5491, count: 6500 },
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518, count: 5200 },
    { name: 'Liverpool', lat: 53.4084, lng: -2.9916, count: 4800 },
    { name: 'Bristol', lat: 51.4545, lng: -2.5879, count: 4100 },
    { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, count: 3900 },
    { name: 'Sheffield', lat: 53.3811, lng: -1.4701, count: 3600 },
    { name: 'Cardiff', lat: 51.4816, lng: -3.1791, count: 2800 },
  ];

  // Generate mock monthly data for current year if not available
  // In production, this would be filtered from boroughData based on selected year
  const uniqueMonths = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return `${currentYear}-${month}`;
  });
  
  const currentMonth = uniqueMonths[currentMonthIndex];
  
  // Filter borough data for the selected year (mock implementation)
  // In a real app, you'd filter the fetched data by year
  const currentYearBoroughData = boroughData.filter(d => d.date.startsWith(currentYear.toString()));
  
  // Fallback if no data for the year (e.g. future years)
  const effectiveBoroughData = currentYearBoroughData.length > 0 
    ? currentYearBoroughData 
    : boroughData.map(d => ({ ...d, date: d.date.replace('2024', currentYear.toString()) })); // Mock for demo

  const currentData = effectiveBoroughData.filter(d => d.date === currentMonth);
  const previousMonth = currentMonthIndex > 0 ? uniqueMonths[currentMonthIndex - 1] : null;
  const previousData = previousMonth 
    ? effectiveBoroughData.filter(d => d.date === previousMonth) 
    : [];
  
  const totalThefts = currentData.reduce((sum, d) => sum + d.thefts, 0);
  const previousTotal = previousData.reduce((sum, d) => sum + d.thefts, 0);
  const percentageChange = previousTotal > 0 ? ((totalThefts - previousTotal) / previousTotal) * 100 : 0;

  // Format current month display
  const currentMonthDisplay = new Date(currentMonth + '-01').toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate borough stats with trends
  const boroughStats: BoroughStats[] = currentData.map(curr => {
    const prev = previousData.find(p => p.borough === curr.borough);
    const change = prev ? ((curr.thefts - prev.thefts) / prev.thefts) * 100 : 0;
    return {
      name: curr.borough,
      thefts: curr.thefts,
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'same',
      change: Math.abs(change)
    };
  }).sort((a, b) => b.thefts - a.thefts).slice(0, 5);

  // Timeline data for chart
  const timelineData = uniqueMonths.map(month => ({
    month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short' }),
    total: effectiveBoroughData.filter(d => d.date === month).reduce((sum, d) => sum + d.thefts, 0)
  }));

  useEffect(() => {
    setMounted(true);
    // Fetch borough boundaries once
    fetch('/london-boroughs-simple.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setGeoJsonData(data))
      .catch(err => {
        console.error('Failed to load borough boundaries', err);
        setMapError('Failed to load map data');
      });
  }, []);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;

    const initMap = async () => {
      try {
        if (!L) {
          L = (await import('leaflet')).default;
        }

        if (!mapRef.current) {
          const map = L.map('timelapse-map-redesigned', {
            center: [54.5, -4.0], // UK Center
            zoom: 6,
            minZoom: 5,
            maxZoom: 12,
            zoomControl: true,
            scrollWheelZoom: true,
          });

          // Dark tile layer
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            maxZoom: 12
          }).addTo(map);

          mapRef.current = map;
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        mapRef.current = null;
      }
    };
  }, [mounted]);

  // Handle View Mode Change (UK vs London)
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (viewMode === 'london') {
      mapRef.current.setView([51.5074, -0.1278], 10);
    } else {
      mapRef.current.setView([54.5, -4.0], 6);
    }
  }, [viewMode]);

  // Update Map Layers
  useEffect(() => {
    if (!mapRef.current || !L || !mounted) return;

    // Clear existing layers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.GeoJSON || layer instanceof L.CircleMarker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (viewMode === 'london' && geoJsonData) {
      // Render London Choropleth
      const getColor = (thefts: number) => {
        return thefts > 1500 ? '#b91c1c' :
               thefts > 1000 ? '#dc2626' :
               thefts > 600 ? '#ef4444' :
               thefts > 400 ? '#f87171' :
               thefts > 200 ? '#fca5a5' :
                              '#fecaca';
      };

      const style = (feature: any) => {
        const boroughName = feature.properties.name;
        const boroughInfo = currentData.find(d => d.borough === boroughName);
        const thefts = boroughInfo?.thefts || 0;

        return {
          fillColor: getColor(thefts),
          weight: selectedBorough === boroughName ? 3 : 1.5,
          opacity: 1,
          color: selectedBorough === boroughName ? '#fbbf24' : '#ffffff',
          fillOpacity: 0.7
        };
      };

      L.geoJSON(geoJsonData, {
        style: style,
        onEachFeature: (feature: any, layer: any) => {
          const boroughName = feature.properties.name;
          const boroughInfo = currentData.find(d => d.borough === boroughName);
          const thefts = boroughInfo?.thefts || 0;

          layer.bindPopup(`
            <div style="color: #1f2937;">
              <strong style="font-size: 16px;">${boroughName}</strong><br/>
              <span style="font-size: 14px; color: #dc2626; font-weight: bold;">${thefts.toLocaleString()}</span> thefts in ${currentMonthDisplay}
            </div>
          `);

          layer.on({
            mouseover: (e: any) => {
              layer.setStyle({ weight: 3, color: '#fbbf24', fillOpacity: 0.9 });
              layer.openPopup();
            },
            mouseout: (e: any) => {
              // Reset style logic needs the layer reference or original style function
              // Simplified reset:
              layer.setStyle({ weight: selectedBorough === boroughName ? 3 : 1.5, color: selectedBorough === boroughName ? '#fbbf24' : '#ffffff', fillOpacity: 0.7 });
            },
            click: () => setSelectedBorough(boroughName)
          });
        }
      }).addTo(mapRef.current);
    } else {
      // Render UK City Markers
      ukCityData.forEach(city => {
        const radius = Math.sqrt(city.count) / 5; // Scale radius based on count
        const color = city.count > 10000 ? '#b91c1c' : city.count > 5000 ? '#ef4444' : '#fca5a5';
        
        L.circleMarker([city.lat, city.lng], {
          radius: Math.max(radius, 5), // Min radius 5
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapRef.current!)
          .bindPopup(`
            <div style="color: #1f2937;">
              <strong style="font-size: 16px;">${city.name}</strong><br/>
              <span style="font-size: 14px; color: #dc2626; font-weight: bold;">${city.count.toLocaleString()}</span> est. annual thefts
            </div>
          `);
      });
    }
  }, [currentMonth, currentData, selectedBorough, currentMonthDisplay, mounted, geoJsonData, viewMode]);

  // Auto-play timelapse
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentMonthIndex(prev => {
        if (prev >= uniqueMonths.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, uniqueMonths.length]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentMonthIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentMonthIndex(prev => Math.min(uniqueMonths.length - 1, prev + 1));
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

  // Show error if map failed to load
  if (mapError) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
        <div className="text-red-600 text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-900 mb-2">Map Loading Error</h3>
        <p className="text-red-700 mb-4">{mapError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with current period */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-3xl font-bold">{currentMonthDisplay}</h2>
              <select 
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="bg-white/20 border border-white/30 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="2023" className="text-black">2023</option>
                <option value="2024" className="text-black">2024</option>
                <option value="2025" className="text-black">2025</option>
              </select>
            </div>
            <p className="text-red-100">
              <span className="text-4xl font-bold">{totalThefts.toLocaleString()}</span> total thefts
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* View Toggle */}
            <div className="bg-white/10 p-1 rounded-lg flex gap-1 self-start">
              <button 
                onClick={() => setViewMode('uk')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'uk' ? 'bg-white text-red-600' : 'text-white hover:bg-white/10'}`}
              >
                UK View
              </button>
              <button 
                onClick={() => setViewMode('london')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'london' ? 'bg-white text-red-600' : 'text-white hover:bg-white/10'}`}
              >
                London
              </button>
            </div>

            {previousTotal > 0 && (
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-1">
                  {percentageChange > 0 ? (
                    <TrendingUp className="h-6 w-6" />
                  ) : percentageChange < 0 ? (
                    <TrendingDown className="h-6 w-6" />
                  ) : (
                    <Minus className="h-6 w-6" />
                  )}
                  <span className="text-2xl font-bold">
                    {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-red-100">vs. previous month</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content: Map + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map (Left side - 2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-neutral-900">
              London Borough Theft Density
            </h3>
            <div className="relative">
              <div 
                id="timelapse-map-redesigned" 
                className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg shadow-inner border-2 border-neutral-200 bg-neutral-900"
                role="application"
                aria-label="Interactive borough-level theft density map"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 bg-opacity-75 rounded-lg">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading map...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Legend:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-[#b91c1c]"></div>
                  <span>1500+</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-[#ef4444]"></div>
                  <span>600-1500</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-[#fca5a5]"></div>
                  <span>200-600</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-[#fecaca]"></div>
                  <span>&lt;200</span>
                </div>
              </div>
              <span className="text-neutral-500">🔒 Aggregated borough data - no residential addresses</span>
            </div>
          </div>
        </div>

        {/* Analytics (Right side - 1/3 width on large screens) */}
        <div className="space-y-4">
          {/* Top 5 Boroughs */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3 text-neutral-900">Top 5 Boroughs</h3>
            <div className="space-y-2">
              {boroughStats.map((borough, index) => (
                <div 
                  key={borough.name}
                  className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded cursor-pointer"
                  onClick={() => setSelectedBorough(borough.name)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-500 w-5">{index + 1}.</span>
                    <span className="font-medium text-sm">{borough.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">{borough.thefts.toLocaleString()}</span>
                    {borough.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-red-600" title={`+${borough.change.toFixed(0)}%`} />
                    )}
                    {borough.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-green-600" title={`-${borough.change.toFixed(0)}%`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-blue-900">💡 Key Insights</h3>
            <ul className="space-y-2 text-xs text-blue-800">
              <li>• Westminster accounts for {((boroughStats[0]?.thefts / totalThefts) * 100).toFixed(0)}% of all thefts</li>
              <li>• Top 5 boroughs represent {((boroughStats.reduce((sum, b) => sum + b.thefts, 0) / totalThefts) * 100).toFixed(0)}% of total</li>
              <li>• {boroughStats.filter(b => b.trend === 'up').length} of top 5 showing increase</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Theft Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">Peak Hours Analysis</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="thefts" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-neutral-600 mt-2">
          ⚠️ <strong>Highest risk:</strong> 4pm-8pm evening commute period
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <button
              onClick={handlePrevious}
              disabled={currentMonthIndex === 0}
              className="p-2 md:p-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous month"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={handlePlay}
              className="p-3 md:p-3.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>

            <button
              onClick={handleNext}
              disabled={currentMonthIndex === uniqueMonths.length - 1}
              className="p-2 md:p-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              aria-valuemin={0}
              aria-valuemax={uniqueMonths.length - 1}
              aria-valuenow={currentMonthIndex}
              aria-valuetext={currentMonthDisplay}
            />
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <label htmlFor="speed-select" className="text-sm font-medium text-neutral-700">
              Speed:
            </label>
            <select
              id="speed-select"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-neutral-300 rounded-md text-sm"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
