import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure storage directories exist
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Security: Case-insensitive Admin Password Setup
// Target username: admin
// Target password: shuaibka62 (case-insensitive: shuaibka62, SHUAIBKA62, ShuaibKa62 must all match)
const ADMIN_USERNAME = 'admin';
const TARGET_PASS_LOWER = 'shuaibka62';

// Salt and PBKDF2 hash of lowercase password
const PASS_SALT = crypto.randomBytes(16).toString('hex');
const PASS_HASH = crypto.pbkdf2Sync(TARGET_PASS_LOWER, PASS_SALT, 10000, 64, 'sha512').toString('hex');

// In-memory active admin sessions with 7-day TTL
const activeSessions = new Map<string, { createdAt: number; expiresAt: number; username: string }>();

function generateSessionToken(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
  activeSessions.set(token, { createdAt: now, expiresAt, username });
  return token;
}

function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  (req as any).adminUser = session.username;
  next();
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${safeBase}_${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB per image
  fileFilter: (_req, file, cb) => {
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMime.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload JPG, PNG, or WEBP images.'));
    }
  },
});

// JSON Database Storage Handlers
const POSTERS_FILE = path.resolve(DATA_DIR, 'posters.json');
const CATEGORIES_FILE = path.resolve(DATA_DIR, 'categories.json');

export interface PosterRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  storagePath?: string;
  fileFormat: string;
  fileSize: number;
  published: boolean;
  downloadCount: number;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// Initial Curated Posters
const INITIAL_POSTERS: PosterRecord[] = [
  {
    id: 'poster_retro_solitude_01',
    title: 'Neon Odyssey: Tokyo Midnight',
    description: 'A cinematic cyberpunk retro wave visual capturing the rain-slicked streets of Shinjuku with neon reflections and vivid cyan hues.',
    category: 'Cyberpunk & Sci-Fi',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'JPG',
    fileSize: 4280192,
    published: true,
    downloadCount: 342,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'poster_alpine_mist_02',
    title: 'Echoes of the Dolomites',
    description: 'Breathtaking high-altitude alpine peaks emerging through morning clouds in the Italian Alps. Crisp minimalist nature composition.',
    category: 'Travel & Nature',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'JPG',
    fileSize: 5120400,
    published: true,
    downloadCount: 521,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'poster_minimal_geometry_03',
    title: 'Bauhaus Spatial Symmetry',
    description: 'Timeless mid-century modernist graphic exhibition poster featuring bold geometric primary forms and Swiss typography layout.',
    category: 'Minimalist & Art',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'JPG',
    fileSize: 3192000,
    published: true,
    downloadCount: 418,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'poster_vintage_astronomy_04',
    title: 'Voyager: Interstellar Frontier',
    description: 'Vintage 1970s NASA inspired space exploration artwork commemorating deep planetary transit across the rings of Saturn.',
    category: 'Vintage & Retro',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'PNG',
    fileSize: 6240100,
    published: true,
    downloadCount: 789,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'poster_cinema_noir_05',
    title: 'The Silent Hour: Noir Monolith',
    description: 'Moody, atmospheric black and white architectural shadow play designed for independent cinematic festivals.',
    category: 'Movie & TV',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'WEBP',
    fileSize: 2890500,
    published: true,
    downloadCount: 265,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'poster_analog_synth_06',
    title: 'Analog Waves & Vinyl Resonance',
    description: 'Electric concert poster celebrating vinyl heritage, frequency waveforms, and warm tube amplification culture.',
    category: 'Music & Bands',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'JPG',
    fileSize: 3840200,
    published: true,
    downloadCount: 460,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'poster_botanical_zenith_07',
    title: 'Botanica: Nordic Flora Study',
    description: 'Serene botanical illustration highlighting wild ferns and organic textures against warm cream paper grain.',
    category: 'Travel & Nature',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'JPG',
    fileSize: 4500120,
    published: true,
    downloadCount: 194,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'poster_pixel_relic_08',
    title: 'Quest for the Crystal Cavern',
    description: 'High-fantasy isometric gaming poster evoking classic 16-bit RPG adventures, enchanted runes, and dungeon exploration.',
    category: 'Gaming',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1800&q=85',
    fileFormat: 'PNG',
    fileSize: 5890000,
    published: true,
    downloadCount: 631,
    uploaderId: 'admin_sys',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: 'all', name: 'All Categories', description: 'Explore our complete library', createdAt: new Date().toISOString() },
  { id: 'cyberpunk-sci-fi', name: 'Cyberpunk & Sci-Fi', description: 'Futuristic cityscapes, neon visions, and galaxy voyages', createdAt: new Date().toISOString() },
  { id: 'movie-tv', name: 'Movie & TV', description: 'Iconic film artwork, indie festival prints, and cinema tributes', createdAt: new Date().toISOString() },
  { id: 'music-bands', name: 'Music & Bands', description: 'Live concerts, retro vinyl designs, and audio art', createdAt: new Date().toISOString() },
  { id: 'travel-nature', name: 'Travel & Nature', description: 'Majestic mountains, quiet coastlines, and botanical marvels', createdAt: new Date().toISOString() },
  { id: 'minimalist-art', name: 'Minimalist & Art', description: 'Geometric forms, Swiss typography, and modern abstract compositions', createdAt: new Date().toISOString() },
  { id: 'vintage-retro', name: 'Vintage & Retro', description: 'Mid-century nostalgia, historic advertisements, and classic prints', createdAt: new Date().toISOString() },
  { id: 'gaming', name: 'Gaming', description: 'Arcade legends, RPG lore, and futuristic virtual worlds', createdAt: new Date().toISOString() },
];

function readPosters(): PosterRecord[] {
  try {
    if (!fs.existsSync(POSTERS_FILE)) {
      fs.writeFileSync(POSTERS_FILE, JSON.stringify(INITIAL_POSTERS, null, 2), 'utf-8');
      return INITIAL_POSTERS;
    }
    const data = fs.readFileSync(POSTERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading posters file:', err);
    return INITIAL_POSTERS;
  }
}

function writePosters(posters: PosterRecord[]) {
  try {
    fs.writeFileSync(POSTERS_FILE, JSON.stringify(posters, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing posters file:', err);
  }
}

function readCategories(): CategoryRecord[] {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(INITIAL_CATEGORIES, null, 2), 'utf-8');
      return INITIAL_CATEGORIES;
    }
    const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading categories file:', err);
    return INITIAL_CATEGORIES;
  }
}

function writeCategories(categories: CategoryRecord[]) {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing categories file:', err);
  }
}

// Ensure database files exist on launch
readPosters();
readCategories();

// ==========================================
// API ROUTES
// ==========================================

// 1. Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Validate Username
  if (username.trim().toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify username and password.' });
  }

  // Case-Insensitive Password Validation using PBKDF2 hash
  const inputLower = password.trim().toLowerCase();
  const inputHash = crypto.pbkdf2Sync(inputLower, PASS_SALT, 10000, 64, 'sha512').toString('hex');

  // Constant-time comparison to prevent timing attacks
  const isMatch = crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(PASS_HASH, 'hex'));

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Password did not match.' });
  }

  // Authentication succeeded - generate session token
  const token = generateSessionToken(ADMIN_USERNAME);
  return res.json({
    success: true,
    token,
    user: {
      username: ADMIN_USERNAME,
      role: 'admin',
      name: 'Administrator',
    },
  });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ valid: false });
  }
  return res.json({
    valid: true,
    user: {
      username: session.username,
      role: 'admin',
      name: 'Administrator',
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});

// 2. Posters API
// Public and Admin Query
app.get('/api/posters', (req, res) => {
  const { category, search, sort, status } = req.query;
  let posters = readPosters();

  // Auth check for viewing draft/all posters
  const authHeader = req.headers.authorization;
  let isAdmin = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      isAdmin = true;
    }
  }

  // Non-admins can strictly only read published posters
  if (!isAdmin || status === 'published') {
    posters = posters.filter((p) => p.published === true);
  } else if (status === 'draft') {
    posters = posters.filter((p) => p.published === false);
  }

  // Filter by Category
  if (category && category !== 'all') {
    const catStr = String(category).toLowerCase();
    posters = posters.filter((p) => p.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === catStr || p.category.toLowerCase() === catStr);
  }

  // Search by Title, Category, or Description
  if (search && String(search).trim()) {
    const q = String(search).toLowerCase().trim();
    posters = posters.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sort Results
  if (sort === 'oldest') {
    posters.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sort === 'downloads') {
    posters.sort((a, b) => b.downloadCount - a.downloadCount);
  } else {
    // Default newest to oldest
    posters.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ posters, total: posters.length });
});

// Single Poster
app.get('/api/posters/:id', (req, res) => {
  const posters = readPosters();
  const poster = posters.find((p) => p.id === req.params.id);
  if (!poster) {
    return res.status(404).json({ error: 'Poster not found' });
  }
  res.json(poster);
});

// Admin Multiple Poster Upload
app.post('/api/posters/upload', verifyAdminAuth, upload.array('images', 20), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Please select at least one poster image to upload.' });
    }

    const { category, title, description, published } = req.body;
    const posters = readPosters();
    const newRecords: PosterRecord[] = [];

    const now = new Date().toISOString();
    const isPublished = published === 'true' || published === true;

    files.forEach((file, index) => {
      const ext = path.extname(file.originalname).replace('.', '').toUpperCase();
      const uniqueId = `poster_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      
      // If uploading multiple, append index if common title is provided
      const finalTitle = files.length === 1 && title
        ? String(title).trim()
        : title ? `${String(title).trim()} #${index + 1}` : path.basename(file.originalname, path.extname(file.originalname));

      const finalCategory = category && String(category).trim() ? String(category).trim() : 'Minimalist & Art';

      const posterRecord: PosterRecord = {
        id: uniqueId,
        title: finalTitle,
        description: description ? String(description).trim() : '',
        category: finalCategory,
        imageUrl: `/uploads/${file.filename}`,
        storagePath: file.path,
        fileFormat: ext || 'JPG',
        fileSize: file.size,
        published: isPublished,
        downloadCount: 0,
        uploaderId: (req as any).adminUser || 'admin',
        createdAt: now,
        updatedAt: now,
      };

      newRecords.push(posterRecord);
      posters.unshift(posterRecord);
    });

    writePosters(posters);

    res.status(201).json({
      success: true,
      count: newRecords.length,
      posters: newRecords,
      message: `Successfully uploaded ${newRecords.length} poster${newRecords.length > 1 ? 's' : ''}!`,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    res.status(500).json({ error: err.message || 'Failed to process poster upload' });
  }
});

// Admin Update Poster
app.put('/api/posters/:id', verifyAdminAuth, (req, res) => {
  const posters = readPosters();
  const index = posters.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Poster not found' });
  }

  const { title, description, category, published } = req.body;

  if (title !== undefined) posters[index].title = String(title).trim();
  if (description !== undefined) posters[index].description = String(description).trim();
  if (category !== undefined) posters[index].category = String(category).trim();
  if (published !== undefined) posters[index].published = Boolean(published);

  posters[index].updatedAt = new Date().toISOString();

  writePosters(posters);
  res.json({ success: true, poster: posters[index] });
});

// Admin Delete Poster
app.delete('/api/posters/:id', verifyAdminAuth, (req, res) => {
  const posters = readPosters();
  const index = posters.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Poster not found' });
  }

  const removed = posters.splice(index, 1)[0];

  // Try to remove local file if stored locally
  if (removed.imageUrl && removed.imageUrl.startsWith('/uploads/')) {
    const filePath = path.resolve(__dirname, removed.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not remove file from disk:', e);
      }
    }
  }

  writePosters(posters);
  res.json({ success: true, message: 'Poster permanently deleted' });
});

// Public Track Download (Atomic Increment)
app.post('/api/posters/:id/download', (req, res) => {
  const posters = readPosters();
  const poster = posters.find((p) => p.id === req.params.id);

  if (!poster) {
    return res.status(404).json({ error: 'Poster not found' });
  }

  poster.downloadCount = (poster.downloadCount || 0) + 1;
  writePosters(posters);

  res.json({ success: true, downloadCount: poster.downloadCount });
});

// Public Meaningful File Download Stream
app.get('/api/posters/:id/download-file', (req, res) => {
  const posters = readPosters();
  const poster = posters.find((p) => p.id === req.params.id);

  if (!poster) {
    return res.status(404).json({ error: 'Poster not found' });
  }

  // Atomically increment counter
  poster.downloadCount = (poster.downloadCount || 0) + 1;
  writePosters(posters);

  const cleanTitle = poster.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `PosterHub-${cleanTitle}.${(poster.fileFormat || 'jpg').toLowerCase()}`;

  if (poster.imageUrl.startsWith('/uploads/')) {
    const localPath = path.resolve(__dirname, poster.imageUrl.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      return res.download(localPath, filename);
    }
  }

  // For remote URL, redirect or stream
  return res.redirect(poster.imageUrl);
});

// 3. Categories Management
app.get('/api/categories', (_req, res) => {
  const categories = readCategories();
  const posters = readPosters();

  // Attach dynamic poster count to each category
  const categoriesWithCount = categories.map((cat) => {
    const count =
      cat.id === 'all'
        ? posters.filter((p) => p.published).length
        : posters.filter(
            (p) =>
              p.published &&
              (p.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === cat.id ||
                p.category.toLowerCase() === cat.name.toLowerCase())
          ).length;

    return { ...cat, posterCount: count };
  });

  res.json({ categories: categoriesWithCount });
});

app.post('/api/categories', verifyAdminAuth, (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const categories = readCategories();
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');

  if (categories.some((c) => c.id === slug || c.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Category already exists' });
  }

  const newCategory: CategoryRecord = {
    id: slug,
    name: name.trim(),
    description: description ? String(description).trim() : '',
    createdAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  writeCategories(categories);

  res.status(201).json({ success: true, category: newCategory });
});

app.delete('/api/categories/:id', verifyAdminAuth, (req, res) => {
  const catId = req.params.id;
  if (catId === 'all') {
    return res.status(400).json({ error: 'Cannot delete primary root category' });
  }

  const categories = readCategories();
  const index = categories.findIndex((c) => c.id === catId);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  categories.splice(index, 1);
  writeCategories(categories);

  res.json({ success: true, message: 'Category removed' });
});

// 4. Admin Dashboard Stats
app.get('/api/stats', verifyAdminAuth, (_req, res) => {
  const posters = readPosters();
  const categories = readCategories();

  const totalPosters = posters.length;
  const publishedPosters = posters.filter((p) => p.published).length;
  const draftPosters = posters.filter((p) => !p.published).length;
  const totalDownloads = posters.reduce((sum, p) => sum + (p.downloadCount || 0), 0);

  // Top 5 downloaded
  const topDownloaded = [...posters].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 5);

  res.json({
    totalPosters,
    publishedPosters,
    draftPosters,
    totalDownloads,
    categoryCount: categories.length - 1, // exclude 'all'
    topDownloaded,
  });
});

// Mount Vite or static frontend
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`PosterHub full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
