import { Router, Request, Response } from 'express';
import { SAMPLE_MOVIES } from '../../src/data/movies.js';

const router = Router();

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

export default router;
