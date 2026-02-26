import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'admin_config.json');
const WHITELIST_FILE = path.join(DATA_DIR, 'whitelist.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

app.use(cors());
app.use(bodyParser.json());

// Helper to read/write users
const getUsers = () => {
    if (fs.existsSync(USERS_FILE)) {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    }
    return [];
};

const saveUsers = (users: any[]) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Default config
const DEFAULT_CONFIG = {
    licensePrice: 9.99,
    pixKey: 'messi@bol.com.br',
    supportEmail: 'messi@bol.com.br',
    supportWhatsapp: '47992126402',
    adminEmail: 'messi@bol.com.br'
};

// API Routes
app.get('/api/admin/config', (req, res) => {
    if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        res.json(config);
    } else {
        res.json(DEFAULT_CONFIG);
    }
});

app.post('/api/admin/config', (req, res) => {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
        console.log('Config saved successfully');
        res.json({ success: true });
    } catch (e) {
        console.error('Error saving config:', e);
        res.status(500).json({ error: 'Failed to save config' });
    }
});

app.get('/api/admin/whitelist', (req, res) => {
    try {
        if (fs.existsSync(WHITELIST_FILE)) {
            const whitelist = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf-8'));
            res.json(whitelist);
        } else {
            res.json({ emails: [] });
        }
    } catch (e) {
        console.error('Error reading whitelist:', e);
        res.status(500).json({ error: 'Failed to read whitelist' });
    }
});

app.post('/api/admin/whitelist', (req, res) => {
    try {
        fs.writeFileSync(WHITELIST_FILE, JSON.stringify(req.body, null, 2));
        console.log('Whitelist saved successfully');
        res.json({ success: true });
    } catch (e) {
        console.error('Error saving whitelist:', e);
        res.status(500).json({ error: 'Failed to save whitelist' });
    }
});

// User Management API
app.get('/api/admin/users', (req, res) => {
    res.json(getUsers());
});

app.post('/api/admin/users/register', (req, res) => {
    try {
        const newUser = req.body;
        const users = getUsers();
        const existingIndex = users.findIndex((u: any) => u.uid === newUser.uid);
        
        if (existingIndex > -1) {
            users[existingIndex] = { ...users[existingIndex], ...newUser };
        } else {
            users.push(newUser);
        }
        
        saveUsers(users);
        console.log(`User registered/synced: ${newUser.email}`);
        res.json({ success: true });
    } catch (e) {
        console.error('Error registering user:', e);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/api/admin/users/update-status', (req, res) => {
    try {
        const { uid, licenseStatus } = req.body;
        const users = getUsers();
        const user = users.find((u: any) => u.uid === uid);
        if (user) {
            user.licenseStatus = licenseStatus;
            saveUsers(users);
            console.log(`User status updated: ${user.email} -> ${licenseStatus}`);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (e) {
        console.error('Error updating user status:', e);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Vite middleware for development
async function setupVite() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static('dist'));
        app.get('*', (req, res) => {
            res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

setupVite();
