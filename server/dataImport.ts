import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { User, LawyerProfile } from '@shared/schema';

const SPREADSHEET_ID = '1fXRVZM5CMEF9g_g4fc0CWlCgFqNjYkvCBF3pmdGTIKc';
const SHEET_NAME = 'Lawyers';  // Replace with the actual sheet name if different

// Function to fetch data from Google Sheets and save it to our local JSON file
export async function fetchLawyerDataFromGoogleSheets() {
  try {
    // Using the Google Sheets API to get the data in CSV format
    // This public access method doesn't require authentication for publicly shared sheets
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    
    const response = await axios.get(url);
    console.log('Fetched data from Google Sheets');
    
    // Process the CSV data
    // For now, we'll just log the data
    console.log(response.data);
    
    // In a real implementation, you would parse this CSV and convert to your data structure
    // For now, we'll use our existing JSON file
    return { success: true, message: 'Data fetched successfully' };
  } catch (error) {
    console.error('Error fetching lawyer data from Google Sheets:', error);
    return { success: false, message: 'Failed to fetch data' };
  }
}

// Function to read lawyer data from our local JSON file
export async function loadLawyerData(): Promise<{ users: User[], lawyerProfiles: LawyerProfile[] }> {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'lawyers.json');
    const exists = await fs.pathExists(dataPath);
    
    if (!exists) {
      console.log('Lawyers data file not found');
      return { users: [], lawyerProfiles: [] };
    }
    
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const lawyersData = JSON.parse(rawData);
    
    // Extract users and profiles from the combined data
    const users: User[] = lawyersData.map((item: any) => {
      const { profile, ...user } = item;
      return user;
    });
    
    const lawyerProfiles: LawyerProfile[] = lawyersData.map((item: any) => item.profile);
    
    console.log(`Loaded ${users.length} lawyers from data file`);
    return { users, lawyerProfiles };
  } catch (error) {
    console.error('Error loading lawyer data:', error);
    return { users: [], lawyerProfiles: [] };
  }
}

// In the future, add function to convert from Google Sheets format to our data structure