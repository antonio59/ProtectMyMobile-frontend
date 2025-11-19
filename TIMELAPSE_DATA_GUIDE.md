# Timelapse Data Guide (Updated 2024)

> **Note:** This guide reflects the updated UK-wide data strategy implemented in November 2024.

## 📊 Data Sources

### 1. UK National Statistics
- **Source:** Office for National Statistics (ONS) Crime Survey 2024.
- **Key Metric:** "Theft from the person" (Snatch thefts).
- **Usage:** Used for the UK-wide view in `UKStatistics.tsx` and the national map markers.

### 2. London Borough Data
- **Source:** Metropolitan Police Service Year-End Report 2024.
- **Key Metrics:**
  - Total Thefts: **117,211**
  - Top Borough: **Westminster** (34,039)
- **Usage:** Used for the London drill-down choropleth map in `TimelapseMapFinal.tsx`.

### 3. Regional Estimates
- **Locations:** Manchester, Birmingham, Leeds, etc.
- **Source:** Local police force reports (GMP, West Midlands Police) and BBC News analysis.
- **Usage:** Used to populate major city markers on the UK map.

---

## 🗺️ Map Data Structure

### GeoJSON (Borough Boundaries)
- **File:** `public/london-boroughs-simple.json`
- **Format:** Simplified GeoJSON polygons for London boroughs.
- **Optimized:** Vertex count reduced for faster rendering.

### Component Data (`src/components/TimelapseMapFinal.tsx`)

**UK City Data Array:**
```typescript
interface RegionData {
  name: string;       // e.g., "London", "Manchester"
  lat: number;        // Latitude
  lng: number;        // Longitude
  annualThefts: number; // Total annual count
  riskLevel: 'High' | 'Medium' | 'Low';
}
```

**London Borough Data Array:**
```typescript
{ 
  name: 'Westminster', 
  annualThefts: 34039, 
  trend: +48 // Percent increase
}
```

---

## 🔄 How to Update Data

1. **Annual Updates:**
   - Update the `annualThefts` values in `src/components/TimelapseMapFinal.tsx`.
   - Update the statistics in `src/components/UKStatistics.tsx`.

2. **Adding New Regions:**
   - Add a new object to the `ukCityData` array with coordinates and risk level.

3. **Refining Boundaries:**
   - Replace `public/london-boroughs-simple.json` with a new GeoJSON file if boundaries change (unlikely).

---

## 🔒 Privacy & Security

- **Aggregation:** All data is aggregated at the Borough or City level.
- **No PII:** No individual addresses or specific incident coordinates are stored or displayed.
- **Zoom Limits:** Map prevents zooming in to street level to protect privacy.
