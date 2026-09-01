import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// POST /api/ai/recommend - AI Movie Recommendation Endpoint
router.post('/recommend', async (req: Request, res: Response) => {
  try {
    const { prompt, currentMovies } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Хүсэлт оруулаагүй байна' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        recommendation:
          'AI Систем одоогоор холбогдоогүй байна. Та манай кино сангийн цэсээс шүүлтүүр ашиглан дуртай анимэ, кинонуудаа үзнэ үү.',
      });
    }

    const movieCatalogText = Array.isArray(currentMovies)
      ? currentMovies
          .map(
            (m: any) =>
              `- ID: ${m.id}, Нэр: ${m.titleMongolian} (${m.title}), Төрөл: ${m.genres.join(', ')}, Жил: ${m.year}, Тайлбар: ${m.description}`
          )
          .join('\n')
      : '';

    const systemInstruction = `Чи бол FlickNime платформын ухаалаг туслах AI юм. 
Хэрэглэгчийн сэтгэл санааны байдал, хүсэлтэд тохирсон киног монгол хэлээр маш найрсаг, сонирхолтойгоор санал болгож зөвлөгөө өгнө үү.
Манай кино сан дахь боломжит кинонууд:
${movieCatalogText}

Санал болгохдоо:
1. Монгол хэлээр, сонирхолтой бөгөөд товч тайлбарлана.
2. Боломжтой бол сан доторх кинонуудаас тохирох кинонуудын нэрийг дурдана.
3. Анимэ болон Кино багц: 1 сар 4,000₮, 2 сар 7,000₮ (7k), 3 сар 10,000₮ (10k), VIP бүтэн багц 7,000₮ байдгийг тодорхой зөвлөж болно.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({
      recommendation:
        response.text || 'Танд тохирох кино болон анимэнуудыг санал болгож байна.',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'AI санал болгогчид алдаа гарлаа. Та дахин оролдоно уу.',
      details: error.message,
    });
  }
});

export default router;
