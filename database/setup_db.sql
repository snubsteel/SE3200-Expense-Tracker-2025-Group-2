-- Create database if it doesn't already exist and connect to database before creating extensions and tables
-- CREATE DATABASE tracker_db;
-- \c tracker_db

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    name VARCHAR(50),
    annual_income_cents INT CHECK (annual_income_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7),
    budget_type VARCHAR(10) NOT NULL DEFAULT 'need' CHECK (budget_type IN ('need', 'want')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, name)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount_cents INT NOT NULL CHECK (amount_cents > 0),
    currency CHAR(3) DEFAULT 'USD',
    occurred_on DATE NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_user_date ON expenses (user_id, occurred_on);
CREATE INDEX idx_expenses_user_category ON expenses (user_id, category_id);
