# SMYS Food Count — Web Student Portal 🍛📱

A mobile-first Progressive Web App (PWA) for hostel borders and students (especially iOS / Safari and Android users) with 100% feature parity to the native Android Student Portal.

---

## 🚀 Key Features

1. **Flexible Student Authentication**:
   - Multi-identifier login: **Institutional Email**, **Student Admin ID (e.g. `SMYS-2024-089`)**, or **Roll Number (e.g. `22CS104`)**.
   - One-click **Demo Student Mode** for instant exploration without waiting for database credentials.

2. **Rule A: The 7:30 PM (19:30) Date Switch Rule**:
   - At 19:30 (7:30 PM) daily, dinner service starts and the default date automatically advances to Tomorrow (`Date.now() + 1 Day`).

3. **Rule B: Firestore Document Mapping & Data Model**:
   - `users/${studentId}`: Student profile, year level, roll number, and sticky meal preferences.
   - `foodcounts/${studentId}_${YYYY-MM-DD}`: Atomic meal count submissions (`studentId_date` format).
   - `lockstatus/active_lock_status`: Real-time Master Lock & individual meal locks (`breakfastLocked`, `lunchLocked`, `snackLocked`, `dinnerLocked`).
   - `requests/${studentId}_${YYYY-MM-DD}`: Missed count requests with admin review status (`PENDING`, `APPROVED`, `REJECTED`).
   - `notifications`: Live announcements stream filtered by student year batch.

4. **Rule C: Lock Status Evaluation Logic**:
   - Evaluates Master Lock, group locks, individual meal toggles, Lunch Box sub-toggle, and On Leave state.
   - Dynamic alert banners:
     - 🔴 **Submission Window Closed**: when Master Lock is active.
     - 🔴 **On Leave Alert**: when student is marked away (all meals locked & zeroed).
     - 🟠 **Main Meals Finalized**: when meal locks activate.

5. **Missed Count Request & WhatsApp Admin Integration**:
   - When student was marked On Leave and main meals locked, opens missed count request modal.
   - Generates pre-formatted WhatsApp message for instant approval:
     `https://wa.me/{adminWhatsApp}?text=Hi%20Admin,%20I%20({studentName})%20missed%20my%20food%20count...`

6. **PWA & iOS Safari "Add to Home Screen"**:
   - Web App Manifest (`manifest.json`), service worker offline caching (`sw.js`), Apple mobile web app tags, and step-by-step iOS Safari installation instructions.

7. **Settings & Lock Simulator**:
   - In-app interactive Lock Simulator: instantly toggle Master Lock, Breakfast Lock, Lunch Lock, etc. to test Rule C enforcement without needing the admin portal.

---

## 🛠️ Deploying to Vercel

The app is fully configured for Vercel with zero extra setup needed:

1. Push this folder to a GitHub repository or use the Vercel CLI:
   ```bash
   npm i -g vercel
   vercel
   ```
2. In your **Vercel Project Settings ➔ Environment Variables**, add:
   - `VITE_FIREBASE_API_KEY`: Your Firebase Web API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: `smys-food-count-b378a.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID`: `smys-food-count-b378a`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `smys-food-count-b378a.appspot.com`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your messaging sender ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase web app ID

*(Note: If deploying without env variables initially, students or testers can also enter custom Firebase credentials directly inside the app's **Settings Modal**)*.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
# Running at: http://localhost:5173

# Build for production
npm run build
```

---

## 📱 Mobile Architecture Preview

- **Tab 1: Home View**: Welcome greeting, year chip (`3rd Year`), roll number, live filtered announcements, and quick action tiles.
- **Tab 2: Mess Menu View**: Date navigation bar (`<` and `>`), automated 7:30 PM date switch, and 4 color-accented meal cards (Breakfast, Lunch, Snacks, Dinner).
- **Tab 3: Food Count View**: Real-time Firestore meal switches, Lunch Box sub-toggle, On Leave switch, lock alert banners, and Missed Count request flow.
- **Tab 4: Alerts View**: Filterable feed of notices (All, High Priority, Normal) and search bar.
