// Mock data for development use

export const mockBuyers = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '1234567890',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '2',
    purpose: 'Buy',
    budgetMin: 2000000,
    budgetMax: 3000000,
    timeline: '3-6m',
    source: 'Website',
    status: 'New',
    notes: 'Looking for a 2BHK apartment in Chandigarh',
    tags: ['Urgent', 'Verified'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543210',
    city: 'Mohali',
    propertyType: 'Villa',
    bhk: '3',
    purpose: 'Buy',
    budgetMin: 5000000,
    budgetMax: 7000000,
    timeline: '0-3m',
    source: 'Referral',
    status: 'Contacted',
    notes: 'Interested in a 3BHK villa in Mohali',
    tags: ['Serious', 'Cash'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    fullName: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '8765432109',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: '1',
    purpose: 'Rent',
    budgetMin: 15000,
    budgetMax: 25000,
    timeline: '0-3m',
    source: 'Website',
    status: 'Qualified',
    notes: 'Looking for a 1BHK apartment in Chandigarh for rent',
    tags: ['Urgent', 'Ready to move'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    fullName: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '7654321098',
    city: 'Panchkula',
    propertyType: 'House',
    bhk: '4',
    purpose: 'Buy',
    budgetMin: 7000000,
    budgetMax: 10000000,
    timeline: '6-12m',
    source: 'Facebook Ad',
    status: 'New',
    notes: 'Looking for a 4BHK house in Panchkula',
    tags: ['Budget buyer', 'Family'],
    ownerId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Function to filter mock data based on query parameters
export function filterMockData(params: {
  search?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  mockData?: any[];
}) {
  let filtered = params.mockData ? [...params.mockData] : [...mockBuyers];
  const {
    search, city, propertyType, status, timeline,
    page = 1, limit = 10, sort = 'updatedAt', order = 'desc'
  } = params;

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      buyer => 
        buyer.fullName.toLowerCase().includes(searchLower) ||
        (buyer.email?.toLowerCase().includes(searchLower)) ||
        buyer.phone.includes(search)
    );
  }

  if (city) {
    filtered = filtered.filter(buyer => buyer.city === city);
  }

  if (propertyType) {
    filtered = filtered.filter(buyer => buyer.propertyType === propertyType);
  }

  if (status) {
    filtered = filtered.filter(buyer => buyer.status === status);
  }

  if (timeline) {
    filtered = filtered.filter(buyer => buyer.timeline === timeline);
  }

  // Sort data
  filtered.sort((a, b) => {
    let valueA: any, valueB: any;
    
    switch (sort) {
      case 'fullName':
        valueA = a.fullName;
        valueB = b.fullName;
        break;
      case 'city':
        valueA = a.city;
        valueB = b.city;
        break;
      case 'propertyType':
        valueA = a.propertyType;
        valueB = b.propertyType;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'timeline':
        valueA = a.timeline;
        valueB = b.timeline;
        break;
      case 'updatedAt':
      default:
        valueA = a.updatedAt;
        valueB = b.updatedAt;
        break;
    }

    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Calculate pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return {
    buyers: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}
