# Netlify Deployment Guide

## ✅ Changes Made for Netlify Deployment

### 1. **Backend URL Updated**
- Updated API base URL to: `https://crmbackend-xgc8.onrender.com/api`
- Location: `src/services/authApi.js`

### 2. **Netlify Configuration Files Created**

#### `netlify.toml`
- Build command: `npm run build`
- Publish directory: `dist`
- Development command: `npm run dev`
- Configured redirects for SPA routing
- Security headers configured

#### `.netlifyrc`
- Development configuration file

#### `.env.example`
- Example environment variables template

### 3. **Vite Configuration Updated**
- Added server port configuration (3000)
- Optimized build settings for production
- Configured source maps (disabled for production)

## 🚀 How to Deploy to Netlify

### Option 1: Using Netlify UI (Recommended)

1. **Commit and Push Code**
   ```bash
   git add .
   git commit -m "Update backend URL and prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider (GitHub, GitLab, etc.)
   - Choose your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18+ (recommended)
   - Netlify will auto-detect from netlify.toml

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

### Option 2: Using Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Locally**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Follow prompts to authorize and deploy**

## 📋 Pre-Deployment Checklist

- ✅ Backend URL updated to `https://crmbackend-xgc8.onrender.com/api`
- ✅ netlify.toml configured
- ✅ vite.config.js optimized for production
- ✅ Environment variables template created (.env.example)
- ✅ SPA redirects configured (all routes → index.html)
- ✅ Security headers configured

## 🔐 Environment Variables on Netlify

### To add environment variables in Netlify UI:
1. Site settings → Build & deploy → Environment
2. Add any required environment variables
3. Redeploy the site

For this project, you may want to add:
- `VITE_API_BASE_URL` (optional - defaults to code value)

## 🧪 Testing Before Deployment

```bash
# Test build locally
npm run build

# Preview production build
npm run preview

# Run development server
npm run dev
```

## 📊 Expected File Structure After Build

```
dist/
├── index.html
├── assets/
│   ├── index-XXXXX.js
│   ├── index-XXXXX.css
│   └── ...
└── ...
```

## ✨ Features Configured

- ✅ Automatic builds on git push
- ✅ Single Page Application (SPA) routing
- ✅ Security headers
- ✅ CORS-friendly setup
- ✅ Development and production configurations
- ✅ Source map disabled for production (better security)

## 🆘 Troubleshooting

### Build fails on Netlify
- Check Node version (18+)
- Ensure all dependencies in package.json
- Check netlify.toml build command

### API calls not working
- Verify backend URL is correct: `https://crmbackend-xgc8.onrender.com/api`
- Check CORS settings on backend
- Browser dev tools → Network tab for error details

### Routing issues (404 on refresh)
- ✅ Already configured in netlify.toml with SPA redirect

---

**Ready to deploy!** Your application is now configured for Netlify deployment.
