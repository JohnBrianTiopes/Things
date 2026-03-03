const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const http = require('http');


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);


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

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const registerCrudRoutes = ({ pathName, tableName, columns, requiredFields = [] }) => {
  app.get(`/api/${pathName}/`, async (req, res) => {
    try {
      const rows = await dbAll(`SELECT * FROM ${tableName} ORDER BY id DESC`);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: `Failed to fetch ${pathName}` });
    }
  });

  app.post(`/api/${pathName}/`, async (req, res) => {
    try {
      const payload = req.body || {};
      const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');

      if (missing.length > 0) {
        return res.status(400).json({ success: false, error: `Missing required fields: ${missing.join(', ')}` });
      }

      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map((column) => payload[column] ?? null);
      const result = await dbRun(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );

      res.status(201).json({ success: true, id: result.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: `Failed to create ${pathName}` });
    }
  });

  app.put(`/api/${pathName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body || {};

      const providedColumns = columns.filter((column) => Object.prototype.hasOwnProperty.call(payload, column));
      if (providedColumns.length === 0) {
        return res.status(400).json({ success: false, error: 'No fields provided for update' });
      }

      const setClause = providedColumns.map((column) => `${column} = ?`).join(', ');
      const values = providedColumns.map((column) => payload[column]);
      const result = await dbRun(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, [...values, id]);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: `${pathName} record not found` });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: `Failed to update ${pathName}` });
    }
  });

  app.delete(`/api/${pathName}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await dbRun(`DELETE FROM ${tableName} WHERE id = ?`, [id]);

      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: `${pathName} record not found` });
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: `Failed to delete ${pathName}` });
    }
  });
};

registerCrudRoutes({
  pathName: 'farms',
  tableName: 'farms',
  columns: ['name', 'location'],
  requiredFields: ['name']
});

registerCrudRoutes({
  pathName: 'farmer',
  tableName: 'farmer',
  columns: ['name', 'farm_id', 'role', 'salary', 'contact_info'],
  requiredFields: ['name']
});

registerCrudRoutes({
  pathName: 'planting_batch',
  tableName: 'planting_batch',
  columns: ['farm_id', 'crop_variety_id', 'tomato_type', 'planting_date', 'expected_harvest_date'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'production',
  tableName: 'production',
  columns: ['farm_id', 'planting_batch_id', 'production_date', 'yield_quantity_kg', 'notes'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'harvests',
  tableName: 'harvests',
  columns: ['farm_id', 'harvest_date', 'quantity_kg', 'quality', 'notes'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'equipment',
  tableName: 'equipment',
  columns: ['name', 'farm_id', 'purchase_date', 'last_maintenance_date', 'next_maintenance_date', 'status'],
  requiredFields: ['name']
});

registerCrudRoutes({
  pathName: 'supplies',
  tableName: 'supplies',
  columns: ['name', 'description', 'unit_cost', 'quantity_on_hand'],
  requiredFields: ['name']
});

registerCrudRoutes({
  pathName: 'farm_supplies',
  tableName: 'farm_supplies',
  columns: ['farm_id', 'supply_id', 'quantity_used', 'date_used'],
  requiredFields: ['farm_id', 'supply_id']
});

registerCrudRoutes({
  pathName: 'financial_record',
  tableName: 'financial_record',
  columns: ['farm_id', 'record_date', 'income', 'expenses', 'net_profit_loss'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'agent_conversation',
  tableName: 'agent_conversation',
  columns: ['owner_user_id', 'title', 'last_message_at']
});

registerCrudRoutes({
  pathName: 'agent_messages',
  tableName: 'agent_messages',
  columns: ['conversation_id', 'role', 'content'],
  requiredFields: ['conversation_id']
});

registerCrudRoutes({
  pathName: 'pest_disease_event',
  tableName: 'pest_disease_event',
  columns: ['farm_id', 'planting_batch_id', 'event_date', 'issue_type', 'treatment_applied'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'event_log',
  tableName: 'event_log',
  columns: ['user_id', 'account_id', 'action', 'metadata']
});

registerCrudRoutes({
  pathName: 'weather_log',
  tableName: 'weather_log',
  columns: ['farm_id', 'log_date', 'temperature_celsius', 'humidity_percentage', 'precipitation_mm', 'wind_speed_kmh'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'sales',
  tableName: 'sales',
  columns: ['farm_id', 'harvest_id', 'sales_date', 'customer_name', 'quantity_kg', 'revenue'],
  requiredFields: ['farm_id']
});

registerCrudRoutes({
  pathName: 'crop_varieties',
  tableName: 'crop_varieties',
  columns: ['name', 'description', 'ideal_climate', 'average_yield_kg_per_hectare'],
  requiredFields: ['name']
});

app.get('/api/account/', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT
        id AS account_id,
        name AS account_name,
        description,
        location,
        created_at
      FROM accounts
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.post('/api/account/', async (req, res) => {
  try {
    const { name, account_name, description, location } = req.body || {};
    const finalName = name || account_name;

    if (!finalName) {
      return res.status(400).json({ success: false, error: 'Missing required field: name' });
    }

    const result = await dbRun(
      'INSERT INTO accounts (name, description, location) VALUES (?, ?, ?)',
      [finalName, description || null, location || null]
    );

    res.status(201).json({ success: true, id: result.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

app.put('/api/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, account_name, description, location } = req.body || {};
    const finalName = name || account_name;

    if (!finalName) {
      return res.status(400).json({ success: false, error: 'Missing required field: name' });
    }

    const result = await dbRun(
      'UPDATE accounts SET name = ?, description = ?, location = ? WHERE id = ?',
      [finalName, description || null, location || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ success: false, error: 'Cannot update account with existing users or related records' });
    }
    res.status(500).json({ success: false, error: 'Failed to update account' });
  }
});

app.delete('/api/account/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM accounts WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ success: false, error: 'Cannot delete account with existing users or related records' });
    }
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

app.get('/api/user/', async (req, res) => {
  try {
    const rows = await dbAll(`
      SELECT
        id AS user_id,
        created_at,
        name,
        email,
        account_id,
        role
      FROM users
      ORDER BY id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/user/', async (req, res) => {
  try {
    const { name, email, password, account_id, role } = req.body || {};

    if (!name || !email || !password || !account_id || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const parsedAccountId = Number.parseInt(account_id, 10);
    if (Number.isNaN(parsedAccountId) || parsedAccountId <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid account_id' });
    }

    const accountExists = await dbGet('SELECT id FROM accounts WHERE id = ?', [parsedAccountId]);
    if (!accountExists) {
      return res.status(404).json({ success: false, error: 'Account not found for account_id' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await dbRun(
      `INSERT INTO users (name, email, password_hash, account_id, role) VALUES (?, ?, ?, ?, ?)`,
      [name, email, passwordHash, parsedAccountId, role]
    );

    res.status(201).json({ success: true, id: result.id });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ success: false, error: 'Invalid foreign key or duplicate data' });
    }
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

app.put('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, account_id } = req.body || {};

    const parsedAccountId = Number.parseInt(account_id, 10);
    if (Number.isNaN(parsedAccountId) || parsedAccountId <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid account_id' });
    }

    const accountExists = await dbGet('SELECT id FROM accounts WHERE id = ?', [parsedAccountId]);
    if (!accountExists) {
      return res.status(404).json({ success: false, error: 'Account not found for account_id' });
    }

    const result = await dbRun(
      `UPDATE users SET name = ?, email = ?, role = ?, account_id = ? WHERE id = ?`,
      [name, email, role, parsedAccountId, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    if (err && err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ success: false, error: 'Invalid foreign key or duplicate data' });
    }
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

app.delete('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dbRun('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

app.get('/api/accounts-users', async (req, res) => {
  try {
    const [accounts, users] = await Promise.all([
      dbAll(`
        SELECT
          id AS account_id,
          name AS account_name,
          description,
          location,
          created_at
        FROM accounts
        ORDER BY id DESC
      `),
      dbAll('SELECT id AS user_id, created_at, name, email, account_id, role FROM users ORDER BY id DESC')
    ]);
    res.json({ accounts, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch accounts and users data' });
  }
});

app.get('/api/farms-data', async (req, res) => {
  try {
    const [farms, farmer, planting_batch, production, harvests] = await Promise.all([
      dbAll('SELECT * FROM farms ORDER BY id DESC'),
      dbAll('SELECT * FROM farmer ORDER BY id DESC'),
      dbAll('SELECT * FROM planting_batch ORDER BY id DESC'),
      dbAll('SELECT * FROM production ORDER BY id DESC'),
      dbAll('SELECT * FROM harvests ORDER BY id DESC')
    ]);

    res.json({ farms, farmer, planting_batch, production, harvests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch farms data' });
  }
});

app.get('/api/resource-finance', async (req, res) => {
  try {
    const [equipment, supplies, farm_supplies, financial_record] = await Promise.all([
      dbAll('SELECT * FROM equipment ORDER BY id DESC'),
      dbAll('SELECT * FROM supplies ORDER BY id DESC'),
      dbAll('SELECT * FROM farm_supplies ORDER BY id DESC'),
      dbAll('SELECT * FROM financial_record ORDER BY id DESC')
    ]);

    res.json({ equipment, supplies, farm_supplies, financial_record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resource and finance data' });
  }
});

app.get('/api/logs-monitoring', async (req, res) => {
  try {
    const [agent_conversation, agent_messages, pest_disease_event, event_log, weather_log] = await Promise.all([
      dbAll('SELECT * FROM agent_conversation ORDER BY id DESC'),
      dbAll('SELECT * FROM agent_messages ORDER BY id DESC'),
      dbAll('SELECT * FROM pest_disease_event ORDER BY id DESC'),
      dbAll('SELECT * FROM event_log ORDER BY id DESC'),
      dbAll('SELECT * FROM weather_log ORDER BY id DESC')
    ]);

    res.json({ agent_conversation, agent_messages, pest_disease_event, event_log, weather_log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monitoring and logs data' });
  }
});

app.get('/api/sales-crops', async (req, res) => {
  try {
    const [planting_batch, production, harvests, sales, crop_varieties] = await Promise.all([
      dbAll('SELECT * FROM planting_batch ORDER BY id DESC'),
      dbAll('SELECT * FROM production ORDER BY id DESC'),
      dbAll('SELECT * FROM harvests ORDER BY id DESC'),
      dbAll('SELECT * FROM sales ORDER BY id DESC'),
      dbAll('SELECT * FROM crop_varieties ORDER BY id DESC')
    ]);

    res.json({ planting_batch, production, harvests, sales, crop_varieties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales and crops data' });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

httpServer.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing process or run with a different PORT.`);
    process.exit(1);
  }

  console.error('Server startup error:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  httpServer.close(() => {
    db.close(() => {
      process.exit(0);
    });
  });
});
