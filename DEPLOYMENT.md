# 🚀 Deployment Guide - MermaidXP

## Table of Contents
1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Cloudflare Workers Deployment](#cloudflare-workers-deployment)
4. [Environment Variables](#environment-variables)
5. [Firebase Setup](#firebase-setup)
6. [Production vs Preview](#production-vs-preview)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

This will:
1. Build the project
2. Deploy to Cloudflare Workers
3. Output the live URL

---

## Prerequisites

- ✅ Node.js 18 or higher
- ✅ npm installed
- ✅ Git configured
- ✅ [Cloudflare account](https://dash.cloudflare.com) (free tier available)
- ✅ Firebase project configured (for authentication)
- ✅ Wrangler CLI (`npm install -g wrangler` if not installed)

---

## Cloudflare Workers Deployment

### Initial Setup

1. **Login to Cloudflare** (first time only):
   ```bash
   wrangler login
   ```
   This opens your browser for OAuth authentication.

2. **Configure wrangler.jsonc**:
   ```jsonc
   {
     "name": "mermaidxp",
     "compatibility_date": "2024-01-01",
     "main": "src/worker.ts",
     "assets": {
       "directory": "./dist",
       "not_found_handling": "single-page-application"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

### Deployment Process

The deploy command does the following:
1. Runs `npm run build` to create production bundle
2. Executes `wrangler deploy` to upload assets
3. Outputs the live URL (e.g., `https://mermaidxp.your-subdomain.workers.dev`)

---

## Environment Variables

### Local Development (.env)

Create a `.env` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Gemini API (optional)
GEMINI_API_KEY=your-gemini-api-key
```

### Build-Time Variables

Vite injects `VITE_*` variables at **build time**. They are baked into the bundle.

**Important**: 
- Change `.env` → Rebuild required (`npm run build`)
- Environment variables are NOT secret in frontend builds (visible in bundle)
- Never put sensitive keys in frontend environment variables

### How It Works

1. **Development** (`npm run dev`):
   - Vite reads `.env` directly
   - Hot reload on changes

2. **Production Build** (`npm run build`):
   - Vite replaces `import.meta.env.VITE_*` with actual values
   - Values are baked into JavaScript bundle
   - Deployed bundle contains the values

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your domain to **Authorized domains**:
   - For Cloudflare Workers: `your-subdomain.workers.dev`
   - For custom domain: `yourdomain.com`

### 3. Get Firebase Config

1. Go to **Project Settings** → **General**
2. Under "Your apps", click **Web app** icon
3. Copy the config values to `.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Rebuild After Config Changes

```bash
npm run build
npm run deploy
```

**See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration.**

---

## Production vs Preview

### Production Deployment

Production deployments go to your main URL:

```bash
npm run deploy
```

Output: `https://mermaidxp.your-subdomain.workers.dev`

### Preview Deployments

For testing before production:

```bash
wrangler deploy --branch=preview
```

Output: `https://preview.mermaidxp.your-subdomain.workers.dev`

### Key Differences

| Feature | Production | Preview |
|---------|-----------|---------|
| Command | `npm run deploy` | `wrangler deploy --branch=preview` |
| URL | Main domain | Branch subdomain |
| Firebase Domain | Must add to authorized | Must add to authorized |
| Persistence | Permanent | Can be deleted |

---

## Troubleshooting

### Error: "Unauthorized domain"

**Problem**: Firebase auth fails with "unauthorized domain" error.

**Solution**: Add your Cloudflare Workers domain to Firebase:
1. Go to Firebase Console → Authentication → Settings
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Enter: `your-subdomain.workers.dev`

### Error: "import.meta.env.VITE_* is undefined"

**Problem**: Environment variables not found in production.

**Solution**: 
1. Check `.env` file exists and has correct values
2. Rebuild: `npm run build`
3. Redeploy: `npm run deploy`

Remember: Environment variables are baked in at build time!

### Error: "React initialization failed"

**Problem**: This was an issue with import maps or chunk ordering.

**Solution**: Fixed in commit 93e0fe8. If you still see this:
1. Clear browser cache (Ctrl + Shift + R)
2. Verify latest code is deployed
3. Check browser console for specific errors

### Build Warnings

TypeScript/ESLint warnings are OK and won't block deployment. Only errors block builds.

---

## CI/CD with GitHub Actions (Optional)

For automated deployments, you'll need a Cloudflare API Token.

### 1. Create API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on your profile → **API Tokens**
3. Click **Create Token**
4. Use template: **Edit Cloudflare Workers**
5. Permissions:
   - Account → Workers Scripts → Edit
   - Account → Account Settings → Read
6. Copy the token (shown once!)

### 2. Add to GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `CLOUDFLARE_API_TOKEN`
4. Value: paste the token

### 3. Create Workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Cloudflare Workers
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Note**: You'll also need to add all `VITE_FIREBASE_*` variables as GitHub secrets.

---

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## Need Help?

Check the [troubleshooting section](#troubleshooting) or review:
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Architecture details
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [README.md](./README.md) - Project overview
