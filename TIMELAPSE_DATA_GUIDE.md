# Timelapse Data Management Guide

This guide explains how to maintain and update the UK Theft Hotspots Timelapse data.

## Data Structure

Data is stored in the Supabase `theft_data_points` table:

- **date**: `YYYY-MM-01` (e.g., 2024-01-01)
- **location_name**: City name (e.g., "Manchester") or Borough name (e.g., "Westminster")
- **latitude**: Decimal coordinates
- **longitude**: Decimal coordinates
- **theft_count**: Total reported thefts for that month
- **data_source**: Identifier (e.g., "police_uk_api", "met_police", "simulated")

## Updating Data

### 1. Automated Seeding (Simulated)
We have an admin API endpoint to seed simulated data for testing or filling gaps.
- Endpoint: `/api/admin/seed-stats`
- Method: `GET`
- Requirement: `SUPABASE_SERVICE_ROLE_KEY` environment variable must be set.

### 2. Future: Real Data Ingestion
To import real police data (Police.uk API), follow these steps:

1. **Fetch Data**: Use the Police UK API to get crime data for specific lat/lng.
   - Category: `theft-from-the-person`
2. **Aggregate**: Group incidents by City/Borough and Month.
3. **Upload**: Insert into `theft_data_points` via a script or Supabase dashboard.

Example SQL for insertion:
```sql
INSERT INTO theft_data_points (date, location_name, latitude, longitude, theft_count, data_source)
VALUES ('2025-01-01', 'Bristol', 51.4545, -2.5879, 420, 'police_uk_api');
```

## Component Configuration

The `TimelapseMapRedesigned` component automatically handles:
- **Year Switching**: Filters data by the selected year.
- **View Modes**: Toggles between "UK National" (Cities) and "London" (Boroughs).
- **Data Fetching**: Currently uses a mix of mock data arrays. To switch to full DB fetching:
  1. Uncomment the Supabase fetch logic in `useEffect`.
  2. Replace the `ukCityData` and `boroughData` arrays with the fetched state.

## Year-on-Year Analysis

To enable Year-on-Year comparison:
1. Ensure data exists for previous years (e.g., 2023).
2. The component calculates `% change` automatically if `previousTotal > 0`.
