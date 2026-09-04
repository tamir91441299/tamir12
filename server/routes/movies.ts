import { Router, Request, Response, NextFunction } from 'express';
import { SAMPLE_MOVIES } from '../../src/data/movies.js';

const router = Router();

const ADMIN_EMAIL = 'tamir91441299@gmail.com';
const ADMIN_PHONE = '91441299';

// Middleware to strictly enforce that only the master admin can add/upload/edit videos
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminEmailHeader = req.headers['x-admin-email'];
  const adminPhoneHeader = req.headers['x-admin-phone'];
  const authHeader = req.headers['authorization'];

  const isAuthorized = 
    adminEmailHeader === ADMIN_EMAIL ||
    adminPhoneHeader === ADMIN_PHONE ||
    (typeof authHeader === 'string' && authHeader.includes(ADMIN_EMAIL));

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: '⛔ Хандалт хориглогдсон: Энэ сайтын админаас (tamir91441299@gmail.com) өөр хүн видео болон кино оруулах эрхгүй!',
    });
  }

  next();
}

// GET /api/movies - List movies with optional query filters (type, genre, search, featured)
router.get('/', (req: Request, res: Response) => {
  try {
    const { type, genre, search, featured } = req.query;

    let movies = [...SAMPLE_MOVIES];

    if (type && typeof type === 'string') {
      movies = movies.filter((m) => m.type === type);
    }

    if (genre && typeof genre === 'string') {
      movies = movies.filter((m) =>
        m.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      movies = movies.filter(
        (m) =>
          m.titleMongolian.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    if (featured === 'true') {
      movies = movies.filter((m) => m.featured);
    }

    res.json({
      success: true,
      count: movies.length,
      movies,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/movies/:id - Get movie details by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const movie = SAMPLE_MOVIES.find((m) => m.id === id);

    if (!movie) {
      return res.status(404).json({ success: false, error: 'Кино олдсонгүй' });
    }

    res.json({
      success: true,
      movie,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/movies/upload - Upload video/movie (ADMIN ONLY)
router.post('/upload', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Видео амжилттай байршлаа (Админ Тамир)',
  });
});

// POST /api/movies - Create new movie (ADMIN ONLY)
router.post('/', requireAdmin, (req: Request, res: Response) => {
  try {
    const movieData = req.body;
    if (!movieData || !movieData.titleMongolian) {
      return res.status(400).json({ success: false, error: 'Мэдээлэл дутуу байна' });
    }

    res.json({
      success: true,
      message: 'Шинэ кино амжилттай нэмэгдлээ',
      movie: movieData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/movies/:id - Update movie / episodes (ADMIN ONLY)
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    res.json({
      success: true,
      message: `Кино (${id}) амжилттай шинэчлэгдлээ`,
      updates,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/movies/:id - Delete movie (ADMIN ONLY)
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: `Кино (${req.params.id}) устгагдлаа`,
  });
});

export default router;
