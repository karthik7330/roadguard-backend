# 🏗️ RoadGuard - System Block Diagram

## 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROADGUARD ECOSYSTEM                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│   CITIZENS/USERS     │        │   AUTHORITIES        │        │   ADMINISTRATORS     │
│  (Mobile App Users)  │        │ (Authority Officers) │        │  (System Admins)     │
└──────────────┬───────┘        └──────────────┬───────┘        └──────────────┬───────┘
               │                              │                              │
               │ HTTPS/TLS                    │ HTTPS/TLS                    │ HTTPS/TLS
               │                              │                              │
               ▼                              ▼                              ▼
        ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
        │  FLUTTER MOBILE │          │  REACT WEB      │          │  REACT ADMIN    │
        │     APP         │          │   DASHBOARD     │          │   DASHBOARD     │
        │                 │          │                 │          │                 │
        │ • Camera Input  │          │ • Map View      │          │ • User Mgmt     │
        │ • GPS Tracking  │          │ • Verification  │          │ • Analytics     │
        │ • Image Upload  │          │ • Task Assign   │          │ • Reports       │
        │ • Real-time Map │          │ • Progress Track│          │ • Settings      │
        │ • Notifications │          │ • Statistics    │          │ • Monitoring    │
        └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
                 │                           │                            │
                 └───────────────────────────┼────────────────────────────┘
                                             │
                        ┌────────────────────▼────────────────────┐
                        │   API GATEWAY & LOAD BALANCER           │
                        │  (Render.com / AWS)                     │
                        └────────────────────┬────────────────────┘
                                             │
                ┌────────────────────────────┼────────────────────────────┐
                │                            │                            │
                ▼                            ▼                            ▼
        ┌─────────────────┐        ┌──────────────────┐        ┌──────────────────┐
        │  NODE.JS/       │        │  PYTHON FLASK    │        │  WEBSOCKET       │
        │  EXPRESS.JS API │        │  AI SERVICE      │        │  SERVER          │
        │                 │        │                  │        │                  │
        │ • Auth Service  │        │ • Image Analysis │        │ • Real-time      │
        │ • Pothole CRUD  │        │ • AI Detection   │        │   Updates        │
        │ • Repair Mgmt   │        │ • Dimension Est  │        │ • Notifications  │
        │ • Analytics API │        │ • Severity Class │        │ • Live Status    │
        │ • User Mgmt     │        │ • Confidence     │        │                  │
        │ • Report Gen    │        │                  │        │                  │
        └────────┬────────┘        └────────┬─────────┘        └────────┬─────────┘
                 │                          │                           │
                 └──────────────┬───────────┴───────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
    ┌─────────────┐       ┌──────────────┐      ┌────────────────┐
    │ PostgreSQL  │       │    Redis     │      │   Firebase     │
    │  DATABASE   │       │    CACHE     │      │   Services     │
    │             │       │              │      │                │
    │ • Users     │       │ • Sessions   │      │ • Auth         │
    │ • Potholes  │       │ • Notifs     │      │ • Cloud Store  │
    │ • Repairs   │       │ • Analytics  │      │ • Firestore    │
    │ • Updates   │       │ • Real-time  │      │                │
    │ • Analytics │       │   Data       │      │                │
    └─────────────┘       └──────────────┘      └────────────────┘
                                │
                                ▼
                        ┌──────────────────┐
                        │   AWS S3 STORAGE │
                        │                  │
                        │ • Images         │
                        │ • Backups        │
                        │ • Archives       │
                        │ • Logs           │
                        └──────────────────┘
```

---

## 2. DETAILED CLIENT-SIDE BLOCK DIAGRAM

```
┌───────────────────────────────────────��───────────────────────────┐
│                    FLUTTER MOBILE APPLICATION                     │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   USER LAYER    │  │   UI LAYER   │  │  STATE MANAGEMENT  │  │
│  │                 │  │              │  │                    │  │
│  │ • Login Screen  │  │ • Widgets    │  │ • Provider         │  │
│  │ • Dashboard     │  │ • Navigation │  │ • State Models     │  │
│  │ • Report Screen │  │ • Forms      │  │ • Data Binding     │  │
│  │ • Map Screen    │  │ • Maps       │  │ • Event Handling   │  │
│  │ • History       │  │ • Animations │  │ • Cache Mgmt       │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬───────────┘  │
│           │                  │                   │              │
│           └──────────────────┼───────────────────┘              │
│                              │                                   │
│  ┌───────────────────────────▼─────────────────────────┐         │
│  │         SERVICE & BUSINESS LOGIC LAYER             │         │
│  │                                                    │         │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │         │
│  │ │ Auth Service │  │ Pothole Svc  │  │GPS/Camera│ │         │
│  │ │ • Login      │  │ • Report     │  │ • Capture│ │         │
│  │ │ • Signup     │  │ • Fetch      │  │ • Track  │ │         │
│  │ │ • Logout     │  │ • Update     │  │ • Upload │ │         │
│  │ │ • Token Mgmt │  │ • Delete     │  │ • Compress│         │
│  │ └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │         │
│  └────────┼──────────────────┼─────────────────┼──────┘         │
│           │                  │                │                 │
│  ┌────────▼──────────────────▼────────────────▼──────┐          │
│  │      HTTP/HTTPS CLIENT & API INTEGRATION         │          │
│  │                                                  │          │
│  │ • Dio HTTP Library                             │          │
│  │ • Request Interceptors                         │          │
│  │ • Response Parsing                             │          │
│  │ • Error Handling                               │          │
│  │ • Retry Logic                                  │          │
│  │ • Timeout Management                           │          │
│  └────────────┬─────────────────────────────────────┘          │
│               │                                                  │
│  ┌────────────▼──────────────────────────────────┐              │
│  │    LOCAL STORAGE & CACHING LAYER             │              │
│  │                                              │              │
│  │ • SharedPreferences (User Data)             │              │
│  │ • Secure Storage (Tokens/Passwords)        │              │
│  │ • Local Cache (Images)                     │              │
│  │ • Database (SQLite)                        │              │
│  │ • File System (Temporary Images)           │              │
│  └────────────┬───────────────────────────────┘              │
│               │                                               │
└───────────────┼───────────────────────────────────────────────┘
                │
                │ HTTPS/REST API Calls
                ▼
        [BACKEND API SERVER]
```

---

## 3. BACKEND API BLOCK DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS/EXPRESS.JS API SERVER                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │               MIDDLEWARE LAYER                             │         │
│  │                                                            │         │
│  │ • CORS Handler       • Authentication        • Validators │         │
│  │ • Error Handler      • Rate Limiter          • Loggers   │         │
│  │ • Request Parser     • Session Manager       • Cache     │         │
│  └────────┬─────────────────────────────────────────────────┘         │
│           │                                                            │
│  ┌────────▼────────────────────────────────────────────────────┐      │
│  │            ROUTE HANDLERS / CONTROLLERS                    │      │
│  │                                                            │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │      │
│  │  │ Auth Routes  │  │Pothole Routes│  │ Repair Routes  │ │      │
│  │  │              │  │              │  │                │ │      │
│  │  │ POST/signup  │  │POST/report   │  │POST/assign     │ │      │
│  │  │ POST/login   │  │GET/list      │  │PATCH/status    │ │      │
│  │  │ POST/logout  │  │GET/:id       │  │GET/progress    │ │      │
│  │  │ GET/profile  │  │PATCH/update  │  │GET/history     │ │      │
│  │  │ PUT/settings │  │DELETE/:id    │  │PUT/details     │ │      │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │      │
│  │         │                 │                   │          │      │
│  │  ┌──────▼─────┐  ┌────────▼───────┐  ┌───────▼──────┐  │      │
│  │  │ User Routes│  │Analytics Routes│  │ Notify Routes│  │      │
│  │  │            │  │                │  │              │  │      │
│  │  │GET/users   │  │GET/stats       │  │POST/send     │  │      │
│  │  │POST/create │  │GET/trends      │  │GET/user-notifs  │      │
│  │  │PATCH/update│  │GET/reports     │  │PUT/mark-read │  │      │
│  │  │DELETE/user │  │GET/citymetrics │  │DELETE/clear  │  │      │
│  │  └────────────┘  └────────────────┘  └──────────────┘  │      │
│  └────────┬──────────────────────────��───────────────────┘  │      │
│           │                                                  │      │
│  ┌────────▼─────────────────────────────────────────────┐   │      │
│  │         SERVICE & BUSINESS LOGIC LAYER              │   │      │
│  │                                                     │   │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │      │
│  │  │Auth Service  │  │Pothole Service  │AI Service   │   │      │
│  │  │              │  │              │  │          │ │   │      │
│  │  │• JWT Mgmt    │  │• Validation  │  │• Detection  │   │      │
│  │  │• Password    │  │• Creation    │  │• Dimension  │   │      │
│  │  │  Hash        │  │• Updates     │  │• Severity   │   │      │
│  │  │• RBAC        │  │• Status Mgmt │  │• Confidence │   │      │
│  │  │• Sessions    │  │• Filtering   │  │             │ │   │      │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬────────┘   │      │
│  │         │                 │               │            │      │
│  │  ┌──────▼──────────────────▼───────────────▼──────────┐ │      │
│  │  │        DATA ACCESS LAYER (REPOSITORIES)           │ │      │
│  │  │                                                   │ │      │
│  │  │ • User Repository   • Pothole Repository        │ │      │
│  │  │ • Repair Repository • Notification Repository   │ │      │
│  │  │ • Analytics Repository • Audit Repository       │ │      │
│  │  └──────┬────────────────────────────────────────┘ │      │
│  └─────────┼──────────────────────────────────────────┘ │      │
│            │                                             │      │
└────────────┼─────────────────────────────────────────────┘      │
             │                                                    │
             │ Database Queries                                  │
             ▼                                                    │
      [DATABASE LAYER]                                            │
```

---

## 4. AI/ML SERVICE BLOCK DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────┐
│              PYTHON FLASK AI/ML MICROSERVICE                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │           INPUT VALIDATION & PREPROCESSING              │       │
│  │                                                         │       │
│  │ • Image Format Validation (JPEG, PNG)                  │       │
│  │ • Size Validation (Min/Max dimensions)                 │       │
│  │ • File Size Check                                      │       │
│  │ • MIME Type Verification                              │       │
│  │ • Malware Scanning                                     │       │
│  └────────────┬──────────────────────────────────────────┘       │
│               │                                                   │
│  ┌────────────▼──────────────────────────────────────────┐        │
│  │      IMAGE PREPROCESSING PIPELINE                     │        │
│  │                                                       │        │
│  │ ┌─────────────────────────────────────────────────┐  │        │
│  │ │ 1. IMAGE LOADING & DECODING                    │  │        │
│  │ │    • Read image file (OpenCV imread)           │  │        │
│  │ │    • Color space conversion                    │  │        │
│  │ │    • Format normalization                      │  │        │
│  │ └─────────────┬───────────────────────────────────┘  │        │
│  │               │                                       │        │
│  │ ┌─────────────▼───────────────────────────────────┐  │        │
│  │ │ 2. NOISE REDUCTION                             │  │        │
│  │ │    • Gaussian Blur (kernel=5x5)                │  │        │
│  │ │    • Bilateral Filtering                       │  │        │
│  │ │    • Morphological Operations                  │  │        │
│  │ └─────────────┬───────────────────────────────────┘  │        │
│  │               │                                       │        │
│  │ ┌─────────────▼───────────────────────────────────┐  │        │
│  │ │ 3. CONTRAST ENHANCEMENT                        │  │        │
│  │ │    • Histogram Equalization                    │  │        │
│  │ │    • CLAHE (Adaptive Histogram)                │  │        │
│  │ │    • Brightness/Contrast Adjustment           │  │        │
│  │ └─────────────┬───────────────────────────────────┘  │        │
│  │               │                                       │        │
│  │ ┌─────────────▼───────────────────────────────────┐  │        │
│  │ │ 4. EDGE DETECTION & THRESHOLDING              │  │        │
│  │ │    • Canny Edge Detection                      │  │        │
│  │ │    • Sobel Filter Application                  │  │        │
│  │ │    • Binary Thresholding (Otsu's method)      │  │        │
│  │ │    • Adaptive Thresholding                     │  │        │
│  │ └─────────────┬───────────────────────────────────┘  │        │
│  │               │                                       │        │
│  │ ┌─────────────▼───────────────────────────────────┐  │        │
│  │ │ 5. CONTOUR DETECTION & EXTRACTION             │  │        │
│  │ │    • Find Contours                             │  │        │
│  │ │    • Sort by Area (Largest first)             │  │        │
│  │ │    • Filter by Size Constraints               │  │        │
│  │ │    • Approximate Contour Polygons             │  │        │
│  │ └─────────────┬───────────────────────────────────┘  │        │
│  └────────────────┼──────────────────────────────────────┘        │
│                   │                                                │
│  ┌────────────────▼──────────────────────────────────────┐        │
│  │          MODEL INFERENCE LAYER                       │        │
│  │                                                      │        │
│  │ ┌──────────────────────────────────────────────┐    │        │
│  │ │ YOLO V8 OBJECT DETECTION MODEL              │    │        │
│  │ │ • Model Load (Trained weights)              │    │        │
│  │ │ • Inference on preprocessed image           │    │        │
│  │ │ • Detect pothole bounding boxes             │    │        │
│  │ │ • Extract confidence scores                 │    │        │
│  │ │ • Filter detections (confidence > 0.5)     │    │        │
│  │ └────────────┬─────────────────────────────────┘    │        │
│  │              │                                       │        │
│  │ ┌────────────▼──────────────────────────────────┐   │        │
│  │ │ CNN SEVERITY CLASSIFICATION                  │   │        │
│  │ │ • ResNet50 pretrained model                 │   │        │
│  │ │ • Classify as: Low/Medium/High/Critical     │   │        │
│  │ │ • Output probability for each class         │   │        │
│  │ └────────────┬──────────────────────────────────┘   │        │
│  │              │                                       │        │
│  │ ┌────────────▼──────────────────────────────────┐   │        │
│  │ │ SEMANTIC SEGMENTATION                        │   │        │
│  │ │ • U-Net model for pixel-level segmentation  │   │        │
│  │ │ • Precise pothole boundary identification   │   │        │
│  │ │ • Area calculation from segmentation mask   │   │        │
│  │ └────────────┬──────────────────────────────────┘   │        │
│  └────────────────┼───────────────────────────────────┘        │
│                   │                                              │
│  ┌────────────────▼───────────────────────────────────┐        │
│  │         DIMENSION ESTIMATION & CALCULATION        │        │
│  │                                                   │        │
│  │ ┌─────────────────────────────────────────────┐  │        │
│  │ │ Bounding Box Analysis                      │  │        │
│  │ │ • Extract box coordinates (x,y,w,h)       │  │        │
│  │ │ • Calculate pixel-level dimensions        │  │        │
│  │ │ • Apply road surface scaling factors      │  │        │
│  │ └──────────────┬──────────────────────────────┘  │        │
│  │                │                                 │        │
│  │ ┌──────────────▼──────────────────────────────┐  │        │
│  │ │ Severity Scoring Algorithm                 │  │        │
│  │ │ • Area-based scoring                       │  │        │
│  │ │ • Depth estimation from shadow analysis   │  │        │
│  │ │ • Damage pattern assessment               │  │        │
│  │ │ • Priority ranking (0-100 scale)          │  │        │
│  │ └──────────────┬──────────────────────────────┘  │        │
│  │                │                                 │        │
│  │ ┌──────────────▼──────────────────────────────┐  │        │
│  │ │ Confidence Score Generation                │  │        │
│  │ │ • Model confidence metrics                 │  │        │
│  │ │ • Combined score from multiple models      │  │        │
│  │ │ • Quality assurance threshold check        │  │        │
│  │ └──────────────┬──────────────────────────────┘  │        │
│  └─────────────────┼──────────────────────────────┘        │
│                    │                                        │
│  ┌─────────────────▼──────────────────────────────┐       │
│  │        OUTPUT FORMATTING & JSON RESPONSE      │       │
│  │                                               │       │
│  │ {                                             │       │
│  │   "success": true,                            │       │
│  │   "detections": [                             │       │
│  │     {                                         │       │
│  │       "id": "pothole_001",                   │       │
│  │       "bbox": {...},                         │       │
│  │       "width": 45.5,                         │       │
│  │       "depth": 12.3,                         │       │
│  │       "area": 520.5,                         │       │
│  │       "severity": "High",                    │       │
│  │       "confidence": 0.92                     │       │
│  │     }                                         │       │
│  │   ]                                           │       │
│  │ }                                             │       │
│  └─────────────┬────────────────────────────────┘       │
│                │                                         │
└────────────────┼──────────────────────────────────────────┘
                 │
                 │ JSON Response
                 ▼
        [NODE.JS API SERVER]
```

---

## 5. DATABASE LAYER BLOCK DIAGRAM

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │              PRIMARY DATABASE (PostgreSQL)                │         │
│  │                                                           │         │
│  │  ┌──────────────────────────────────────────────────┐    │         │
│  │  │ Users Table                                      │    │         │
│  │  │ • id (PK) | email | password_hash              │    │         │
│  │  │ • first_name | last_name | user_type           │    │         │
│  │  │ • phone | profile_pic | is_active              │    │         │
│  │  │ • created_at | updated_at                      │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  │  ┌─────��────────────────────────────────────────────┐    │         │
│  │  │ Potholes Table                                   │    │         │
│  │  │ • id (PK) | reporter_id (FK) | latitude         │    │         │
│  │  │ • longitude | severity | description            │    │         │
│  │  │ • image_url | status | verified_by (FK)         │    │         │
│  │  │ • repair_priority | address | city              │    │         │
│  │  │ • depth_estimate | width_estimate               │    │         │
│  │  │ • area_estimate | confidence_score              │    │         │
│  │  │ • created_at | updated_at                       │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  │  ┌──────────────────────────────────────────────────┐    │         │
│  │  │ Pothole_Updates Table                           │    │         │
│  │  │ • id (PK) | pothole_id (FK) | updated_by (FK)   │    │         │
│  │  │ • status | comment | image_url                  │    │         │
│  │  │ • progress_percentage                           │    │         │
│  │  │ • created_at                                    │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  │  ┌──────────────────────────────────────────────────┐    │         │
│  │  │ Repairs Table                                    │    │         │
│  │  │ • id (PK) | pothole_id (FK) | assigned_to (FK)  │    │         │
│  │  │ • start_date | end_date | status                │    │         │
│  │  │ • estimated_cost | actual_cost                  │    │         │
│  │  │ • materials_used | notes | completed_at         │    │         │
│  │  │ • before_image_url | after_image_url            │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  │  ┌──────────────────────────────────────────────────┐    │         │
│  │  │ Notifications Table                              │    │         │
│  │  │ • id (PK) | user_id (FK) | pothole_id (FK)      │    │         │
│  │  │ • type | message | is_read | created_at         │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  │  ┌──────────────────────────────────────────────────┐    │         │
│  │  │ Analytics Table                                  │    │         │
│  │  │ • id (PK) | date | city | total_potholes        │    │         │
│  │  │ • repaired_count | avg_repair_time              │    │         │
│  │  │ • total_cost | statistics_json                  │    │         │
│  │  └──────────────────────────────────────────────────┘    │         │
│  │                                                           │         │
│  └────────────┬─────────────────────────────────────────────┘         │
│               │                                                         │
│  ┌────────────▼──────────────────────────────────────┐                │
│  │    CACHING LAYER (Redis)                         │                │
│  │                                                  │                │
│  │ • User Sessions (TTL: 24 hours)                 │                │
│  │ • Pothole Cache (TTL: 1 hour)                   │                │
│  │ • Analytics Cache (TTL: 15 minutes)             │                │
│  │ • Real-time Notifications Queue                 │                │
│  │ • Rate Limiting Counters                        │                │
│  │ • API Response Cache                            │                │
│  └────────────┬──────────────────────────────────────┘               │
│               │                                                       │
│  ┌────────────▼──────────────────────────────────────┐               │
│  │    FILE STORAGE (AWS S3 / Cloud Storage)         │               │
│  │                                                  │                │
│  │ • /potholes/{id}/original/                      │                │
│  │ • /potholes/{id}/processed/                     │                │
│  │ • /potholes/{id}/thumbnails/                    │                │
│  │ • /repairs/{id}/before/                         │                │
│  │ • /repairs/{id}/after/                          │                │
│  │ • /backups/{date}/                              │                │
│  │ • /logs/{date}/                                 │                │
│  │ • /exports/{user_id}/                           │                │
│  └────────────────────────────────────────────────────┘              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 6. COMPLETE SYSTEM DATA FLOW DIAGRAM

```
USER INITIATES POTHOLE REPORT
           │
           ▼
    ┌─────────────────┐
    │ Flutter Mobile  │
    │ App             │
    │ • Capture Image │
    │ • Get GPS Coords│
    │ • Enter Details │
    └────────┬────────┘
             │
             │ HTTPS POST /api/potholes/report
             │ (Image + Metadata)
             ▼
    ┌─────────────────────────────┐
    │ Express.js API Gateway      │
    │ • Validate Request          │
    │ • Authentication Check      │
    │ • Store in DB               │
    └────────┬────────────────────┘
             │
        ┌────┴────┐
        │          │
        ▼          ▼
   ┌─────────┐  ┌──────────────┐
   │PostgreSQL  │ AWS S3       │
   │ (Save     │ (Store Image)│
   │  Metadata)│              │
   └─────┬─────┘  └──────────┬─┘
         │                    │
         │                    │ Image URL
         │                    │
         └────────┬───────────┘
                  │
                  ▼
    ┌──────────────────────────────┐
    │ Python Flask AI Service      │
    │ • Receive Image              │
    │ • Process & Extract Features │
    │ • Run YOLO Detection         │
    │ • Calculate Dimensions       │
    │ • Estimate Severity          │
    └────────┬─────────────────────┘
             │ JSON Response
             │ {detections, dimensions}
             ▼
    ┌─────────────────────────────────┐
    │ Express.js API                  │
    │ • Receive AI Results            │
    │ • Update Pothole Record         │
    │ • Trigger Notifications         │
    │ • Broadcast via WebSocket       │
    └────────┬────────────────────────┘
             │
        ┌────┼────────────┐
        │    │            │
        ▼    ▼            ▼
    ┌──────┐  ┌────────┐  ┌─────────────┐
    │Redis │  │Postgres│  │Redis Queue  │
    │Cache │  │Update  │  │(Notifs)     │
    └────┬─┘  └───┬────┘  └──────┬──────┘
         │        │             │
         │        │    ┌────────┴────────┐
         │        │    │                 │
         ▼        ▼    ▼                 ▼
    ┌─────────────────────┐      ┌────────────────┐
    │ React Web Dashboard │      │ Flutter Mobile │
    │ • Show in Real-time │      │ • Push Notif   │
    │   Map               │      │ • Update List  │
    └─────────────────────┘      └────────────────┘

AUTHORITY VERIFIES POTHOLE
         │
         ▼
    ┌──────────────────────────┐
    │ React Web Dashboard      │
    │ • Click Verify Button    │
    │ • Review AI Results      │
    │ • Add Authority Comments │
    └─────────┬────────────────┘
              │
              │ HTTPS PATCH /api/potholes/{id}/verify
              ▼
         ┌─────────────────┐
         │ Express.js API  │
         │ • Update Status │
         │ • Trigger Tasks │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ PostgreSQL      │
         │ Update Pothole  │
         │ Status=verified ��
         └────────┬────────┘
                  │
              ┌───┴──────────────┐
              │                  │
              ▼                  ▼
        ┌─────────────┐   ┌──────────────┐
        │Redis Queue  │   │ Redis Cache  │
        │(Repair Task)│   │(Invalidate)  │
        └─────┬───────┘   └──────┬───────┘
              │                  │
              │                  ▼
              │          ┌──────────────────┐
              │          │ Flutter Mobile   │
              │          │ Push Notification│
              │          └──────────────────┘
              │
              ▼
    ┌────────────────────────────┐
    │ Work Assignment System     │
    │ • Create Repair Task       │
    │ • Assign to Field Crew     │
    │ • Send Notifications       │
    └────────────────────────────┘
```

---

## 7. SECURITY & ENCRYPTION FLOW

```
┌─────────────────────────────────────────────────────────┐
│           SECURITY & ENCRYPTION ARCHITECTURE           │
└─────────────────────────────────────────────────────────┘

CLIENT REQUEST
       │
       ▼
┌──────────────────────────────┐
│ TLS/SSL Encryption Layer     │
│ • HTTPS Protocol             │
│ • TLS 1.3                    │
│ • Certificate Pinning        │
└──────────────────┬───────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ API Gateway         │
        │ • Rate Limiting     │
        │ • DDoS Protection   │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Request Validation  │
        │ • JWT Verification  │
        │ • CORS Check        │
        │ • Input Sanitization│
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Authentication      │
        │ • JWT Token Parse   │
        │ • User Lookup       │
        │ • Role Verification │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │ Authorization (RBAC)    │
        │ • Check User Permissions│
        │ • Resource Access Check │
        └────────┬────────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │ Request Processing       │
        │ • Decrypt Sensitive Data │
        │ • Execute Logic          │
        └────────┬─────────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │ Database Operations      │
        │ • Parameterized Queries  │
        │ • Connection Encryption  │
        │ • AES-256 Data Storage   │
        └────────┬─────────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │ Response Encryption      │
        │ • Encrypt Sensitive Data │
        │ • Add Security Headers   │
        │ • HSTS, X-Frame, CSP     │
        └────────┬─────────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │ TLS Transmission         │
        │ • HTTPS Response         │
        │ • End-to-End Encryption  │
        └──────────────────────────┘
```

---

## 8. DEPLOYMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────────┐
│              CLOUD DEPLOYMENT ARCHITECTURE                  │
└──────────────────────────────────────────────────────────────┘

INTERNET
   │
   │ ┌──────────────────────────────────┐
   └─┤ Cloudflare CDN & DDoS Protection │
     └──────────────┬───────────────────┘
                    │
                    ▼
       ┌────────────────────────────┐
       │ Load Balancer (AWS/GCP)    │
       │ • Traffic Distribution     │
       │ • SSL Termination          │
       │ • Health Checks            │
       └────────────┬───────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
   ┌──────────┐            ┌──────────┐
   │API Server│            │AI Service│
   │Instance 1│            │Instance 1│
   └────┬─────┘            └────┬─────┘
        │                       │
   ┌────▼────────────────────────▼────┐
   │    Docker Container Layer         │
   │ • Node.js with Express.js         │
   │ • Python Flask with ML            │
   │ • Environment Config              │
   └────┬──────────────────────────────┘
        │
   ┌────▼──────────────────────┐
   │  Kubernetes Orchestration  │
   │ • Auto Scaling             │
   │ • Self-Healing             │
   │ • Rolling Updates          │
   └────┬──────────────────────┘
        │
   ┌────┴───────────────────────┐
   │                            │
   ▼                            ▼
┌─────────────┐         ┌──────────────┐
│ PostgreSQL  │         │ Redis Cluster│
│ Master      │         │ (Replicated) │
│ + Replicas  │         │              │
└─────────────┘         └──────────────┘
   │
   ▼
┌─────────────────────────────────┐
│ AWS S3 / Cloud Storage          │
│ • Multi-region Backup           │
│ • Image Archive                 │
│ • Access Logging                │
└─────────────────────────────────┘

MONITORING & LOGGING
   │
   ├─ Prometheus (Metrics)
   ├─ Grafana (Visualization)
   ├─ ELK Stack (Logs)
   ├─ Sentry (Error Tracking)
   └─ DataDog (APM)
```

---

## 📊 SUMMARY

This **complete block diagram system** shows:

✅ **Layered Architecture** - Separation of concerns  
✅ **Data Flow** - How information moves through the system  
✅ **Security** - Encryption and authentication layers  
✅ **AI Integration** - Image processing pipeline  
✅ **Database Design** - Structured data management  
✅ **Cloud Deployment** - Scalable infrastructure  
✅ **Monitoring** - System health and performance  

**Ready to start building?** 🚀
