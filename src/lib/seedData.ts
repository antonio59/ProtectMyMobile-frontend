import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for admin tasks
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for seed script. Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Realistic data patterns
const CITIES = [
  { name: 'Manchester', lat: 53.4808, lng: -2.2426, risk: 'High' },
  { name: 'Birmingham', lat: 52.4862, lng: -1.8904, risk: 'High' },
  { name: 'Leeds', lat: 53.8008, lng: -1.5491, risk: 'Medium' },
  { name: 'Glasgow', lat: 55.8642, lng: -4.2518, risk: 'Medium' },
  { name: 'Liverpool', lat: 53.4084, lng: -2.9916, risk: 'Medium' },
  { name: 'Bristol', lat: 51.4545, lng: -2.5879, risk: 'Medium' },
  { name: 'Sheffield', lat: 53.3811, lng: -1.4701, risk: 'Medium' },
  { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, risk: 'Medium' },
  { name: 'Cardiff', lat: 51.4816, lng: -3.1791, risk: 'Low' },
  { name: 'Leicester', lat: 52.6369, lng: -1.1398, risk: 'Low' },
];

const LONDON_BOROUGHS = [
  { name: 'Westminster', lat: 51.4975, lng: -0.1357, risk: 'Very High' },
  { name: 'Camden', lat: 51.5290, lng: -0.1255, risk: 'High' },
  { name: 'Kensington and Chelsea', lat: 51.5020, lng: -0.1947, risk: 'High' },
  { name: 'Islington', lat: 51.5416, lng: -0.1022, risk: 'High' },
  { name: 'Hackney', lat: 51.5450, lng: -0.0553, risk: 'High' },
  { name: 'Tower Hamlets', lat: 51.5099, lng: -0.0059, risk: 'High' },
  { name: 'Lambeth', lat: 51.4607, lng: -0.1163, risk: 'High' },
  { name: 'Southwark', lat: 51.4834, lng: -0.0821, risk: 'High' },
  { name: 'Newham', lat: 51.5077, lng: 0.0469, risk: 'Medium' },
  { name: 'Haringey', lat: 51.5390, lng: -0.1022, risk: 'Medium' },
];

const MONTHS = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

function generateCount(baseRisk: string) {
  let base = 50;
  if (baseRisk === 'Low') base = 100;
  if (baseRisk === 'Medium') base = 300;
  if (baseRisk === 'High') base = 600;
  if (baseRisk === 'Very High') base = 1200;
  
  // Add randomness + seasonal variation (higher in summer/December)
  const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
  return Math.round(base * randomFactor);
}

async function seedData() {
  console.log('Starting data seed...');
  
  const dataPoints = [];

  // Generate data for UK Cities
  for (const city of CITIES) {
    for (const month of MONTHS) {
      // Seasonal multiplier
      let seasonalMult = 1;
      if (month.endsWith('07') || month.endsWith('08') || month.endsWith('12')) seasonalMult = 1.2;
      
      const count = Math.round(generateCount(city.risk) * seasonalMult);
      
      dataPoints.push({
        date: `${month}-01`,
        location_name: city.name,
        latitude: city.lat,
        longitude: city.lng,
        theft_count: count,
        data_source: 'simulated_police_data'
      });
    }
  }

  // Generate data for London Boroughs
  for (const borough of LONDON_BOROUGHS) {
    for (const month of MONTHS) {
      let seasonalMult = 1;
      if (month.endsWith('07') || month.endsWith('08') || month.endsWith('12')) seasonalMult = 1.25;

      const count = Math.round(generateCount(borough.risk) * seasonalMult);

      dataPoints.push({
        date: `${month}-01`,
        location_name: borough.name,
        latitude: borough.lat,
        longitude: borough.lng,
        theft_count: count,
        data_source: 'simulated_met_data'
      });
    }
  }

  // Insert in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < dataPoints.length; i += BATCH_SIZE) {
    const batch = dataPoints.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('theft_data_points').upsert(batch, { onConflict: 'date,location_name,data_source' });
    
    if (error) {
      console.error('Error inserting batch:', error);
    } else {
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}`);
    }
  }

  console.log('Seed complete!');
}

// To run this: tsx src/scripts/seedData.ts (requires tsx or similar runner)
// For now, we'll just export it to be called by an API route if needed
export const runSeed = seedData;
