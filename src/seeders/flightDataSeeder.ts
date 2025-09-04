import axios from 'axios';
import { Airline } from '../models/flight/airline.model';
import { Airport } from '../models/flight/airport.model';
import { config } from '../config';

// Parse CSV data
const parseCSV = (csvText: string, hasHeader = false): string[][] => {
  const lines = csvText.trim().split('\n');
  if (hasHeader) lines.shift(); // Remove header row
  
  return lines.map(line => {
    // Simple CSV parsing - handles quoted fields
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/"/g, ''));
    return result;
  });
};

// Seed airlines data from OpenFlights
export const seedAirlines = async (): Promise<void> => {
  try {
    console.log('🛫 Starting airlines data seeding...');
    
    // Check if airlines already exist
    const existingCount = await Airline.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Airlines already seeded: ${existingCount} records found`);
      return;
    }

    // Fetch airlines data from OpenFlights
    const response = await axios.get(config.openflights.airlinesUrl, {
      timeout: 30000,
    });
    
    const airlinesRows = parseCSV(response.data);
    console.log(`📥 Fetched ${airlinesRows.length} airline records`);

    const airlines = [];
    let validCount = 0;
    let skippedCount = 0;

    for (const row of airlinesRows) {
      // Skip invalid rows
      if (!row[1] || row[1] === '\\N' || row[7] !== 'Y') {
        skippedCount++;
        continue;
      }

      const airline = {
        airline_id: row[0] || '',
        airline_name: row[1] || '',
        alias: row[2] && row[2] !== '\\N' ? row[2] : undefined,
        iata_code: row[3] && row[3] !== '\\N' ? row[3] : undefined,
        icao_code: row[4] && row[4] !== '\\N' ? row[4] : undefined,
        callsign: row[5] && row[5] !== '\\N' ? row[5] : undefined,
        country_name: row[6] || '',
        country_iso2: row[6] === 'United States' ? 'US' : undefined,
        active: row[7] === 'Y',
        status: 'active',
        type: 'airline',
        isUSAirline: row[6] === 'United States',
      };

      airlines.push(airline);
      validCount++;

      // Insert in batches of 1000
      if (airlines.length === 1000) {
        await Airline.insertMany(airlines, { ordered: false });
        console.log(`✅ Inserted batch of ${airlines.length} airlines`);
        airlines.length = 0; // Clear array
      }
    }

    // Insert remaining records
    if (airlines.length > 0) {
      await Airline.insertMany(airlines, { ordered: false });
      console.log(`✅ Inserted final batch of ${airlines.length} airlines`);
    }

    console.log(`🎉 Airlines seeding completed!`);
    console.log(`   Valid records: ${validCount}`);
    console.log(`   Skipped records: ${skippedCount}`);
    
  } catch (error: any) {
    console.error('❌ Airlines seeding failed:', error.message);
    throw error;
  }
};

// Seed airports data from OpenFlights
export const seedAirports = async (): Promise<void> => {
  try {
    console.log('🛬 Starting airports data seeding...');
    
    // Check if airports already exist
    const existingCount = await Airport.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Airports already seeded: ${existingCount} records found`);
      return;
    }

    // Fetch airports data from OpenFlights
    const response = await axios.get(config.openflights.airportsUrl, {
      timeout: 30000,
    });
    
    const airportsRows = parseCSV(response.data);
    console.log(`📥 Fetched ${airportsRows.length} airport records`);

    const airports = [];
    let validCount = 0;
    let skippedCount = 0;

    for (const row of airportsRows) {
      // Skip invalid rows (must have name and coordinates)
      if (!row[1] || row[1] === '\\N' || !row[6] || !row[7]) {
        skippedCount++;
        continue;
      }

      const latitude = parseFloat(row[6]);
      const longitude = parseFloat(row[7]);
      
      // Skip invalid coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        skippedCount++;
        continue;
      }

      const airport = {
        airport_id: row[0] || '',
        airport_name: row[1] || '',
        city: row[2] || '',
        country_name: row[3] || '',
        country_iso2: row[3] === 'United States' ? 'US' : undefined,
        iata_code: row[4] && row[4] !== '\\N' ? row[4] : undefined,
        icao_code: row[5] && row[5] !== '\\N' ? row[5] : undefined,
        latitude,
        longitude,
        altitude: parseFloat(row[8]) || 0,
        timezone: parseFloat(row[9]) || 0,
        dst: row[10] || 'U',
        tz: row[11] && row[11] !== '\\N' ? row[11] : 'UTC',
        type: row[12] || 'airport',
        source: row[13] || 'OpenFlights',
        isUSAirport: row[3] === 'United States',
      };

      airports.push(airport);
      validCount++;

      // Insert in batches of 1000
      if (airports.length === 1000) {
        await Airport.insertMany(airports, { ordered: false });
        console.log(`✅ Inserted batch of ${airports.length} airports`);
        airports.length = 0; // Clear array
      }
    }

    // Insert remaining records
    if (airports.length > 0) {
      await Airport.insertMany(airports, { ordered: false });
      console.log(`✅ Inserted final batch of ${airports.length} airports`);
    }

    console.log(`🎉 Airports seeding completed!`);
    console.log(`   Valid records: ${validCount}`);
    console.log(`   Skipped records: ${skippedCount}`);
    
  } catch (error: any) {
    console.error('❌ Airports seeding failed:', error.message);
    throw error;
  }
};

// Seed both airlines and airports
export const seedFlightData = async (): Promise<void> => {
  try {
    console.log('🚀 Starting flight data seeding...');
    
    await seedAirlines();
    await seedAirports();
    
    // Create indexes
    console.log('📝 Creating database indexes...');
    await Airline.createIndexes();
    await Airport.createIndexes();
    
    console.log('🎉 Flight data seeding completed successfully!');
    
    // Show statistics
    const airlineCount = await Airline.countDocuments();
    const airportCount = await Airport.countDocuments();
    const usAirlineCount = await Airline.countDocuments({ isUSAirline: true });
    const usAirportCount = await Airport.countDocuments({ isUSAirport: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Total Airlines: ${airlineCount}`);
    console.log(`   US Airlines: ${usAirlineCount}`);
    console.log(`   Total Airports: ${airportCount}`);
    console.log(`   US Airports: ${usAirportCount}`);
    
  } catch (error: any) {
    console.error('❌ Flight data seeding failed:', error.message);
    throw error;
  }
};

// Export individual functions for selective seeding
export default {
  seedAirlines,
  seedAirports,
  seedFlightData,
};