# 🔥 Firebase Authentication Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "mermaid-pro-viewer")
4. Disable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set a **Project support email** (your email)
5. Click **Save**

## 3. Register Web App

1. In Firebase Console, go to **Project Overview** (⚙️ icon)
2. Click on **</>** (Web) to add a web app
3. Register app with a nickname (e.g., "Mermaid Viewer Web")
4. ✅ Check "Also set up Firebase Hosting" (optional)
5. Click **Register app**

## 4. Get Configuration

After registering, you'll see your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## 5. Configure Local Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **IMPORTANT:** Never commit `.env.local` to git (already in `.gitignore`)

## 6. Configure Authorized Domains

For production/staging deployment:

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your production domain(s):
   - `your-domain.com`
   - `www.your-domain.com`
   - `localhost` (already included for development)

## 7. Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Click **"Iniciar Sesión"** button in the header
3. Click **"Continuar con Google"**
4. Select your Google account
5. You should see your user avatar/name in the header

## 8. Optional: Add More Providers

### Email/Password
1. **Authentication** > **Sign-in method** > **Email/Password**
2. Toggle **Enable**
3. Update `LoginModal.tsx` to add email/password form

### GitHub
1. **Authentication** > **Sign-in method** > **GitHub**
2. Create OAuth App on GitHub
3. Add Client ID and Secret
4. Update `AuthContext.tsx` to add GitHub provider

### Facebook, Twitter, etc.
Similar process for other providers

## 9. Security Rules (Important!)

### Firestore (if using database)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Diagrams
    match /diagrams/{diagramId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.owner;
    }
  }
}
```

### Storage (if using file storage)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 10. Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Check that `.env.local` exists and has correct values
- Restart dev server after changing `.env.local`

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to **Authorized domains** in Firebase Console
- For localhost, it should work by default

### Login popup blocked
- Allow popups for your domain in browser settings
- Use `signInWithRedirect()` instead of `signInWithPopup()`

### CORS errors
- Check that your domain is in **Authorized domains**
- Verify API key is correct

## Next Steps

✅ Authentication is now working!

Optional enhancements:
- Add user profile page
- Save diagrams to Firestore per user
- Add social sharing with user attribution
- Implement role-based access (admin, editor, viewer)

## Resources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
