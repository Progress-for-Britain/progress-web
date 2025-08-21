# Progress UK Web Platform

A full-stack Progressive Web Application for Progress UK, built with React Native, Expo Router, and Node.js. This platform serves as the main web presence for Progress UK, featuring user registration, event management, newsroom, user management, and comprehensive member onboarding capabilities.

## 🏗️ Project Structure

```
progressweb/
├── frontend/             # React Native frontend with Expo
│   ├── app/             # App Router pages (index, join, events, newsroom, etc.)
│   ├── components/      # Reusable UI components (Header, Footer, Modals)
│   ├── util/           # Utilities, API helpers, auth context, themes
│   └── assets/         # Static assets (icons, animations, PDFs)
└── backend/            # Node.js Express server
    ├── controllers/    # Route controllers (user, event, news, pendingUser)
    ├── middleware/     # Authentication middleware
    ├── routes/         # API routes
    ├── prisma/         # Database schema and migrations
    ├── scripts/        # Database seeding scripts
    ├── utils/          # Server utilities
    └── public/         # Static files and assets
```

## 🚀 Tech Stack

### Frontend
- **React Native** with **Expo Router** for navigation
- **TypeScript** for type safety
- **React Native Reanimated** for smooth animations
- **Linear Gradient** for beautiful UI effects
- **Expo Vector Icons** for comprehensive iconography
- **Expo Notifications** for push notifications

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** for authentication
- **CORS** enabled for cross-origin requests
- **RESTful API** architecture

## 📱 Features

- **User Registration & Authentication** - Secure member onboarding with JWT
- **Event Management** - Create, view, and manage political events and campaigns
- **User Management** - Admin tools for managing members and pending users
- **Newsroom** - Dynamic content management for news and updates
- **Progressive Web App** - Optimized for mobile, tablet, and desktop
- **Responsive Design** - Consistent experience across all devices
- **Dark/Light Theme** - User preference theming system
- **Member Onboarding** - Comprehensive join process with document acceptance
- **Account Settings** - Profile management and preferences
- **Donation Integration** - Support for campaign funding

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/longtimeno-c/progressweb.git
   cd progressweb
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database URL and other configurations
   
   # Run Prisma migrations and generate client
   npx prisma generate
   npx prisma migrate dev
   
   # Optional: Seed test data
   npm run seed
   
   # Start the server
   npm start
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # For web development
   npm run web
   
   # For mobile development (requires Expo Go app)
   npm start
   ```

## 📋 Available Scripts

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with test data

### Frontend
- `npm start` - Start Expo development server
- `npm run web` - Start web development server
- `npm run build:web` - Build for web deployment
- `npm run android` - Start Android development
- `npm run ios` - Start iOS development

## 🌐 Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/progressweb"
PORT=3000
JWT_SECRET="your-secure-jwt-secret-key"
NODE_ENV="development"
```

## 📱 Deployment

### Web Deployment
```bash
cd frontend
npm run build:web
# Deploy the generated web-build folder to your hosting service
```

### Mobile Deployment
- Use Expo Application Services (EAS) for mobile app deployment
- Follow Expo's documentation for publishing to app stores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

For support and questions regarding Progress UK's web platform, please open an issue in the GitHub repository or contact the development team.

## 🏛️ About Progress UK

This platform serves Progress UK, a political movement focused on unleashing Britain's potential through progressive policies and grassroots organizing.

---

Built with ❤️ for Progress UK using React Native, Expo, and Node.js