-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  user_type ENUM('citizen', 'authority', 'admin') DEFAULT 'citizen',
  profile_picture VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Potholes table
CREATE TABLE IF NOT EXISTS potholes (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  description TEXT,
  image_url VARCHAR(500),
  status ENUM('reported', 'verified', 'in_progress', 'repaired', 'rejected') DEFAULT 'reported',
  verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  repair_priority INTEGER DEFAULT 0,
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Pothole Updates table (for tracking repair progress)
CREATE TABLE IF NOT EXISTS pothole_updates (
  id SERIAL PRIMARY KEY,
  pothole_id INTEGER NOT NULL REFERENCES potholes(id) ON DELETE CASCADE,
  updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('reported', 'verified', 'in_progress', 'repaired', 'rejected') NOT NULL,
  comment TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pothole_id INTEGER REFERENCES potholes(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  total_potholes INTEGER DEFAULT 0,
  repaired_potholes INTEGER DEFAULT 0,
  avg_repair_time INTEGER DEFAULT 0,
  city VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_potholes_reporter ON potholes(reporter_id);
CREATE INDEX idx_potholes_status ON potholes(status);
CREATE INDEX idx_potholes_city ON potholes(city);
CREATE INDEX idx_potholes_location ON potholes(latitude, longitude);
CREATE INDEX idx_pothole_updates_pothole ON pothole_updates(pothole_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_users_email ON users(email);
