# Buyer Lead Intake App

A comprehensive application to capture, list, and manage buyer leads with validation, search/fil### Special Validations**:
  - BHK field is conditionally required based on property type
  - Budget max must be greater than or equal to budget min
  - Phone number must be numeric and 10-15 digits
  - City/state validation with auto-mapping between themfunctionality, and CSV import/export.

## Tech Stack

- **Frontend**: Next.js 15.5 (App Router) with TypeScript and Tailwind CSS
- **Backend**: Next.js A### Nice-to-have Features Implemented

1. **Tag chips with typeahead**
   - Enhanced tag input component with typeahead suggestions
   - Keyboard navigation through suggestions
   - Color-coded tag categories for different types of leads
   - Common tag suggestions for faster categorization

2. **Status quick-actions**
   - Update lead status directly from the listing page
   - Interactive dropdown with color-coded status indicators
   - Optimistic UI updates with server validation
   - Full change history tracking

3. **Advanced Indian Location Selection**
   - Comprehensive database of Indian cities and states
   - Searchable dropdown with alphabetical grouping
   - Auto-selection of state based on city choice
   - Type-ahead search for quick city selection**Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with Credentials (simple admin login)
- **Validation**: Zod for client and server-side validation
- **Data Handling**: CSV import/export capabilities
- **Testing**: Jest and React Testing Library

## Features

- **Complete CRUD Operations**: Create, read, update, and delete buyer leads
- **Robust Validation**: Client and server-side validation using Zod
- **Advanced Filtering**: Search and filter by multiple criteria with URL synchronization
- **Pagination**: Server-side pagination for efficient data loading
- **CSV Import/Export**: Import leads from CSV and export filtered results
- **User Authentication**: Simple login system with ownership enforcement
- **Rate Limiting**: Basic protection against API abuse
- **Responsive Design**: Works on mobile and desktop devices
- **Accessibility**: Basic a11y support with proper labels and keyboard navigation

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgres://username:password@localhost:5432/buyerleads
NEXTAUTH_SECRET=your-secret-key-for-auth
NEXTAUTH_URL=http://localhost:3000
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_DURATION=60
```

### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE buyerleads;
```

2. Run database migrations:

```bash
npx drizzle-kit push:pg
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/buyer-lead-intake.git
cd buyer-lead-intake
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Login Credentials (Development)

For development purposes, use the following credentials:

- **Username**: admin
- **Password**: admin

## Design Notes

### Architecture

This application follows a classic Next.js App Router architecture with the following structure:

- `src/app`: Contains all pages and API routes
- `src/components`: Reusable UI components
- `src/db`: Database schema and connection
- `src/lib`: Utility functions and shared code

### Validation

- **Client-Side Validation**: Uses Zod schemas with React Hook Form for immediate feedback
- **Server-Side Validation**: Uses the same Zod schemas in API routes for security
- **Special Validations**:
  - BHK field is conditionally required based on property type
  - Budget max must be greater than or equal to budget min
  - Phone number must be numeric and 10-15 digits

### Server vs Client Rendering

- **SSR**: The listing page uses server-side rendering for initial load
- **Client-Side Data Fetching**: Used for filtering, pagination, and search operations
- **Form Submissions**: Handled via client-side JavaScript for better user experience

### Ownership Enforcement

- All leads have an `ownerId` field that links to the creating user
- API routes check the current user against the `ownerId` before allowing edits
- Read operations are allowed for all authenticated users
- Write/Update/Delete operations check ownership (except admin)

### Error Handling

- **API Error Handling**: Structured error responses with appropriate status codes
- **Form Error Handling**: Validation errors displayed inline
- **Client Error Boundary**: Catches rendering errors and provides fallback UI

### Data Flow

1. User submits form data
2. Client-side validation checks data
3. Data is sent to API route
4. Server validates data again
5. Data is written to the database
6. History entry is created
7. Response is sent back to the client

## Implementation Highlights

### CSV Import/Export

- **Export**: Generates CSV with headers matching the required format
- **Import**: Validates each row, shows specific errors, and only imports valid rows in a transaction

### Search and Filtering

- All filters are synchronized with URL parameters for shareable links
- Filtering is done server-side for accurate results
- The UI updates immediately for a responsive feel

### Testing

- Unit tests for critical validation logic (e.g., budget validation, CSV parsing)
- Focus on business logic rather than UI components

### Rate Limiting

- Basic IP-based rate limiting for create/update operations
- Configurable via environment variables

## Implementation Status

### Completed Features

- ✅ Complete CRUD operations for buyer leads
- ✅ Client and server-side validation with Zod
- ✅ User authentication and authorization
- ✅ Listing page with filtering, searching, and pagination
- ✅ CSV export of filtered data
- ✅ CSV import with validation
- ✅ Rate limiting for API routes
- ✅ Error handling and boundaries
- ✅ Basic unit tests
- ✅ Responsive UI design

### Nice-to-Haves Implemented

- ✅ Tag chips with typeahead and color-coding
- ✅ Status quick-actions dropdown in table
- ✅ Basic full-text search on multiple fields
- ✅ Enhanced Indian city/state selection with auto-state mapping

### Limitations and Future Improvements

- **Performance**: Could implement caching for frequently accessed data
- **Testing**: Could add more comprehensive test coverage
- **UI/UX**: Could enhance the mobile experience
- **Security**: Could add more robust authentication with JWT refresh tokens
- **Monitoring**: Could add logging and monitoring tools

## Running Tests

```bash
npm run test
```

## License

MIT

2. Run the development server:

```bash
npm run dev
```

3. The application will be available at [http://localhost:3000](http://localhost:3000)

## Features

### User Authentication
- Email-based authentication with magic links
- Protected routes requiring authentication

### Buyer Lead Management
- Create new buyer leads with comprehensive form validation
- View and filter leads with server-side pagination
- Edit leads with optimistic updates and concurrency control
- Track changes with a history log
- Tag-based organization with typeahead suggestions
- Quick status updates directly from the listing page

### Data Validation
- Client and server-side validation using Zod
- Conditional field requirements (e.g., BHK required only for Apartments/Villas)
- Budget validation (max >= min)

### Search & Filtering
- Debounced search by name, email, or phone
- Filter by city, property type, status, and timeline
- URL-synced filters for shareable search results
- Server-side pagination and sorting

### CSV Import/Export
- Import leads from CSV with validation
- Export filtered leads to CSV
- Transaction-based import with error reporting

### Security & Performance
- Rate limiting on critical endpoints
- Ownership checks for data access control
- Error boundary implementation
- Accessibility features

## Design Notes

### Validation
- Validation schema is defined in `src/db/schema.ts` using Drizzle and Zod
- The same schema is used for both client and server validation
- Custom refinements handle conditional validations (e.g., BHK required for certain property types)

### Server vs. Client Rendering
- List pages use client-side rendering with server-side API for data fetching
- Forms use client-side rendering with React Hook Form + Zod validation
- API endpoints perform server-side validation before database operations

### Ownership & Authorization
- Users can only edit their own leads (ownerId check)
- History tracking captures all changes with user attribution
- Authentication is required for all buyer-related operations

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    api/                # API endpoints
    auth/               # Authentication pages
    buyers/             # Buyer-related pages
  components/           # React components
    ui/                 # Reusable UI components
      tag-input.tsx     # Enhanced tag input with typeahead
  db/                   # Database setup, schema, migrations
  lib/                  # Utility functions
    __tests__/          # Unit tests for utility functions
  types/                # TypeScript type definitions
```

## Nice-to-have Features Implemented

1. **Tag chips with typeahead**
   - Enhanced tag input component with typeahead suggestions
   - Keyboard navigation through suggestions
   - Common tag suggestions for faster categorization

2. **Status quick-actions**
   - Update lead status directly from the listing page
   - Interactive dropdown with color-coded status indicators
   - Optimistic UI updates with server validation
   - Full change history tracking

## Testing

Unit tests are implemented using Jest with the following coverage:

- Form validation logic (budget validation, conditional fields)
- UI Components (TagInput with typeahead)
- Utility functions

Run tests with:

```bash
npm test
```
