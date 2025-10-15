# FinanceFlow - Budget Assistant

A modern, full-stack budgeting application built with Next.js, Prisma, and PostgreSQL. Track your expenses, manage budgets, and visualize your financial data with beautiful charts.

## Features

- 📊 **Dashboard** - Overview of your financial health with balance, spending trends, and recent transactions
- 💳 **Transactions** - Add, view, and search through all your financial transactions
- 🎯 **Budgets** - Create and track budgets for different spending categories
- 📈 **Reports** - Visualize spending patterns with interactive charts
- 🔐 **Authentication** - Secure user registration and login
- 🌙 **Dark Theme** - Modern dark UI design

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts for data visualization
- **Authentication**: bcryptjs for password hashing

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd nimble-fin-assist
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nimble_fin_assist?schema=public"

# NextAuth.js (optional)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── transactions/  # Transaction endpoints
│   │   └── budgets/       # Budget endpoints
│   ├── dashboard/         # Dashboard page
│   ├── transactions/      # Transactions page
│   ├── budgets/          # Budgets page
│   ├── reports/          # Reports page
│   └── auth/             # Authentication page
├── src/
│   ├── components/       # React components
│   └── lib/             # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transactions
- `GET /api/transactions?userId=xxx` - Get user transactions
- `POST /api/transactions` - Create new transaction

### Budgets
- `GET /api/budgets?userId=xxx` - Get user budgets
- `POST /api/budgets` - Create new budget

## Database Schema

The application uses three main models:

- **User** - User accounts with authentication
- **Transaction** - Financial transactions (income/expenses)
- **Budget** - Budget limits for spending categories

## Design

The application features a pixel-perfect dark theme design with:
- Modern card-based layout
- Interactive charts and visualizations
- Responsive sidebar navigation
- Clean typography and spacing
- Consistent color palette

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details