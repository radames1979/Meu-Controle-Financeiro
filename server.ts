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

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

app.use(cors());
app.use(bodyParser.json());

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
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

app.get('/api/admin/whitelist', (req, res) => {
    if (fs.existsSync(WHITELIST_FILE)) {
        const whitelist = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf-8'));
        res.json(whitelist);
    } else {
        res.json({ emails: [] });
    }
});

app.post('/api/admin/whitelist', (req, res) => {
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
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
