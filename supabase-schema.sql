-- Lucky Draw Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create ENUM types
CREATE TYPE role_type AS ENUM ('ADMIN', 'SUPERADMIN', 'MODERATOR');
CREATE TYPE contest_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');
CREATE TYPE draw_mode AS ENUM ('RANDOM', 'MANUAL', 'WEIGHTED');
CREATE TYPE prize_status AS ENUM ('PENDING', 'CLAIMED', 'SHIPPED');
CREATE TYPE message_type AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH');

-- Forms table
CREATE TABLE forms (
    form_id SERIAL PRIMARY KEY,
    form_name VARCHAR(150),
    form_schema JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Responses table
CREATE TABLE form_responses (
    response_id SERIAL PRIMARY KEY,
    form_id INT REFERENCES forms(form_id),
    response_data JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_type DEFAULT 'ADMIN',
    custom_role VARCHAR(150),
    permission_read BOOLEAN DEFAULT TRUE,
    permission_write BOOLEAN DEFAULT FALSE,
    permission_update BOOLEAN DEFAULT FALSE,
    two_factor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    extra_url VARCHAR(255)
);

-- Admin Activity Log table
CREATE TABLE admin_activity_log (
    log_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES admins(admin_id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_table VARCHAR(100),
    target_id INT,
    session_id VARCHAR(255),
    status VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contests table
CREATE TABLE contests (
    contest_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    theme VARCHAR(150),
    description TEXT,
    entry_form_id INT REFERENCES forms(form_id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    entry_rules JSONB,
    status contest_status DEFAULT 'UPCOMING',
    created_by INT REFERENCES admins(admin_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prizes table
CREATE TABLE prizes (
    prize_id SERIAL PRIMARY KEY,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    prize_name VARCHAR(150) NOT NULL,
    value NUMERIC(12,2),
    quantity INT DEFAULT 1 NOT NULL,
    description TEXT
);

-- Participants table
CREATE TABLE participants (
    participant_id SERIAL PRIMARY KEY,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    form_response_id INT REFERENCES form_responses(response_id),
    contact VARCHAR(150) NOT NULL,
    entry_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated BOOLEAN DEFAULT TRUE,
    unique_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(50),
    device_id VARCHAR(100)
);

-- Draws table
CREATE TABLE draws (
    draw_id SERIAL PRIMARY KEY,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    draw_mode draw_mode NOT NULL,
    executed_by INT REFERENCES admins(admin_id),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_winners INT NOT NULL
);

-- Winners table
CREATE TABLE winners (
    winner_id SERIAL PRIMARY KEY,
    draw_id INT REFERENCES draws(draw_id) ON DELETE CASCADE,
    participant_id INT REFERENCES participants(participant_id) ON DELETE CASCADE,
    prize_id INT REFERENCES prizes(prize_id) ON DELETE SET NULL,
    prize_status prize_status DEFAULT 'PENDING',
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    contest_id INT REFERENCES contests(contest_id) ON DELETE CASCADE,
    type message_type NOT NULL,
    recipient VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by INT REFERENCES admins(admin_id),
    is_auto BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you can customize these based on your needs)
-- Allow authenticated users to read contests
CREATE POLICY "Allow authenticated users to read contests" ON contests
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert participants
CREATE POLICY "Allow authenticated users to insert participants" ON participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to read participants
CREATE POLICY "Allow authenticated users to read participants" ON participants
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to read prizes
CREATE POLICY "Allow authenticated users to read prizes" ON prizes
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to read winners
CREATE POLICY "Allow authenticated users to read winners" ON winners
    FOR SELECT USING (auth.role() = 'authenticated');

-- You can add more specific policies based on your security requirements
