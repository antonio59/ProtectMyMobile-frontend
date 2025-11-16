# Timelapse Data Management Guide

## 📊 Data Structure Required

The timelapse feature needs data in this format:

```json
{
  "date": "2024-01",
  "borough": "Westminster",
  "lat": 51.4975,
  "lng": -0.1357,
  "thefts": 580
}
```

### Fields:
- **date** (string): `YYYY-MM` format (e.g., "2024-01")
- **borough** (string): London borough name
- **lat** (number): Latitude coordinate
- **lng** (number): Longitude coordinate
- **thefts** (number): Total theft count for that month/borough

## 🗄️ Supabase Database Setup

### 1. Create Table

```sql
CREATE TABLE timelapse_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  borough TEXT NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  thefts INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, borough)
);

-- Index for fast queries
CREATE INDEX idx_timelapse_date ON timelapse_data(date);
CREATE INDEX idx_timelapse_borough ON timelapse_data(borough);

-- Enable Row Level Security
ALTER TABLE timelapse_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for displaying map)
CREATE POLICY "Public read access" ON timelapse_data
  FOR SELECT USING (true);

-- Admin only insert/update (you'll need to set up admin role)
CREATE POLICY "Admin insert access" ON timelapse_data
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin update access" ON timelapse_data
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### 2. Borough Coordinates Reference

```json
{
  "Westminster": {"lat": 51.4975, "lng": -0.1357},
  "Camden": {"lat": 51.5290, "lng": -0.1255},
  "Islington": {"lat": 51.5416, "lng": -0.1022},
  "Kensington and Chelsea": {"lat": 51.4991, "lng": -0.1938},
  "Southwark": {"lat": 51.5030, "lng": -0.0900},
  "Lambeth": {"lat": 51.4570, "lng": -0.1231},
  "Hackney": {"lat": 51.5450, "lng": -0.0553},
  "Tower Hamlets": {"lat": 51.5099, "lng": -0.0059},
  "Newham": {"lat": 51.5255, "lng": 0.0352},
  "Hammersmith and Fulham": {"lat": 51.4927, "lng": -0.2339},
  "Barnet": {"lat": 51.6252, "lng": -0.1517},
  "Brent": {"lat": 51.5673, "lng": -0.2711},
  "Croydon": {"lat": 51.3714, "lng": -0.0977},
  "Greenwich": {"lat": 51.4892, "lng": 0.0648},
  "Lewisham": {"lat": 51.4415, "lng": -0.0117},
  "Wandsworth": {"lat": 51.4571, "lng": -0.1909}
}
```

## 📥 Getting Met Police Data

### Method 1: Freedom of Information (FOI) Request

Submit request to: foi.requests@met.police.uk

**Template:**
```
Subject: FOI Request - Mobile Phone Theft Data by Borough

Dear Met Police FOI Team,

Under the Freedom of Information Act 2000, I request the following information:

1. Monthly count of mobile phone thefts by London borough
2. Time period: [Start Date] to [End Date]
3. Format: CSV or Excel preferred
4. Fields needed:
   - Month/Year
   - Borough name
   - Number of mobile phone theft offences

Please provide this data in a machine-readable format.

Thank you,
[Your Name]
```

### Method 2: Police.uk API

```bash
# Example API call for theft data
curl "https://data.police.uk/api/crimes-street/all-crime?lat=51.5074&lng=-0.1278&date=2024-01"
```

Note: Police.uk API provides point-level data, you'll need to aggregate by borough.

### Method 3: London Datastore

Visit: https://data.london.gov.uk/
Search: "mobile phone theft" or "robbery"

## 📤 Data Upload Methods

### Option 1: Admin Panel Upload (Recommended)

We'll create an admin interface at `/admin/timelapse-upload` where you can:
1. Upload CSV file
2. Preview data
3. Validate format
4. Bulk insert to Supabase

### Option 2: Direct CSV Upload Script

```javascript
// scripts/upload-timelapse-data.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';

const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service key for admin access
);

async function uploadCSV(filePath) {
  const csvData = fs.readFileSync(filePath, 'utf-8');
  
  Papa.parse(csvData, {
    header: true,
    complete: async (results) => {
      const formattedData = results.data.map(row => ({
        date: row.date,
        borough: row.borough,
        lat: parseFloat(row.lat),
        lng: parseFloat(row.lng),
        thefts: parseInt(row.thefts)
      }));
      
      const { data, error } = await supabase
        .from('timelapse_data')
        .upsert(formattedData, { onConflict: 'date,borough' });
      
      if (error) {
        console.error('Error uploading:', error);
      } else {
        console.log(`✅ Uploaded ${formattedData.length} records`);
      }
    }
  });
}

// Usage: node scripts/upload-timelapse-data.js path/to/data.csv
uploadCSV(process.argv[2]);
```

### Option 3: Manual Supabase Dashboard

1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Select `timelapse_data` table
4. Click "Insert" → "Import from CSV"
5. Upload your CSV file

## 📋 CSV Format Example

```csv
date,borough,lat,lng,thefts
2024-01,Westminster,51.4975,-0.1357,580
2024-01,Camden,51.5290,-0.1255,245
2024-01,Islington,51.5416,-0.1022,198
2024-02,Westminster,51.4975,-0.1357,612
2024-02,Camden,51.5290,-0.1255,268
```

## 🔄 Updating the Timelapse Component

Once data is in Supabase, update `TimelapseMap.tsx`:

```typescript
// Replace sample data with Supabase fetch
useEffect(() => {
  async function fetchData() {
    const { data, error } = await supabase
      .from('timelapse_data')
      .select('*')
      .order('date', { ascending: true });
    
    if (data) {
      setSampleData(data);
    }
  }
  
  fetchData();
}, []);
```

## 🔐 Security Considerations

1. **Service Key**: Store `SUPABASE_SERVICE_KEY` in `.env` (never commit!)
2. **RLS Policies**: Ensure only authenticated admins can insert/update
3. **Validation**: Always validate data format before uploading
4. **Backups**: Keep CSV backups of all uploaded data

## 📅 Recommended Update Schedule

- **Monthly**: Upload new theft data from Met Police
- **Quarterly**: Review and clean historical data
- **Annually**: Request full year FOI data for accuracy

## 🆘 Troubleshooting

**Issue**: Duplicate entries
- **Solution**: Use `upsert` with `onConflict: 'date,borough'`

**Issue**: Missing coordinates
- **Solution**: Use borough coordinates reference above

**Issue**: Date format errors
- **Solution**: Ensure YYYY-MM format (e.g., "2024-01" not "01/2024")

