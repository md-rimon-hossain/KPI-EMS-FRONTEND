# Polytechnic EMS Frontend

## Employee & Leave Management System - Frontend Application

Built with Next.js 14, TypeScript, TailwindCSS, and Redux Toolkit.

## 🚀 Quick Start

```powershell
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Access

- Development: http://localhost:3000
- Production: Configure in deployment

## 🔑 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Features

- ✅ Role-based dashboards
- ✅ Leave application and approval
- ✅ User management interface
- ✅ Department management
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Dark mode ready

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** Redux Toolkit + RTK Query
- **Forms:** react-hook-form
- **Notifications:** react-hot-toast
- **Charts:** Recharts

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard pages
│   ├── users/             # User management
│   ├── departments/       # Department management
│   └── leaves/            # Leave management
├── components/            # Reusable components
│   ├── Layout/
│   ├── Dashboard/
│   ├── Forms/
│   └── Common/
├── store/                 # Redux store
│   ├── store.ts
│   ├── authSlice.ts
│   ├── authApi.ts
│   ├── userApi.ts
│   ├── departmentApi.ts
│   ├── leaveApi.ts
│   └── hooks.ts
└── styles/
    └── globals.css
```

## 🎯 User Roles

Each role has a specific dashboard:

- **Super Admin** - System management
- **Principal** - Final approvals & leave extensions
- **General Shakha** - Employee & department management
- **Chief Instructor** - Department leave approvals
- **Instructor** - Apply for leave

## 🔐 Authentication

- JWT-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop full features

## 🚀 Deployment

### Vercel (Recommended)

```powershell
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Static Export

```powershell
npm run build
# Deploy the 'out' folder
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Company Logo

Replace logo in `public/logo.png`

## 📊 State Management

Using Redux Toolkit with RTK Query:

- Automatic caching
- Optimistic updates
- Real-time synchronization
- Type-safe API calls

## 🔔 Notifications

Uses `react-hot-toast` for notifications:

- Success messages
- Error handling
- Loading states
- Custom styling

## 📄 License

Proprietary - Polytechnic College

---

For backend setup, see [../backend/README.md](../backend/README.md)
