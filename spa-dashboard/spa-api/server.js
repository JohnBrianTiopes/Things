const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { uuid: uuidv4 } = require('uuidv4');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'spa.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log(`Connected to the database at ${dbPath}`);
    }
});

function initializeDatabase(database) {
  database.serialize(() => {
    database.exec('PRAGMA foreign_keys = ON;');

    const resetDb = String(process.env.RESET_DB || '').toLowerCase() === 'true';
    if (resetDb) {
      console.warn('RESET_DB=true set: dropping and recreating tables (data loss).');
      database.exec(`
        DROP TABLE IF EXISTS production;
        DROP TABLE IF EXISTS weather_log;
        DROP TABLE IF EXISTS equipment;
        DROP TABLE IF EXISTS sales;
        DROP TABLE IF EXISTS pest_disease_event;
        DROP TABLE IF EXISTS planting_batch;
        DROP TABLE IF EXISTS farmer;
        DROP TABLE IF EXISTS harvests;
        DROP TABLE IF EXISTS farm_supplies;
        DROP TABLE IF EXISTS supplies;
        DROP TABLE IF EXISTS financial_record;
        DROP TABLE IF EXISTS farms;
        DROP TABLE IF EXISTS agent_messages;
        DROP TABLE IF EXISTS agent_conversation;
        DROP TABLE IF EXISTS event_log;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS accounts;
        DROP TABLE IF EXISTS crop_varieties;
      `);
    }


    database.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        description TEXT,
        location TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        email TEXT,
        password_hash TEXT,
        account_id INTEGER,
        role TEXT,
        UNIQUE(email),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS event_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        account_id INTEGER,
        action TEXT,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS agent_conversation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        owner_user_id INTEGER,
        title TEXT,
        last_message_at DATETIME,
        FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS agent_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        conversation_id INTEGER NOT NULL,
        role TEXT,
        content TEXT,
        FOREIGN KEY (conversation_id) REFERENCES agent_conversation(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS farms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        location TEXT
      );

      CREATE TABLE IF NOT EXISTS financial_record (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        record_date DATETIME,
        income REAL,
        expenses REAL,
        net_profit_loss REAL,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        description TEXT,
        unit_cost REAL,
        quantity_on_hand INTEGER
      );

      CREATE TABLE IF NOT EXISTS farm_supplies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        supply_id INTEGER NOT NULL,
        quantity_used INTEGER,
        date_used DATETIME,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS harvests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        harvest_date DATETIME,
        quantity_kg REAL,
        quality TEXT,
        notes TEXT,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS farmer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        farm_id INTEGER,
        role TEXT,
        salary REAL,
        contact_info TEXT,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS crop_varieties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        description TEXT,
        ideal_climate TEXT,
        average_yield_kg_per_hectare REAL
      );

      CREATE TABLE IF NOT EXISTS planting_batch (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        crop_variety_id INTEGER,
        tomato_type TEXT,
        planting_date DATETIME,
        expected_harvest_date DATETIME,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (crop_variety_id) REFERENCES crop_varieties(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS pest_disease_event (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        planting_batch_id INTEGER,
        event_date DATETIME,
        issue_type TEXT,
        treatment_applied TEXT,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (planting_batch_id) REFERENCES planting_batch(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        harvest_id INTEGER,
        sales_date DATETIME,
        customer_name TEXT,
        quantity_kg REAL,
        revenue REAL,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (harvest_id) REFERENCES harvests(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        name TEXT,
        farm_id INTEGER,
        purchase_date DATETIME,
        last_maintenance_date DATETIME,
        next_maintenance_date DATETIME,
        status TEXT,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS weather_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        log_date DATETIME,
        temperature_celsius REAL,
        humidity_percentage REAL,
        precipitation_mm REAL,
        wind_speed_kmh REAL,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS production (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        farm_id INTEGER NOT NULL,
        planting_batch_id INTEGER,
        production_date DATETIME,
        yield_quantity_kg REAL,
        notes TEXT,
        FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
        FOREIGN KEY (planting_batch_id) REFERENCES planting_batch(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
      CREATE INDEX IF NOT EXISTS idx_event_log_user_id ON event_log(user_id);
      CREATE INDEX IF NOT EXISTS idx_event_log_account_id ON event_log(account_id);
      CREATE INDEX IF NOT EXISTS idx_financial_record_farm_id ON financial_record(farm_id);
      CREATE INDEX IF NOT EXISTS idx_farm_supplies_farm_id ON farm_supplies(farm_id);
      CREATE INDEX IF NOT EXISTS idx_farm_supplies_supply_id ON farm_supplies(supply_id);
      CREATE INDEX IF NOT EXISTS idx_harvests_farm_id ON harvests(farm_id);
      CREATE INDEX IF NOT EXISTS idx_sales_farm_id ON sales(farm_id);
      CREATE INDEX IF NOT EXISTS idx_sales_harvest_id ON sales(harvest_id);
      CREATE INDEX IF NOT EXISTS idx_weather_log_farm_id ON weather_log(farm_id);
      CREATE INDEX IF NOT EXISTS idx_production_farm_id ON production(farm_id);
    `, (err) => {
      if (err) {
        console.error('Error initializing schema:', err.message);
      } else {
        console.log('Database schema is ready.');
      }
    });
  });
}

initializeDatabase(db);