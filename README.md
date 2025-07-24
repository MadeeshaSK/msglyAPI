# API Service Landing Page

A modern, responsive landing page for API services built with Next.js, featuring user authentication, dashboards, and admin panel.

## Features

- **Modern Landing Page**: Responsive design with glassmorphism effects
- **Authentication**: Email/Phone/Google login and signup
- **User Dashboard**: API key management, quota tracking, message simulation
- **Admin Panel**: User management, service control, live logging
- **API Routes**: Ready-to-deploy backend with Next.js API routes

## Quick Start

1. **Create the project:**
   ```bash
   npx create-next-app@latest api-service-landing
   cd api-service-landing
   ```

2. **Install dependencies:**
   ```bash
   npm install lucide-react
   ```

3. **Set up Tailwind CSS:**
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

4. **Copy all the code files** from the artifacts into their respective locations

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Test Accounts

- **Admin**: `admin@example.com` / `password123`
- **User**: `user@example.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### User Management  
- `GET /api/user?apiKey=xxx` - Get user data
- `PUT /api/user` - Update user profile

### Admin
- `GET /api/admin?apiKey=xxx&action=users` - Get all users
- `GET /api/admin?apiKey=xxx&action=stats` - Get system stats
- `POST /api/admin` - Admin actions

### Messaging
- `POST /api/sms/send` - Send SMS
- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
DATABASE_URL=your-database-url
```

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── globals.css   # Global styles
│   ├── layout.js     # Root layout
│   └── page.js       # Main page
├── components/       # React components
│   ├── LandingPage.js
│   ├── AuthModal.js
│   ├── UserDashboard.js
│   ├── AdminDashboard.js
│   └── Sidebar.js
└── lib/
    └── auth.js       # Auth utilities
```

## Features Overview

### Landing Page
- Hero section with call-to-action
- Services showcase
- About section
- Contact form
- Modern glassmorphism design

### User Dashboard
- API key display and management
- Request quota tracking
- Message simulation tools
- Request logs table
- Profile management

### Admin Panel
- Service level control (Level 1/2/3/Off)
- User management and editing
- Live system statistics
- Real-time logging
- User search and filtering

## Customization

1. **Styling**: Modify Tailwind classes in components
2. **API Logic**: Update route handlers in `/api` folders  
3. **Database**: Replace mock data with your database calls
4. **Authentication**: Integrate with your auth provider
5. **Branding**: Update colors, fonts, and content

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Custom (easily replaceable)
- **Deployment**: Vercel-ready

This is a production-ready foundation that you can customize and extend based on your specific needs!"# msglyAPI" 
