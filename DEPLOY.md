# 🚀 Quick Deployment Guide - Vercel

## Prerequisites
- [ ] GitHub account
- [ ] MongoDB Atlas account (free)
- [ ] Google Cloud Console (OAuth sudah setup)

## Step 1: MongoDB Atlas Setup (5 min)
1. Visit https://cloud.mongodb.com
2. Sign up / Login
3. **Create Free Cluster:**
   - Cluster Tier: M0 Sandbox (FREE)
   - Cloud Provider: AWS
   - Region: Singapore (ap-southeast-1)
4. **Wait 3-5 minutes** for cluster to deploy
5. **Database Access:**
   - Add New Database User
   - Username: `ajproduction`
   - Password: (auto-generate & SAVE IT!)
   - Database User Privileges: Read & Write to any database
6. **Network Access:**  
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
   - Comment: "Vercel & Development"
7. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: Node.js / Version: 4.1 or later
   - Copy connection string (looks like):
     ```
     mongodb+srv://ajproduction:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name before `?`: `...mongodb.net/ajproduction?...`

## Step 2: Generate NextAuth Secret
```bash
# Windows PowerShell:
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Or use online: https://generate-secret.vercel.app/32
```
**SAVE THIS SECRET!** You'll need it for Vercel.

## Step 3: Push to GitHub
```bash
cd C:\IlhamsyahProject\AJProduction\AJProduction

# Initialize git if not done
git init
git add .
git commit -m "Initial commit - Production ready"

# Create repo on GitHub then:
git remote add origin https://github.com/YOUR-USERNAME/AJProduct.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel
1. Visit https://vercel.com
2. **Sign up with GitHub** (recommended)
3. Click **"Add New Project"**
4. **Import** your `AJProduct` repository
5. **Configure Project:**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `AJProduction` (if repo has subfolders)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **DON'T click Deploy yet!** → Click "Environment Variables" first

## Step 5: Add Environment Variables in Vercel
Click **"Environment Variables"** and add these ONE BY ONE:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://ajproduction:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ajproduction?retryWrites=true&w=majority` | Production |
| `NEXTAUTH_SECRET` | (paste generated secret from Step 2) | Production |
| `AUTH_TRUST_HOST` | `true` | Production |
| `GOOGLE_CLIENT_ID` | (from Google Cloud Console) | Production |
| `GOOGLE_CLIENT_SECRET` | (from Google Cloud Console) | Production |

**Leave these for after first deploy:**
- `NEXTAUTH_URL` - Will be your Vercel URL
- `NEXT_PUBLIC_API_URL` - Same as NEXTAUTH_URL

7. **Click "Deploy"** → Wait 2-3 minutes

## Step 6: Get Your Vercel URL
After deployment succeeds:
1. You'll see: `https://aj-product-xxxxx.vercel.app`
2. **Copy this URL**

## Step 7: Update Environment Variables
Go back to Vercel Dashboard:
1. Project Settings → Environment Variables
2. **Add these:**
   - `NEXTAUTH_URL` = `https://aj-product-xxxxx.vercel.app`
   - `NEXT_PUBLIC_API_URL` = `https://aj-product-xxxxx.vercel.app`
3. **Redeploy:**
   - Deployments tab → Latest deployment → ⋯ → Redeploy

## Step 8: Update Google OAuth
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. **Authorized redirect URIs** → Add:
   ```
   https://aj-product-xxxxx.vercel.app/api/auth/callback/google
   ```
5. **Save**

## Troubleshooting: Error "redirect_uri_mismatch" (detail & perbaikan)

Jika Anda melihat error "Error 400: redirect_uri_mismatch" saat mencoba login Google, ikuti langkah ringkas berikut untuk memperbaikinya.

1) Temukan redirect_uri yang dikirim aplikasi (opsional)
   - Saat muncul error, salin parameter `redirect_uri` dari address bar URL Google (atau buka DevTools → Network untuk melihat request ke accounts.google.com).

2) Tambahkan exact redirect URI di Google Cloud Console
   - Buka: APIs & Services → Credentials → pilih OAuth Client → Edit → Authorized redirect URIs
   - Tambahkan persis salah satu dari URI berikut (pilih sesuai lingkungan):
     - Lokal (default `.env.local` di repo):
       ```
       http://localhost:3001/api/auth/callback/google
       ```
     - Produksi (ganti dengan URL Vercel Anda):
       ```
       https://<your-vercel-url>.vercel.app/api/auth/callback/google
       ```
     - Jika Anda ingin support Preview Deploys, tambahkan preview URL(s) juga (contoh):
       ```
       https://vercel-preview-url.vercel.app/api/auth/callback/google
       ```

3) Pastikan `NEXTAUTH_URL` di Vercel sesuai
   - Di Vercel: Project → Settings → Environment Variables → tambahkan/cek:
     - `NEXTAUTH_URL` = `https://<your-vercel-url>.vercel.app`
     - `NEXT_PUBLIC_API_URL` = `https://<your-vercel-url>.vercel.app`
   - Setelah update, redeploy project.

4) Periksa `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`
   - Pastikan nilai yang Anda isi di Vercel berasal dari OAuth Client yang sama di Google Cloud Console.

5) Tes ulang
   - Gunakan mode incognito untuk menghindari session lama.

Commands cepat (PowerShell) — jalankan di mesin Anda (tidak mengandung secrets):
```powershell
# install/vercel login
npm i -g vercel
# login (akan buka browser)
vercel login
# lihat env di project (harus linked / login)
vercel env ls
# tambahkan NEXTAUTH_URL (ganti URL dengan milik Anda)
vercel env add NEXTAUTH_URL "https://<your-vercel-url>.vercel.app" production
vercel env add NEXT_PUBLIC_API_URL "https://<your-vercel-url>.vercel.app" production
```

Catatan keamanan: jangan menempelkan `GOOGLE_CLIENT_SECRET` atau `NEXTAUTH_SECRET` ke tempat publik. Simpan di password manager.

Jika Anda mau, jalankan skrip helper di repo untuk mem-print redirect URI yang harus Anda tambahkan (lihat `scripts/print-callbacks.ps1`).

## Step 9: Test Your Site
1. Visit `https://aj-product-xxxxx.vercel.app`
2. Should see homepage ✅
3. Try Google login
4. Browse products

## Step 10: Create Admin User
```bash
# Option A: Local script (connect to production DB)
$env:MONGODB_URI="mongodb+srv://ajproduction:PASSWORD@cluster0.xxxxx.mongodb.net/ajproduction?retryWrites=true&w=majority"
node scripts/set-admin.js your-google-email@gmail.com

# Option B: Via Vercel CLI
npm i -g vercel
vercel login
vercel env pull .env.production
node scripts/set-admin.js your-google-email@gmail.com
```

## Step 11: Access Admin Panel
1. Visit `https://your-site.vercel.app/admin/login`
2. Email: `AJProduct@admin`
3. Password: `AJ1964`
4. Should see dashboard ✅

---

## 🎉 DONE! Your site is LIVE!

### Next Steps:
- [ ] Custom domain (optional): Vercel Settings → Domains
- [ ] Setup monitoring: vercel.com/dashboard → Analytics
- [ ] Check build logs if issues
- [ ] Test all features (cart, checkout, orders)

### Troubleshooting:
**Login not working?**
- Check Google OAuth redirect URI matches exactly
- Verify NEXTAUTH_URL and NEXTAUTH_SECRET are set

**Database errors?**
- Verify MONGODB_URI is correct
- Check MongoDB Atlas → Network Access allows 0.0.0.0/0
- Verify user has correct permissions

**Build fails?**
- Check build logs in Vercel
- Ensure all env vars are set
- Try local build: `npm run build`

### Auto Deploy:
Every `git push` to `main` branch will auto-deploy! 🚀

### Free Limits:
- Vercel: Unlimited bandwidth (100GB/month fair use)
- MongoDB Atlas: 512MB storage (±50k products)
- Hobby projects = FREE FOREVER ✅
