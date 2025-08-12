# Progress Web

A full-stack Progressive Web Application built with React Native, Expo Router, and Node.js. This platform features user authentication, donation functionality, newsroom, and account management capabilities.

## 🏗️ Project Structure

```
progressweb/
├── frontend/          # React Native frontend with Expo
│   ├── app/          # App Router pages
│   ├── components/   # Reusable UI components
│   ├── util/         # Utilities and API helpers
│   └── assets/       # Static assets
└── backend/          # Node.js Express server
    ├── prisma/       # Database schema and migrations
    └── server.js     # Main server file
```

## 🚀 Tech Stack

### Frontend
- **React Native** with **Expo Router** for navigation
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **React Native Reanimated** for animations
- **Expo Vector Icons** for iconography

### Backend
- **Node.js** with **Express.js**
- **Prisma ORM** for database management
- **PostgreSQL** database
- **CORS** enabled for cross-origin requests

## 📱 Features

- **Authentication System** - User login and registration
- **Account Management** - User profile and settings
- **Donation Platform** - Integrated donation functionality
- **Newsroom** - Content management and display
- **Progressive Web App** - Works on mobile, tablet, and desktop
- **Responsive Design** - Optimized for all screen sizes

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Expo CLI (optional, for mobile development)

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
   
   # Run Prisma migrations
   npx prisma migrate dev
   
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
JWT_SECRET="your-jwt-secret"
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

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ using React Native, Expo, and Node.js