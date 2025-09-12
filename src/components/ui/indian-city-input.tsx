'use client';

import React, { useState, useEffect } from 'react';
import { SearchableDropdown } from './searchable-dropdown';

// List of all Indian states
export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep',
  'Ladakh',
  'Puducherry',
  'Other'
];

// Map cities to their states
const cityToState: Record<string, string> = {
  // Union Territories
  'Delhi': 'Delhi',
  'New Delhi': 'Delhi',
  'Chandigarh': 'Union Territory',
  'Puducherry': 'Union Territory',
  'Port Blair': 'Union Territory',
  'Jammu': 'Jammu and Kashmir',
  
  // Andhra Pradesh
  'Visakhapatnam': 'Andhra Pradesh',
  'Vijayawada': 'Andhra Pradesh',
  'Guntur': 'Andhra Pradesh',
  'Tirupati': 'Andhra Pradesh',
  'Kakinada': 'Andhra Pradesh',
  'Rajahmundry': 'Andhra Pradesh',
  
  // Arunachal Pradesh
  'Itanagar': 'Arunachal Pradesh',
  'Naharlagun': 'Arunachal Pradesh',
  
  // Assam
  'Guwahati': 'Assam',
  'Silchar': 'Assam',
  'Dibrugarh': 'Assam',
  'Jorhat': 'Assam',
  'Nagaon': 'Assam',
  
  // Bihar
  'Patna': 'Bihar',
  'Gaya': 'Bihar',
  'Muzaffarpur': 'Bihar',
  'Bhagalpur': 'Bihar',
  'Darbhanga': 'Bihar',
  
  // Chhattisgarh
  'Raipur': 'Chhattisgarh',
  'Bhilai': 'Chhattisgarh',
  'Bilaspur': 'Chhattisgarh',
  'Korba': 'Chhattisgarh',
  
  // Goa
  'Panaji': 'Goa',
  'Margao': 'Goa',
  'Vasco da Gama': 'Goa',
  'Mapusa': 'Goa',
  
  // Gujarat
  'Ahmedabad': 'Gujarat',
  'Surat': 'Gujarat',
  'Vadodara': 'Gujarat',
  'Rajkot': 'Gujarat',
  'Gandhinagar': 'Gujarat',
  'Bhavnagar': 'Gujarat',
  'Jamnagar': 'Gujarat',
  
  // Haryana
  'Gurugram': 'Haryana',
  'Faridabad': 'Haryana',
  'Hisar': 'Haryana',
  'Rohtak': 'Haryana',
  'Panipat': 'Haryana',
  'Ambala': 'Haryana',
  'Karnal': 'Haryana',
  'Panchkula': 'Haryana',
  'Zirakpur': 'Haryana',
  
  // Himachal Pradesh
  'Shimla': 'Himachal Pradesh',
  'Dharamshala': 'Himachal Pradesh',
  'Solan': 'Himachal Pradesh',
  'Kullu': 'Himachal Pradesh',
  'Manali': 'Himachal Pradesh',
  'Mandi': 'Himachal Pradesh',
  
  // Jharkhand
  'Ranchi': 'Jharkhand',
  'Jamshedpur': 'Jharkhand',
  'Dhanbad': 'Jharkhand',
  'Bokaro': 'Jharkhand',
  'Hazaribagh': 'Jharkhand',
  
  // Karnataka
  'Bengaluru': 'Karnataka',
  'Mysuru': 'Karnataka',
  'Mangaluru': 'Karnataka',
  'Hubballi-Dharwad': 'Karnataka',
  'Belagavi': 'Karnataka',
  'Udupi': 'Karnataka',
  
  // Kerala
  'Thiruvananthapuram': 'Kerala',
  'Kochi': 'Kerala',
  'Kozhikode': 'Kerala',
  'Thrissur': 'Kerala',
  'Kollam': 'Kerala',
  'Palakkad': 'Kerala',
  
  // Madhya Pradesh
  'Bhopal': 'Madhya Pradesh',
  'Indore': 'Madhya Pradesh',
  'Jabalpur': 'Madhya Pradesh',
  'Gwalior': 'Madhya Pradesh',
  'Ujjain': 'Madhya Pradesh',
  'Sagar': 'Madhya Pradesh',
  
  // Maharashtra
  'Mumbai': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Nagpur': 'Maharashtra',
  'Nashik': 'Maharashtra',
  'Aurangabad': 'Maharashtra',
  'Thane': 'Maharashtra',
  'Navi Mumbai': 'Maharashtra',
  'Solapur': 'Maharashtra',
  
  // Manipur
  'Imphal': 'Manipur',
  
  // Meghalaya
  'Shillong': 'Meghalaya',
  
  // Mizoram
  'Aizawl': 'Mizoram',
  
  // Nagaland
  'Kohima': 'Nagaland',
  'Dimapur': 'Nagaland',
  
  // Odisha
  'Bhubaneswar': 'Odisha',
  'Cuttack': 'Odisha',
  'Rourkela': 'Odisha',
  'Berhampur': 'Odisha',
  'Sambalpur': 'Odisha',
  
  // Punjab
  'Ludhiana': 'Punjab',
  'Amritsar': 'Punjab',
  'Jalandhar': 'Punjab',
  'Patiala': 'Punjab',
  'Mohali': 'Punjab',
  'Bathinda': 'Punjab',
  
  // Rajasthan
  'Jaipur': 'Rajasthan',
  'Jodhpur': 'Rajasthan',
  'Udaipur': 'Rajasthan',
  'Kota': 'Rajasthan',
  'Ajmer': 'Rajasthan',
  'Bikaner': 'Rajasthan',
  'Pushkar': 'Rajasthan',
  
  // Sikkim
  'Gangtok': 'Sikkim',
  
  // Tamil Nadu
  'Chennai': 'Tamil Nadu',
  'Coimbatore': 'Tamil Nadu',
  'Madurai': 'Tamil Nadu',
  'Tiruchirappalli': 'Tamil Nadu',
  'Salem': 'Tamil Nadu',
  'Vellore': 'Tamil Nadu',
  'Thoothukudi': 'Tamil Nadu',
  'Erode': 'Tamil Nadu',
  
  // Telangana
  'Hyderabad': 'Telangana',
  'Warangal': 'Telangana',
  'Nizamabad': 'Telangana',
  'Karimnagar': 'Telangana',
  'Khammam': 'Telangana',
  
  // Tripura
  'Agartala': 'Tripura',
  
  // Uttar Pradesh
  'Lucknow': 'Uttar Pradesh',
  'Kanpur': 'Uttar Pradesh',
  'Agra': 'Uttar Pradesh',
  'Varanasi': 'Uttar Pradesh',
  'Prayagraj': 'Uttar Pradesh',
  'Ghaziabad': 'Uttar Pradesh',
  'Noida': 'Uttar Pradesh',
  'Greater Noida': 'Uttar Pradesh',
  'Meerut': 'Uttar Pradesh',
  
  // Uttarakhand
  'Dehradun': 'Uttarakhand',
  'Haridwar': 'Uttarakhand',
  'Rishikesh': 'Uttarakhand',
  'Nainital': 'Uttarakhand',
  'Mussoorie': 'Uttarakhand',
  
  // West Bengal
  'Kolkata': 'West Bengal',
  'Howrah': 'West Bengal',
  'Durgapur': 'West Bengal',
  'Siliguri': 'West Bengal',
  'Asansol': 'West Bengal',
  
  // Default option
  'Other': 'Other'
};

export interface IndianLocationInputProps {
  cityId: string;
  cityValue: string;
  onCityChange: (value: string) => void;
  cityError?: string;
  cityOptions: string[];
  required?: boolean;
}

// Export with both names for compatibility
export function IndianLocationInput({
  cityId,
  cityValue,
  onCityChange,
  cityError,
  cityOptions,
  required = false
}: IndianLocationInputProps) {
  return (
    <div>
      <SearchableDropdown
        id={cityId}
        label="City"
        options={cityOptions}
        value={cityValue}
        onChange={onCityChange}
        placeholder="Select or search for a city"
        error={cityError}
        required={required}
      />
    </div>
  );
}

// Export an alias for backward compatibility
export const IndianCityInput = IndianLocationInput;