# 🏪 AJ Production - E-Commerce Platform

> Modern full-stack e-commerce platform untuk produk Diocca & Batanghari River. Built with Next.js, MongoDB, and NextAuth.js.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

---

## ✨ Features

### �️ **Customer Features**
- ✅ Product catalog dengan search & filter
- ✅ Real-time search dengan debounce
- ✅ Shopping cart dengan stock validation
- ✅ Multiple payment methods (Bank Transfer, COD)
- ✅ Order tracking & history
- ✅ User profile management
- ✅ Toast notifications untuk UX feedback
- ✅ Responsive design (Mobile & Desktop)
- ✅ SEO optimized dengan meta tags

### 🔐 **Authentication**
- ✅ Google OAuth login
- ✅ Session management dengan database
- ✅ Protected routes & API endpoints
- ✅ Role-based access control (Admin/User)

### 🎛️ **Admin Panel**
- ✅ Dashboard dengan statistics (revenue, orders, products)
- ✅ Product management (CRUD operations)
- ✅ Category management
- ✅ Order management & status updates
- ✅ Customer messages (Contact form)
- ✅ User management (Set admin role)

### 🎨 **UI/UX**
- ✅ Modern design dengan shadcn/ui components
- ✅ Loading skeletons untuk better perceived performance
- ✅ Toast notifications (Sonner)
- ✅ Form validation dengan error messages
- ✅ Custom 404 error page
- ✅ Mobile-friendly navigation

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14.2.33 (Pages Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: Sonner (Toast)

### **Backend**
- **Runtime**: Node.js
- **API**: Next.js API Routes (REST)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: NextAuth.js v5
- **OAuth Providers**: Google, Facebook

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint
- **Code Style**: Prettier
- **Version Control**: Git

---

## 📁 Project Structure

```
AJProduction/
├── 🎨 Frontend
│   ├── src/components/      # React components
│   ├── src/styles/          # CSS files
│   ├── pages/               # Page routes
│   └── public/              # Static assets
│
├── 🔧 Backend
│   ├── pages/api/           # API endpoints
│   ├── models/              # MongoDB schemas
│   ├── lib/                 # Server utilities
│   └── scripts/             # CLI tools
│
└── 📝 Config
    ├── tsconfig.json        # TypeScript config
    ├── next.config.js       # Next.js config
    └── .env.local           # Environment variables
```

**Detailed structure:** See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Google Cloud Console account (for OAuth)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/ilhamsyhrdn/AJProduct.git
cd AJProduction
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` dengan credentials Anda:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/AJProduction

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. **Start MongoDB**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

5. **Run development server**
```bash
npm run dev
```

6. **Open browser**
```
http://localhost:3001
```

---

## 🎯 Usage

### **For Customers:**

1. **Browse Products**
   - Visit homepage → Products section
   - Use search bar for quick search
   - Filter by category

2. **Shopping**
   - Click product → View details
   - Select quantity → Add to cart
   - View cart → Checkout
   - Fill shipping info → Place order

3. **Account Management**
   - Login dengan Google
   - View order history
   - Track order status

### **For Admin:**

1. **Set Admin Role**
```bash
# Login first, then run:
node scripts/set-admin.js your-email@gmail.com
```

2. **Access Admin Panel**
   - Visit: http://localhost:3001/admin
   - View dashboard statistics
   - Manage products, orders, users

3. **Product Management**
   - Add new products
   - Edit product details
   - Update stock & prices
   - Delete products

4. **Order Management**
   - View all orders
   - Update order status:
     - Pending → Processing
     - Processing → Shipped
     - Shipped → Delivered
   - View customer details

---

## 📚 Documentation

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Detailed folder structure & architecture
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing guide untuk login/logout functionality

---

## 🔧 Configuration

### **OAuth Setup**

#### **Google OAuth:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth credentials
4. Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`
5. Copy Client ID & Secret to `.env.local`

**Production:** Update redirect URI ke domain produksi Anda (e.g., `https://yourdomain.com/api/auth/callback/google`)

---

## 📦 Scripts

```bash
# Development
npm run dev          # Start dev server (port 3001)

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
node scripts/set-admin.js [email]  # Set user as admin

# Linting
npm run lint         # Run ESLint
```

---

## 🗂️ Database Models

- **User** - User accounts dengan OAuth data
- **Product** - Product catalog dengan images & stock
- **Category** - Product categories
- **Cart** - Shopping cart items
- **Order** - Customer orders dengan status tracking
- **Contact** - Contact form messages
- **Newsletter** - Email subscriptions

---

## 🎨 UI Components

Built with [shadcn/ui](https://ui.shadcn.com/):
- Button, Input, Textarea
- Dialog, Sheet, Dropdown Menu
- Card, Avatar, Badge
- Toast notifications (Sonner)
- Loading skeletons
- And more...

---

## 🔐 Security

- ✅ Environment variables untuk sensitive data
- ✅ Server-side session management
- ✅ Protected API routes dengan middleware
- ✅ Role-based access control
- ✅ Input validation & sanitization
- ✅ HTTPS ready untuk production

---

## 🚢 Deployment

### **Production Environment Variables**

Create `.env.production` or configure in your hosting platform:

```env
# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ajproduction?retryWrites=true&w=majority

# NextAuth (CRITICAL - Generate new secret!)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
AUTH_TRUST_HOST=true

# Google OAuth (Update redirect URI in Google Console)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Optional: Email notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="AJ Production <noreply@ajproduction.com>"

# Admin
ADMIN_EMAIL=admin@yourdomain.com

# App URL
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

### **Pre-Deployment Checklist:**
- [ ] ✅ MongoDB Atlas cluster created & connection string obtained
- [ ] ✅ Update Google OAuth redirect URIs:
  - Add: `https://yourdomain.com/api/auth/callback/google`
  - Keep localhost for local testing
- [ ] ✅ Generate secure `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- [ ] ✅ Set `NEXTAUTH_URL` to production domain
- [ ] ✅ Update `NEXT_PUBLIC_API_URL` if using separate API
- [ ] ✅ Configure environment variables in hosting platform
- [ ] ✅ Test build locally: `npm run build && npm start`
- [ ] ✅ Setup admin user: Deploy first, then login with Google and run `node scripts/set-admin.js your-email@gmail.com`
- [ ] ✅ Enable HTTPS (automatic on Vercel/Railway)
- [ ] ✅ (Optional) Setup custom domain & DNS
- [ ] ✅ (Optional) Configure CDN for `/public/gambarProduct` images
- [ ] ✅ (Optional) Setup monitoring (Sentry, LogRocket)

### **Deployment Platforms:**

#### **Vercel (Recommended)**
1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

#### **Railway**
1. Connect GitHub repository
2. Add MongoDB plugin (or use Atlas)
3. Set environment variables
4. Deploy

#### **DigitalOcean / VPS**
```bash
# Install dependencies
npm install --production

# Build
npm run build

# Start with PM2
npm i -g pm2
pm2 start npm --name "ajproduction" -- start
pm2 save
pm2 startup
```

### **Post-Deployment:**
1. Visit your domain and test customer flow:
   - Browse products
   - Login with Google
   - Add to cart
   - Checkout process
2. Set admin role: `node scripts/set-admin.js your-google-email@gmail.com`
3. Test admin panel: `https://yourdomain.com/admin/login`
4. Verify email notifications (if configured)
5. Check MongoDB Atlas metrics
6. Monitor error logs

### **Production Checklist:**
- [x] ✅ Production build tested and optimized
- [x] ✅ All TypeScript errors resolved
- [x] ✅ ESLint warnings minimized (only non-blocking remain)
- [x] ✅ Image optimization configured (remotePatterns)
- [x] ✅ Security headers added
- [x] ✅ MongoDB duplicate index warnings fixed
- [x] ✅ Google OAuth configured
- [x] ✅ Admin authentication working
- [ ] Setup MongoDB Atlas (production database)
- [ ] Configure OAuth redirect URIs untuk production domain
- [ ] Set environment variables di hosting platform
- [ ] Enable HTTPS
- [ ] Setup SMTP untuk email notifications (optional)
- [ ] Configure payment gateway jika diperlukan (optional)
- [ ] Setup CDN untuk images (optional)
- [ ] Enable monitoring & logging (optional)

### **Recommended Platforms:**
- **Vercel** (recommended for Next.js)
- **Railway** (full-stack with database)
- **DigitalOcean** (VPS)

---

## 📊 API Endpoints

### **Public:**
- `GET /api/products` - List products
- `GET /api/products/[id]` - Product detail
- `GET /api/products/search` - Search products
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe newsletter

### **Authenticated:**
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order

### **Admin Only:**
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `PUT /api/admin/users/[id]` - Update user role

---

## � Order Status Lifecycle & Migration

### Current Lifecycle

`pending → processing → shipped → completed`

`cancelled` is a terminal state. Historically the platform also used `delivered`; it now mirrors `completed` but may still appear in older records.

### Why Consolidate?
Using a single final state (`completed`) simplifies analytics and customer messaging. Legacy `delivered` documents can be migrated for consistency.

### Optional Migration (Legacy `delivered` → `completed`)

1. Ensure `MONGODB_URI` is set in `.env.local`.
2. Run a dry run to see how many documents would change.
3. Execute the migration.

PowerShell examples:
```
node scripts\migrate-order-status.js --dry-run
node scripts\migrate-order-status.js
```

The migration script only updates documents with `orderStatus: "delivered"` and leaves other statuses untouched.

### UI Handling
The admin panel shows `Completed` for new updates and will still display a legacy `Delivered (legacy)` option if an order retains that original status until migrated.

---

## �🐛 Troubleshooting

### **Server won't start:**
- Check if port 3000/3001 is available
- Verify MongoDB is running
- Check `.env.local` configuration

### **Login fails:**
- Verify OAuth credentials
- Check redirect URIs in Google/Facebook console
- Ensure NEXTAUTH_URL matches server port

### **Database errors:**
- Ensure MongoDB is running
- Check MONGODB_URI in `.env.local`
- Verify database permissions

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Ilham Syahrudin**
- GitHub: [@ilhamsyhrdn](https://github.com/ilhamsyhrdn)
- Email: milhamsyahr07@gmail.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for AJ Production**

Last Updated: November 7, 2025


Edit `.env.local` with your credentials:
- MongoDB connection string
- NextAuth secret (generate with: `openssl rand -base64 32`)
- Google OAuth credentials
- Facebook OAuth credentials

4. Start development server
```bash
npm run dev
```

Visit http://localhost:3000

## Environment Variables

See `.env.example` for all required environment variables.

## Admin Setup

After first login, you need to manually set admin role in MongoDB:

```javascript
// Using MongoDB Compass or mongosh
db.users.updateOne(
  { email: "your-admin-email@gmail.com" },
  { $set: { role: "admin", isActive: true } }
)
```

Then login again to access admin panel at `/admin`

## Project Structure

```
AJProduction/
├── pages/           # Next.js pages and API routes
├── src/
│   └── components/  # React components
├── models/          # MongoDB Mongoose models
├── lib/             # Utilities and database connection
├── types/           # TypeScript type definitions
└── public/          # Static assets
```

## License

Private project - All rights reserved
  