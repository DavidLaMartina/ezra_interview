# Ezra ToDo: Full-Stack Task Management Application

A complete ToDo application built with .NET Core and React, featuring JWT authentication and responsive design.

## Tech Stack & Architecture

### Backend (.NET Core 9.0)

- **Framework**: ASP.NET Core Web API
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT Bearer tokens with secure password hashing
- **Validation**: FluentValidation with comprehensive input validation
- **Architecture**: Clean architecture with separation of concerns
- **Logging**: Built-in .NET logging with structured logging

### Frontend (React 18 + TypeScript)

- **Framework**: React with TypeScript for type safety
- **State** Management: React Context API for auth, React hooks for local state
- **HTTP** Client: Axios with interceptors for request/response handling
- **Styling**: Pure CSS with modern responsive design
- **Build** Tool: Create React App
- **Linting**: ESLint + Prettier for code quality

### Key Design Decisions

- **SQLite**: Chosen for simplicity and portability in MVP stage - easily upgradeable to PostgreSQL, SQL Server, or other SQL implementations later
- **JWT Authentication**: Stateless authentication suitable for APIs and SPAs
- **Soft Delete**: Data preservation offers protection against accidental deletions
- **General Architecture**: Separates business logic from infrastructure concerns
- **TypeScript**: Compile-time safety and standardized developer experience

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) - download or install with `brew install --cask dotnet-sdk`
- [Node.js 16+](https://nodejs.org/) - download or install with `brew install node`
- Git for version controll (`brew install git`)

To verify installations:

```
dotnet --version  # Should show 9.0.x
node --version    # Should show 16.x or higher
npm --version     # Should show 8.x or higher
```

## Initial Setup

### 1. Clone and Set up Project Infrastructure

```
git clone https://github.com/DavidLaMartina/ezra_interview.git
cd ezra_interview
```

### 2. Backend Setup

```
cd backend/ToDoApi

# Restore NuGet packages
dotnet restore

# Install Entity Framework tools globally (if not already installed)
dotnet tool install --global dotnet-ef

# Create initial database and apply migrations
dotnet ef database update

# Run the backend server
dotnet run
```

The backend will start on `http://localhost:5069` by default.

### 3. Frontend Setup

```
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

### 4. Verify Setup

1. **Backend**: Visit `http://localhost:5069/swagger` to see the API documentation
2. **Frontend**: The app should load at `http://localhost:3000` with a sign-in & registration screen.
3. **Test Authentication**:

- Use demo account: `demo@example.com` / `Password123`
- Or register a new account

## Database Management

### Starting Fresh (Erase new data, restart with seed data)

```
cd backend/ToDoApi

# Remove database and migration history
rm todo.db
rm -rf Migrations/

# Create new migration
dotnet ef migrations add InitialCreate

# Create database and seed data
dotnet ef database update

# Start server
dotnet run
```

### Adding New Migrations (After model changes)

```
cd backend/ToDoApi

# Create new migration with descriptive name
dotnet ef migrations add AddNewFeature

# Apply migration
dotnet ef database update
```

### Running / Restarting with Existing Data

```
cd backend/ToDoApi

# Simply start the server (database and data persist)
dotnet run
```

The SQLite database file `todo.db` conatins all data locally and will persist between runs.

### Database Seeding

On the first run, the application automatically creates:

- A demo user account (`demo@example.com` / `Password123`)
- Sample tasks with various statuses, priorities, and due dates
- One soft-deleted task for testing restore functionality

## Development Workflow

### Backend Development

```
cd backend/ToDoApi

# Run in watch mode (auto-restart on changes)
dotnet watch run

# Run tests
dotnet test ../ToDoApi.Tests/

# Build for production
dotnet build --configuration Release
```

### Frontend Development

```
cd frontend

# Development server with hot reload
npm start

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Build for production
npm run build
```

## Environment Configuration

### Backend (`appsettings.json`)

```
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=todo.db"
  },
  "Jwt": {
    "Key": "your-secret-key-at-least-32-characters-long",
    "Issuer": "TodoApi",
    "Audience": "TodoApp"
  }
}
```

### Frontend (`.env`)

```
REACT_APP_API_BASE_URL=http://localhost:5069/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_APP_NAME=Todo Manager
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_DEBUG=true
REACT_APP_PAGINATION_LIMIT=10
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info (requires auth)

### Tasks (All require authentication)

- `GET /api/tasks` - List tasks with filtering, sorting, pagination
- `GET /api/tasks/{id}` - Get specific task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Soft delete task
- `POST /api/tasks/{id}/restore` - Restore deleted task
- `PATCH /api/tasks/bulk` - Bulk operations (complete/delete multiple)

### Query Parameters for GET /api/tasks

- `status` - Filter by TaskStatus (0=Pending, 1=InProgress, 2=Completed)
- `priority` - Filter by TaskPriority (0=Low, 1=Medium, 2=High)
- `search` - Search in task titles
- `includeDeleted` - Include soft-deleted tasks
- `sortBy` - Sort field (duedate, created, updated, priority, status, title)
- `sortOrder` - Sort direction (asc, desc)
- `cursor` - Pagination cursor
- `limit` - Items per page (max 100)

## Testing

### Backend Tests

```
cd backend/ToDoApi.Tests

# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "TasksControllerTests"
```

### Frontend Tests

- **To be implemented**

## Project Structure

```
├── backend/
│   ├── ToDoApi/
│   │   ├── Controllers/        # API controllers
│   │   ├── Models/            # Domain models and DTOs
│   │   │   └── Validators/    # FluentValidation rules
│   │   ├── Services/          # Business logic services
│   │   ├── Data/              # Database context and seeding
│   │   ├── Middleware/        # Custom middleware
│   │   └── Program.cs         # Application entry point
│   └── ToDoApi.Tests/         # Unit and integration tests
└── frontend/
    ├── public/                # Static assets
    └── src/
        ├── components/        # React components
        ├── contexts/          # React context providers
        ├── services/          # API client services
        ├── types/             # TypeScript type definitions
        ├── styles/           # CSS stylesheets
        └── config/           # Configuration utilities
```

## Troubleshooting

### Common Issues

#### Backend won't start:

- Check .NET version: dotnet --version
- Ensure port 5069 is available
- Check database connection in appsettings.json

#### Frontend can't connect to API:

- Verify REACT_APP_API_BASE_URL in .env matches backend URL
- Check CORS configuration in backend
- Ensure both servers are running

#### Database errors:

- Delete todo.db and restart to reset database
- Check Entity Framework tools: dotnet ef --version
- Verify model changes have corresponding migrations

#### Authentication issues:

- Check JWT secret key length (minimum 32 characters)
- Verify token format includes "Bearer " prefix (particularly in Swagger)
- Check token expiry (7-day default)

#### Performance Considerations

- SQLite has limitations; consider PostgreSQL for production
- Implement caching for frequently accessed data
- Consider database indexing optimization for large datasets
- Monitor API response times and optimize queries

#### Security Notes

- Change default JWT secret key in production
- Implement rate limiting for production deployment
- Consider HTTPS termination at load balancer/proxy level
- Regular security audits and dependency updates
