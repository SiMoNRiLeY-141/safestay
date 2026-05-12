# SafeStay 🏨🚨

**Rapid Crisis Response System for Hotels & Hospitals**

A real-time emergency alert platform enabling guests to report safety concerns instantly, while providing property managers and emergency services with critical location and incident details.

---

## 📋 Project Overview

SafeStay is a crisis management system designed for hotels, hospitals, and similar facilities. It provides:

- **Guest Portal**: Quick access to report safety status (Safe ✓ or Need Help 🆘) with specific emergency types
- **Admin Dashboard**: Real-time monitoring of guest statuses across multiple floors and rooms
- **Emergency Response**: Critical location information and emergency contacts for first responders
- **Multi-Tenant Architecture**: Each property has its own admin account, guest portal, and emergency data

### Key Problem Solved

Traditional emergency response in large facilities relies on guests finding phones or staff—precious seconds lost in a crisis. SafeStay enables **immediate, one-tap emergency alerts** with location data.

### Live Links

- **Guest Portal**: [https://simonriley-141.github.io/safestay/](https://simonriley-141.github.io/safestay/)
- **Admin Portal**: [https://simonriley-141.github.io/safestay/admin/login](https://simonriley-141.github.io/safestay/admin/login)

---

## 🎯 Features

### Guest Portal

- ✅ Simple, intuitive interface for guests to report status
- 🆘 Report emergencies with severity levels (Fire, Medical, Threat, etc.)
- 📍 Automatic location identification by room number
- ℹ️ View property information: location, phone, emergency contacts
- 🌙 Dark/Light mode toggle

### Admin Dashboard

- 📊 Real-time monitoring of all guest statuses
- 🎨 Color-coded alerts (Green: Safe, Yellow/Orange: Urgent, Red: Critical)
- 🔔 Audio alerts for new emergencies
- ⚙️ Room configuration (add/edit/delete rooms)
- 📝 Property information management (location, emergency contacts)
- 🤖 AI-powered situation analysis and response recommendations
- 📈 Multiple floor support with grid layout

### Location Management

- 🏢 Store essential property information for emergency responders
- 📍 Address and coordinates
- ☎️ Emergency contact numbers (police, fire, ambulance liaisons)
- 🏷️ Property type identification (Hotel, Hospital, Other)

---

## 🚀 Getting Started

- 🏢 Store essential property information for emergency responders
- 📍 Address and coordinates
- ☎️ Emergency contact numbers (police, fire, ambulance liaisons)
- 🏷️ Property type identification (Hotel, Hospital, Other)

---

## ⚡ How It Works

### System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         SAFESTAY WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘

GUEST PORTAL
  ↓
1. Guest opens portal (/) and selects room number
  ↓
2. Guest clicks "I AM SAFE" → Room status updated to ✓ Safe
   OR clicks "NEED ASSISTANCE" → Select emergency type (Fire, Medical, etc.)
  ↓
3. Guest selection → Firestore database updated in real-time
  ↓
4. Room document updated with: guestStatus, helpType, helpIntensity
  ↓
ADMIN DASHBOARD
  ↓
5. Firestore listener triggers → Admin dashboard refreshes instantly
  ↓
6. Room card updates with color coding:
   • Green = Safe ✓
   • Yellow = Low Priority Help
   • Orange = Medium Priority Help
   • Red = High Priority Emergency
  ↓
7. Audio alert sounds (if enabled)
  ↓
8. Admin can:
   • View specific room details
   • Click on emergency contacts to call
   • Use "Ask AI" for situation analysis
   • View property info (location, address, emergency contacts)
  ↓
EMERGENCY RESPONSE
  ↓
9. Admin contacts emergency services with:
   • Property location & address
   • Specific room number
   • Emergency type & severity
   • Emergency contact numbers
```

### Step-by-Step Process

#### For Guests (Emergency Alert)

1. **Access Portal**: Open SafeStay guest portal on mobile device or kiosk
2. **Select Room**: Choose your room number from the list
3. **Report Status**:
   - Click "✓ I AM SAFE" if everything is okay
   - Click "🆘 NEED HELP" if you need assistance
4. **Select Type** (if emergency): Choose the emergency type (Fire, Medical Emergency, Active Threat, etc.)
5. **Instant Alert**: Admin dashboard receives alert immediately with your location and emergency type

#### For Admins (Crisis Management)

1. **Dashboard Access**: Log in to admin portal (`/admin/login`)
2. **Real-time Monitoring**: See all rooms on dashboard with live color-coded status
3. **Identify Emergencies**: Spot red/orange alerts immediately
4. **Quick Actions**:
   - Click emergency contact phone numbers to call directly
   - View property information (address, coordinates, contact details)
   - Use "Ask AI" button to analyze situation across all rooms
5. **Response**: Contact emergency services with room location and emergency details
6. **Management**: Use "Property Info" tab to update location data, emergency contacts, room configuration

#### Data Flow Through System

```
Guest Action (Click Button)
  ↓
Frontend State Update (React)
  ↓
Firestore Write (Room Document)
  ↓
Firestore Real-time Listener (onSnapshot)
  ↓
Admin Dashboard State Update
  ↓
UI Re-renders with New Status
  ↓
Audio Alert (Optional)
  ↓
Time: < 500ms end-to-end
```

### Key Components & Interactions

| Component            | Function                  | Data Source                     |
| -------------------- | ------------------------- | ------------------------------- |
| **Guest Portal**     | Report status/emergency   | User input                      |
| **Room Context**     | Manages all room states   | Firestore "rooms" collection    |
| **Admin Dashboard**  | Displays real-time status | Room Context listeners          |
| **Property Context** | Manages location info     | Firestore "property" document   |
| **Firestore DB**     | Single source of truth    | All changes sync here           |
| **AI Analyzer**      | Recommends responses      | Analyzes all active emergencies |

### Real-time Synchronization

- **Database**: Firestore (Google's real-time database)
- **Listeners**: Both guest portal and admin dashboard have active listeners
- **Updates**: When any change occurs, ALL connected devices see it instantly
- **Latency**: Typically < 500ms from guest action to admin notification
- **Offline Support**: Data queued locally, synced when reconnected

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project credentials (.env.local)

### Installation

```bash
# Clone the repository
git clone https://github.com/SiMoNRiLeY-141/safestay.git
cd safestay

# Install dependencies
npm install

# Create .env.local file with Firebase credentials
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Keep Firebase values out of source control. Use `.env.local` for local development and GitHub Secrets for deployment workflows.

The Ask AI button uses the server route during local development and falls back to the browser Gemini API in the static GitHub Pages build, so `NEXT_PUBLIC_GEMINI_API_KEY` must be set for deployed AI analysis.

### Local Development

```bash
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## 📱 Usage

### For Guests

1. Open guest portal → `/`
2. Select your room number
3. Click **"I AM SAFE"** or **"NEED ASSISTANCE"**
4. If needing help, select the emergency type
5. Alert sent to admin dashboard instantly

### For Administrators

1. Access admin portal → `/admin/login`
2. Log in with your credentials
3. Monitor dashboard for real-time status updates
4. Configure rooms and property information in **Property Info** tab
5. Use **Ask AI** for situation analysis

### For Emergency Services (Future)

- Separate dashboard for police, fire, ambulance
- Location-based alert filtering
- Quick access to property details, room information, and emergency type

---

## 🏗️ Architecture

### Current Architecture (v1)

```
SafeStay App
├── Guest Portal (/)
│   ├── Room Selection
│   ├── Status Reporting (Safe/Help)
│   ├── Emergency Type Selection
│   └── Property Information Modal
├── Admin Dashboard (/admin)
│   ├── Real-time Room Status Grid
│   ├── Property Information Management
│   ├── Room Configuration
│   └── AI-powered Insights
└── Database (Firestore)
    ├── Rooms Collection
    └── Property Document
```

### Future Architecture (v2+)

```
SafeStay Multi-Tenant System
├── Hotel A
│   ├── Admin Account
│   ├── Guest Portal (unique-url.safestay.com)
│   └── Firestore Data
├── Hotel B
│   ├── Admin Account
│   ├── Guest Portal (unique-url.safestay.com)
│   └── Firestore Data
├── Emergency Services Dashboard
│   ├── Location-based Alerts
│   ├── Property Details
│   └── Response Tracking
└── Central Admin (Multi-property Management)
```

---

## 💾 Technology Stack

| Layer              | Technology                       |
| ------------------ | -------------------------------- |
| **Frontend**       | Next.js 16, React 19, TypeScript |
| **Styling**        | Tailwind CSS 4, Lucide Icons     |
| **Backend**        | Next.js API Routes               |
| **Database**       | Firebase Firestore (Real-time)   |
| **Authentication** | Firebase Auth                    |
| **AI**             | Google Generative AI (Gemini)    |
| **Deployment**     | GitHub Pages (Static Export)     |

---

## 📂 Project Structure

```
safestay/
├── app/
│   ├── admin/
│   │   ├── login/               # Admin login page
│   │   └── page.tsx             # Admin dashboard
│   ├── api/
│   │   └── analyze/             # AI analysis endpoint
│   ├── components/
│   │   ├── PropertyDetails.tsx   # Guest portal info display
│   │   └── PropertyManagement.tsx # Admin property editor
│   ├── page.tsx                 # Guest portal
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── context/
│   ├── AuthContext.tsx          # Authentication state
│   ├── RoomContext.tsx          # Room data state
│   ├── PropertyContext.tsx      # Property data state
│   └── ThemeContext.tsx         # Dark mode state
├── lib/
│   └── firebase.ts              # Firebase configuration
├── public/                      # Static assets
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🔑 Key Features Deep Dive

### Real-time Status Monitoring

- WebSocket-powered live updates via Firestore listeners
- Color-coded severity levels with custom styling
- Audio notifications for emergency alerts
- Optimistic UI updates for instant feedback

### Emergency Type Classification

- **High Priority (Red)**: Fire, Gas Leak, Active Threat
- **Medium Priority (Orange)**: Medical Emergency, Trapped
- **Low Priority (Yellow)**: Water Damage, Electrical Issues

### AI-Powered Analysis

- Analyzes current emergency status across all rooms
- Identifies emergency clusters
- Provides response recommendations to admin staff
- Powered by Google Generative AI (Gemini)

### Property Management

Admins can maintain essential information:

- Property name, type, address
- Emergency contact numbers
- Latitude/longitude for mapping (future)

---

## 📊 Data Model

### Room Document

```json
{
  "id": "1",
  "name": "Room 1",
  "floor": "Ground Floor",
  "guestStatus": "Unknown|Safe|Need Help",
  "helpType": "Fire|Medical|etc",
  "helpIntensity": "high|medium|low",
  "gridCol": 1,
  "gridRow": 1
}
```

### Property Document

```json
{
  "id": "default",
  "name": "SafeStay Hotel",
  "type": "hotel|hospital|other",
  "address": "123 Main St, City, Country",
  "phone": "+1 (555) 000-0000",
  "latitude": 0,
  "longitude": 0,
  "emergencyContacts": [
    {
      "name": "Front Desk",
      "phone": "+1 (555) 000-0001",
      "role": "Reception"
    }
  ]
}
```

---

## 🧑‍💻 Development Team

| Name                   | Role                             | Expertise                                            |
| ---------------------- | -------------------------------- | ---------------------------------------------------- |
| **Adhil Jahan**        | Lead Developer & Project Manager | Full-Stack Development, Crisis Systems Design        |
| **Namiya Abdul Assiz** | UI/UX Designer & Contributor     | Design Systems, User Experience, Feature Ideas       |
| **Sneha**              | Product Designer & Contributor   | Ideas & Innovation, UI/UX Planning, Feature Strategy |

### Contact & Contributions

- **GitHub**: [SiMoNRiLeY-141/safestay](https://github.com/SiMoNRiLeY-141/safestay)
- **Issues & Feedback**: GitHub Issues
- **Contributions**: Welcome! Please read CONTRIBUTING.md

---

## 🗺️ Roadmap

### v1.0 (Current) ✅

- [x] Guest portal with emergency alerts
- [x] Admin dashboard with real-time monitoring
- [x] Property information management
- [x] AI-powered situation analysis
- [x] Dark/Light mode support

### v2.0 (Planned) 🔮

- [ ] Multi-tenant architecture (separate URLs per property)
- [ ] Emergency services dashboard
- [ ] Location-based alert routing
- [ ] Advanced reporting & analytics
- [ ] Mobile app (iOS/Android)
- [ ] SMS/Push notifications

### v3.0 (Future) 🚀

- [ ] Integration with real 911 systems
- [ ] Blockchain audit trail for incident records
- [ ] Machine learning for incident pattern detection
- [ ] Video monitoring integration
- [ ] Automated incident reporting to authorities

---

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Firebase Authentication
4. Add your credentials to `.env.local`

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /property/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📄 License

This project is provided as-is for emergency response use. See LICENSE file for details.

---

## 🤝 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/SiMoNRiLeY-141/safestay/issues)
- **Questions**: Create a discussion on GitHub
- **Security**: Email security concerns to [project-email]
- **Live Site**: [Guest Portal](https://simonriley-141.github.io/safestay/) | [Admin Login](https://simonriley-141.github.io/safestay/admin/login)

---

## 🙏 Acknowledgments

Built with ❤️ for emergency responders and safety advocates everywhere.

**Stay Safe. Stay Alert. SafeStay.**

---

_Last Updated: April 2026_
