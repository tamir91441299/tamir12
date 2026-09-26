import { Movie, Episode } from '../../types';
import { extractGoogleDriveId } from '../../lib/videoUtils';

/**
 * 🔗 Google Drive эсвэл Шууд линк хөрвүүлэгч функц
 */
export function formatHunterXHunterDriveLink(driveIdOrUrl: string): string {
  if (!driveIdOrUrl) return '';
  const clean = driveIdOrUrl.trim();
  const id = extractGoogleDriveId(clean);
  if (id) {
    return `https://drive.google.com/file/d/${id}/view?usp=drivesdk`;
  }
  return clean;
}

/**
 * 🎯 ХАНТЭР Х ХАНТЭР (HUNTER X HUNTER 2011) - 1-ЭЭС 148 ХҮРТЭЛХ БҮХ АНГИЙН ЛИНКҮҮД
 * 
 * Та өөрийн Google Drive линк эсвэл шууд видеоны холбоосоо доорх объектод хуулж тавихад
 * тоглуулагч шууд тухайн ангийг Full HD чанараар гаргана.
 */
export const HUNTER_X_HUNTER_EPISODE_LINKS: Record<number, string> = {
  // Arc 1: Хантерын Шалгалт (Hunter Exam Arc) - 1-21 анги
  1: 'https://u.pcloud.link/publink/show?code=XZ1LU4JZCt8ilpcoo3mBgAjJBjcl0SxlPvk7',
  2: 'https://drive.google.com/file/d/1hunter_x_hunter_ep2/view?usp=drivesdk',
  3: 'https://drive.google.com/file/d/1hunter_x_hunter_ep3/view?usp=drivesdk',
  4: 'https://drive.google.com/file/d/1hunter_x_hunter_ep4/view?usp=drivesdk',
  5: 'https://drive.google.com/file/d/1hunter_x_hunter_ep5/view?usp=drivesdk',
  6: 'https://drive.google.com/file/d/1hunter_x_hunter_ep6/view?usp=drivesdk',
  7: 'https://drive.google.com/file/d/1hunter_x_hunter_ep7/view?usp=drivesdk',
  8: 'https://drive.google.com/file/d/1hunter_x_hunter_ep8/view?usp=drivesdk',
  9: 'https://drive.google.com/file/d/1hunter_x_hunter_ep9/view?usp=drivesdk',
  10: 'https://drive.google.com/file/d/1hunter_x_hunter_ep10/view?usp=drivesdk',
  11: 'https://drive.google.com/file/d/1hunter_x_hunter_ep11/view?usp=drivesdk',
  12: 'https://drive.google.com/file/d/1hunter_x_hunter_ep12/view?usp=drivesdk',
  13: 'https://drive.google.com/file/d/1hunter_x_hunter_ep13/view?usp=drivesdk',
  14: 'https://drive.google.com/file/d/1hunter_x_hunter_ep14/view?usp=drivesdk',
  15: 'https://drive.google.com/file/d/1hunter_x_hunter_ep15/view?usp=drivesdk',
  16: 'https://drive.google.com/file/d/1hunter_x_hunter_ep16/view?usp=drivesdk',
  17: 'https://drive.google.com/file/d/1hunter_x_hunter_ep17/view?usp=drivesdk',
  18: 'https://drive.google.com/file/d/1hunter_x_hunter_ep18/view?usp=drivesdk',
  19: 'https://drive.google.com/file/d/1hunter_x_hunter_ep19/view?usp=drivesdk',
  20: 'https://drive.google.com/file/d/1hunter_x_hunter_ep20/view?usp=drivesdk',
  21: 'https://drive.google.com/file/d/1hunter_x_hunter_ep21/view?usp=drivesdk',

  // Arc 2: Золдикийн Гэр бүл (Zoldyck Family Arc) - 22-26 анги
  22: 'https://drive.google.com/file/d/1hunter_x_hunter_ep22/view?usp=drivesdk',
  23: 'https://drive.google.com/file/d/1hunter_x_hunter_ep23/view?usp=drivesdk',
  24: 'https://drive.google.com/file/d/1hunter_x_hunter_ep24/view?usp=drivesdk',
  25: 'https://drive.google.com/file/d/1hunter_x_hunter_ep25/view?usp=drivesdk',
  26: 'https://drive.google.com/file/d/1hunter_x_hunter_ep26/view?usp=drivesdk',

  // Arc 3: Диваажингийн Арена (Heavens Arena Arc) - 27-36 анги
  27: 'https://drive.google.com/file/d/1hunter_x_hunter_ep27/view?usp=drivesdk',
  28: 'https://drive.google.com/file/d/1hunter_x_hunter_ep28/view?usp=drivesdk',
  29: 'https://drive.google.com/file/d/1hunter_x_hunter_ep29/view?usp=drivesdk',
  30: 'https://drive.google.com/file/d/1hunter_x_hunter_ep30/view?usp=drivesdk',
  31: 'https://drive.google.com/file/d/1hunter_x_hunter_ep31/view?usp=drivesdk',
  32: 'https://drive.google.com/file/d/1hunter_x_hunter_ep32/view?usp=drivesdk',
  33: 'https://drive.google.com/file/d/1hunter_x_hunter_ep33/view?usp=drivesdk',
  34: 'https://drive.google.com/file/d/1hunter_x_hunter_ep34/view?usp=drivesdk',
  35: 'https://drive.google.com/file/d/1hunter_x_hunter_ep35/view?usp=drivesdk',
  36: 'https://drive.google.com/file/d/1hunter_x_hunter_ep36/view?usp=drivesdk',

  // Arc 4: Йоркшин Сити / Фантом Труп (Yorknew City Arc) - 37-58 анги
  37: 'https://drive.google.com/file/d/1hunter_x_hunter_ep37/view?usp=drivesdk',
  38: 'https://drive.google.com/file/d/1hunter_x_hunter_ep38/view?usp=drivesdk',
  39: 'https://drive.google.com/file/d/1hunter_x_hunter_ep39/view?usp=drivesdk',
  40: 'https://drive.google.com/file/d/1hunter_x_hunter_ep40/view?usp=drivesdk',
  41: 'https://drive.google.com/file/d/1hunter_x_hunter_ep41/view?usp=drivesdk',
  42: 'https://drive.google.com/file/d/1hunter_x_hunter_ep42/view?usp=drivesdk',
  43: 'https://drive.google.com/file/d/1hunter_x_hunter_ep43/view?usp=drivesdk',
  44: 'https://drive.google.com/file/d/1hunter_x_hunter_ep44/view?usp=drivesdk',
  45: 'https://drive.google.com/file/d/1hunter_x_hunter_ep45/view?usp=drivesdk',
  46: 'https://drive.google.com/file/d/1hunter_x_hunter_ep46/view?usp=drivesdk',
  47: 'https://drive.google.com/file/d/1hunter_x_hunter_ep47/view?usp=drivesdk',
  48: 'https://drive.google.com/file/d/1hunter_x_hunter_ep48/view?usp=drivesdk',
  49: 'https://drive.google.com/file/d/1hunter_x_hunter_ep49/view?usp=drivesdk',
  50: 'https://drive.google.com/file/d/1hunter_x_hunter_ep50/view?usp=drivesdk',
  51: 'https://drive.google.com/file/d/1hunter_x_hunter_ep51/view?usp=drivesdk',
  52: 'https://drive.google.com/file/d/1hunter_x_hunter_ep52/view?usp=drivesdk',
  53: 'https://drive.google.com/file/d/1hunter_x_hunter_ep53/view?usp=drivesdk',
  54: 'https://drive.google.com/file/d/1hunter_x_hunter_ep54/view?usp=drivesdk',
  55: 'https://drive.google.com/file/d/1hunter_x_hunter_ep55/view?usp=drivesdk',
  56: 'https://drive.google.com/file/d/1hunter_x_hunter_ep56/view?usp=drivesdk',
  57: 'https://drive.google.com/file/d/1hunter_x_hunter_ep57/view?usp=drivesdk',
  58: 'https://drive.google.com/file/d/1hunter_x_hunter_ep58/view?usp=drivesdk',

  // Arc 5: Грийд Айланд (Greed Island Arc) - 59-75 анги
  59: 'https://drive.google.com/file/d/1hunter_x_hunter_ep59/view?usp=drivesdk',
  60: 'https://drive.google.com/file/d/1hunter_x_hunter_ep60/view?usp=drivesdk',
  61: 'https://drive.google.com/file/d/1hunter_x_hunter_ep61/view?usp=drivesdk',
  62: 'https://drive.google.com/file/d/1hunter_x_hunter_ep62/view?usp=drivesdk',
  63: 'https://drive.google.com/file/d/1hunter_x_hunter_ep63/view?usp=drivesdk',
  64: 'https://drive.google.com/file/d/1hunter_x_hunter_ep64/view?usp=drivesdk',
  65: 'https://drive.google.com/file/d/1hunter_x_hunter_ep65/view?usp=drivesdk',
  66: 'https://drive.google.com/file/d/1hunter_x_hunter_ep66/view?usp=drivesdk',
  67: 'https://drive.google.com/file/d/1hunter_x_hunter_ep67/view?usp=drivesdk',
  68: 'https://drive.google.com/file/d/1hunter_x_hunter_ep68/view?usp=drivesdk',
  69: 'https://drive.google.com/file/d/1hunter_x_hunter_ep69/view?usp=drivesdk',
  70: 'https://drive.google.com/file/d/1hunter_x_hunter_ep70/view?usp=drivesdk',
  71: 'https://drive.google.com/file/d/1hunter_x_hunter_ep71/view?usp=drivesdk',
  72: 'https://drive.google.com/file/d/1hunter_x_hunter_ep72/view?usp=drivesdk',
  73: 'https://drive.google.com/file/d/1hunter_x_hunter_ep73/view?usp=drivesdk',
  74: 'https://drive.google.com/file/d/1hunter_x_hunter_ep74/view?usp=drivesdk',
  75: 'https://drive.google.com/file/d/1hunter_x_hunter_ep75/view?usp=drivesdk',

  // Arc 6: Химера Шоргоолж (Chimera Ant Arc) - 76-136 анги
  76: 'https://drive.google.com/file/d/1hunter_x_hunter_ep76/view?usp=drivesdk',
  77: 'https://drive.google.com/file/d/1hunter_x_hunter_ep77/view?usp=drivesdk',
  78: 'https://drive.google.com/file/d/1hunter_x_hunter_ep78/view?usp=drivesdk',
  79: 'https://drive.google.com/file/d/1hunter_x_hunter_ep79/view?usp=drivesdk',
  80: 'https://drive.google.com/file/d/1hunter_x_hunter_ep80/view?usp=drivesdk',
  81: 'https://drive.google.com/file/d/1hunter_x_hunter_ep81/view?usp=drivesdk',
  82: 'https://drive.google.com/file/d/1hunter_x_hunter_ep82/view?usp=drivesdk',
  83: 'https://drive.google.com/file/d/1hunter_x_hunter_ep83/view?usp=drivesdk',
  84: 'https://drive.google.com/file/d/1hunter_x_hunter_ep84/view?usp=drivesdk',
  85: 'https://drive.google.com/file/d/1hunter_x_hunter_ep85/view?usp=drivesdk',
  86: 'https://drive.google.com/file/d/1hunter_x_hunter_ep86/view?usp=drivesdk',
  87: 'https://drive.google.com/file/d/1hunter_x_hunter_ep87/view?usp=drivesdk',
  88: 'https://drive.google.com/file/d/1hunter_x_hunter_ep88/view?usp=drivesdk',
  89: 'https://drive.google.com/file/d/1hunter_x_hunter_ep89/view?usp=drivesdk',
  90: 'https://drive.google.com/file/d/1hunter_x_hunter_ep90/view?usp=drivesdk',
  91: 'https://drive.google.com/file/d/1hunter_x_hunter_ep91/view?usp=drivesdk',
  92: 'https://drive.google.com/file/d/1hunter_x_hunter_ep92/view?usp=drivesdk',
  93: 'https://drive.google.com/file/d/1hunter_x_hunter_ep93/view?usp=drivesdk',
  94: 'https://drive.google.com/file/d/1hunter_x_hunter_ep94/view?usp=drivesdk',
  95: 'https://drive.google.com/file/d/1hunter_x_hunter_ep95/view?usp=drivesdk',
  96: 'https://drive.google.com/file/d/1hunter_x_hunter_ep96/view?usp=drivesdk',
  97: 'https://drive.google.com/file/d/1hunter_x_hunter_ep97/view?usp=drivesdk',
  98: 'https://drive.google.com/file/d/1hunter_x_hunter_ep98/view?usp=drivesdk',
  99: 'https://drive.google.com/file/d/1hunter_x_hunter_ep99/view?usp=drivesdk',
  100: 'https://drive.google.com/file/d/1hunter_x_hunter_ep100/view?usp=drivesdk',
  101: 'https://drive.google.com/file/d/1hunter_x_hunter_ep101/view?usp=drivesdk',
  102: 'https://drive.google.com/file/d/1hunter_x_hunter_ep102/view?usp=drivesdk',
  103: 'https://drive.google.com/file/d/1hunter_x_hunter_ep103/view?usp=drivesdk',
  104: 'https://drive.google.com/file/d/1hunter_x_hunter_ep104/view?usp=drivesdk',
  105: 'https://drive.google.com/file/d/1hunter_x_hunter_ep105/view?usp=drivesdk',
  106: 'https://drive.google.com/file/d/1hunter_x_hunter_ep106/view?usp=drivesdk',
  107: 'https://drive.google.com/file/d/1hunter_x_hunter_ep107/view?usp=drivesdk',
  108: 'https://drive.google.com/file/d/1hunter_x_hunter_ep108/view?usp=drivesdk',
  109: 'https://drive.google.com/file/d/1hunter_x_hunter_ep109/view?usp=drivesdk',
  110: 'https://drive.google.com/file/d/1hunter_x_hunter_ep110/view?usp=drivesdk',
  111: 'https://drive.google.com/file/d/1hunter_x_hunter_ep111/view?usp=drivesdk',
  112: 'https://drive.google.com/file/d/1hunter_x_hunter_ep112/view?usp=drivesdk',
  113: 'https://drive.google.com/file/d/1hunter_x_hunter_ep113/view?usp=drivesdk',
  114: 'https://drive.google.com/file/d/1hunter_x_hunter_ep114/view?usp=drivesdk',
  115: 'https://drive.google.com/file/d/1hunter_x_hunter_ep115/view?usp=drivesdk',
  116: 'https://drive.google.com/file/d/1hunter_x_hunter_ep116/view?usp=drivesdk',
  117: 'https://drive.google.com/file/d/1hunter_x_hunter_ep117/view?usp=drivesdk',
  118: 'https://drive.google.com/file/d/1hunter_x_hunter_ep118/view?usp=drivesdk',
  119: 'https://drive.google.com/file/d/1hunter_x_hunter_ep119/view?usp=drivesdk',
  120: 'https://drive.google.com/file/d/1hunter_x_hunter_ep120/view?usp=drivesdk',
  121: 'https://drive.google.com/file/d/1hunter_x_hunter_ep121/view?usp=drivesdk',
  122: 'https://drive.google.com/file/d/1hunter_x_hunter_ep122/view?usp=drivesdk',
  123: 'https://drive.google.com/file/d/1hunter_x_hunter_ep123/view?usp=drivesdk',
  124: 'https://drive.google.com/file/d/1hunter_x_hunter_ep124/view?usp=drivesdk',
  125: 'https://drive.google.com/file/d/1hunter_x_hunter_ep125/view?usp=drivesdk',
  126: 'https://drive.google.com/file/d/1hunter_x_hunter_ep126/view?usp=drivesdk',
  127: 'https://drive.google.com/file/d/1hunter_x_hunter_ep127/view?usp=drivesdk',
  128: 'https://drive.google.com/file/d/1hunter_x_hunter_ep128/view?usp=drivesdk',
  129: 'https://drive.google.com/file/d/1hunter_x_hunter_ep129/view?usp=drivesdk',
  130: 'https://drive.google.com/file/d/1hunter_x_hunter_ep130/view?usp=drivesdk',
  131: 'https://drive.google.com/file/d/1hunter_x_hunter_ep131/view?usp=drivesdk',
  132: 'https://drive.google.com/file/d/1hunter_x_hunter_ep132/view?usp=drivesdk',
  133: 'https://drive.google.com/file/d/1hunter_x_hunter_ep133/view?usp=drivesdk',
  134: 'https://drive.google.com/file/d/1hunter_x_hunter_ep134/view?usp=drivesdk',
  135: 'https://drive.google.com/file/d/1hunter_x_hunter_ep135/view?usp=drivesdk',
  136: 'https://drive.google.com/file/d/1hunter_x_hunter_ep136/view?usp=drivesdk',

  // Arc 7: Хантерын 13-р Даргын Сонгууль (13th Hunter Chairman Election Arc) - 137-148 анги
  137: 'https://drive.google.com/file/d/1hunter_x_hunter_ep137/view?usp=drivesdk',
  138: 'https://drive.google.com/file/d/1hunter_x_hunter_ep138/view?usp=drivesdk',
  139: 'https://drive.google.com/file/d/1hunter_x_hunter_ep139/view?usp=drivesdk',
  140: 'https://drive.google.com/file/d/1hunter_x_hunter_ep140/view?usp=drivesdk',
  141: 'https://drive.google.com/file/d/1hunter_x_hunter_ep141/view?usp=drivesdk',
  142: 'https://drive.google.com/file/d/1hunter_x_hunter_ep142/view?usp=drivesdk',
  143: 'https://drive.google.com/file/d/1hunter_x_hunter_ep143/view?usp=drivesdk',
  144: 'https://drive.google.com/file/d/1hunter_x_hunter_ep144/view?usp=drivesdk',
  145: 'https://drive.google.com/file/d/1hunter_x_hunter_ep145/view?usp=drivesdk',
  146: 'https://drive.google.com/file/d/1hunter_x_hunter_ep146/view?usp=drivesdk',
  147: 'https://drive.google.com/file/d/1hunter_x_hunter_ep147/view?usp=drivesdk',
  148: 'https://drive.google.com/file/d/1hunter_x_hunter_ep148/view?usp=drivesdk',
};

/**
 * Ганц ангийн холбоос оноох функц
 */
export function setHunterXHunterEpisodeLink(episodeNumber: number, link: string): void {
  if (episodeNumber >= 1 && episodeNumber <= 148) {
    const formatted = formatHunterXHunterDriveLink(link) || link;
    HUNTER_X_HUNTER_EPISODE_LINKS[episodeNumber] = formatted;
    const ep = HUNTER_X_HUNTER_EPISODES.find((e) => e.episodeNumber === episodeNumber);
    if (ep) {
      ep.videoUrl = formatted;
    }
    if (episodeNumber === 1) {
      HUNTER_X_HUNTER.videoUrl = formatted;
    }
  }
}

/**
 * Олон ангийн холбоос нэгэн зэрэг холбох функц (Batch Link Setter)
 */
export function batchSetHunterXHunterEpisodeLinks(links: Record<number, string>): void {
  Object.entries(links).forEach(([epNum, link]) => {
    setHunterXHunterEpisodeLink(Number(epNum), link);
  });
}

/**
 * Hunter x Hunter-ийн ангиудын албан ёсны нэрс (Монгол ба Англи орчуулгатай)
 */
const HUNTER_X_HUNTER_TITLES: Record<number, { mn: string; en: string }> = {
  1: { mn: 'Аялал ба Найзууд', en: 'Departure × And × Friends' },
  2: { mn: 'Шалгалтын сорилт', en: 'Test × Of × Tests' },
  3: { mn: 'Өрсөлдөгчдийн өрсөлдөөн', en: 'Rivals × For × Survival' },
  4: { mn: 'Найдвар ба хүсэл тэмүүлэл', en: 'Hope × And × Ambition' },
  5: { mn: 'Хисокагийн хууран мэхлэлт', en: 'Hisoka × Is × Sneaky' },
  6: { mn: 'Гэнэтийн сорилт', en: 'A × Surprising × Challenge' },
  7: { mn: 'Агаарын хөлөг дээрх тулаан', en: 'Showdown × On × The Airship' },
  8: { mn: 'Олонхийн шийдвэр', en: 'Solution × By × Majority Vote?' },
  9: { mn: 'Шоронгийн хоригдлууд', en: 'Beware × Of × Prisoners' },
  10: { mn: 'Хуурамч занга', en: 'Trick × To × The Trick' },
  11: { mn: 'Асуудалтай бооцоо', en: 'Trouble × With × The Gamble' },
  12: { mn: 'Сүүлчийн шийдвэр', en: 'Last × Test × Of Resolve' },
  13: { mn: 'Гонд ирсэн захидал', en: 'Letter × From × Gon' },
  14: { mn: 'Зорьсон байг цохих нь', en: 'Hit × The × Target' },
  15: { mn: 'Хуурмаг байдал', en: 'Explosion × Of × Deception' },
  16: { mn: 'Ялагдал ба гутамшиг', en: 'Defeat × And × Disgrace' },
  17: { mn: 'Агуй дахь урхи', en: 'Trap × In × The Hole' },
  18: { mn: 'Сүүлчийн ярилцлага', en: 'Big × Time × Interview' },
  19: { mn: 'Тэнцэх эсвэл унах', en: 'Can\'t Win × But × Can\'t Lose' },
  20: { mn: 'Эргэлзээтэй ялалт', en: 'Baffling Turn × Of × Events' },
  21: { mn: 'Ах дүүсийн асуудал', en: 'Some × Brother × Trouble' },
  22: { mn: 'Аюултай хамгаалалтын нохой', en: 'A × Dangerous × Watchdog' },
  23: { mn: 'Харуулын үүрэг', en: 'The × Guard\'s × Duty' },
  24: { mn: 'Золдикийн гэр бүл', en: 'The × Zoldyck × Family' },
  25: { mn: 'Ангал дахь уулзалт', en: 'Can\'t See × If You\'re × Blind' },
  26: { mn: 'Тэгээд цааш', en: 'Then × And × After' },
  27: { mn: 'Диваажингийн Арена руу орсон нь', en: 'Arrival × At × The Arena' },
  28: { mn: 'Нэн ба Рэн', en: 'Nen × And × Ren' },
  29: { mn: 'Сэрсэн хүч', en: 'Awakening × And × Potential' },
  30: { mn: 'Хүчтэй өрсөлдөөн', en: 'Fierce × And × Fiery' },
  31: { mn: 'Хувь заяа ба хувьсал', en: 'Destiny × And × Tenacity' },
  32: { mn: 'Гэнэтийн ялалт', en: 'A × Surprising × Win' },
  33: { mn: 'Хоосон сүрдүүлэг', en: 'An × Empty × Threat' },
  34: { mn: 'Хүч чадлын шалгалт', en: 'Power × To × Avenge' },
  35: { mn: 'Жинхэнэ шалгалт', en: 'The × True × Pass' },
  36: { mn: 'Хисокагийн эсрэг Гон', en: 'A Big Debt × And × A Small Kick' },
  37: { mn: 'Гин ба Гон', en: 'Ging × And × Gon' },
  38: { mn: 'Аавын хариулт', en: 'Reply × From × Dad' },
  39: { mn: 'Нууц дуудлага худалдаа', en: 'Wish × And × Promise' },
  40: { mn: 'Нэн хэрэглэгчид нэгдсэн нь', en: 'Nen × Users × Unite?' },
  41: { mn: 'Цугларалт ба цуст тулаан', en: 'Gathering × Of × Heroes' },
  42: { mn: 'Хамгаалалт ба дайралт', en: 'Defend × And × Attack' },
  43: { mn: 'Аймшигт эмгэнэл', en: 'A × Shocking × Tragedy' },
  44: { mn: 'Сүүдрийн тулаан', en: 'Buildup × To A × Fierce Battle' },
  45: { mn: 'Хориг ба амлалт', en: 'Restraint × And × Vow' },
  46: { mn: 'Мөрдөн хөөх ажиллагаа', en: 'Chasing × And × Waiting' },
  47: { mn: 'Нөхцөл ба болзол', en: 'Condition × And × Condition' },
  48: { mn: 'Маш хурц нүд', en: 'Very × Sharp × Eye' },
  49: { mn: 'Хөөцөлдөөн ба баривчилгаа', en: 'Pursuit × And × Analysis' },
  50: { mn: 'Холбоотнууд ба урвалт', en: 'Ally × And × Sword' },
  51: { mn: 'Харгис тулааны талбар', en: 'A × Brutal × Battlefield' },
  52: { mn: 'Дайралт ба эмх замбараагүй байдал', en: 'Assault × And × Impact' },
  53: { mn: 'Хуурамч үхэл', en: 'Fake × And × Psyche' },
  54: { mn: 'Зөгнөл ба эргэлт', en: 'Fortunes × Aren\'t × Right?' },
  55: { mn: 'Найзууд ба худал хуурмаг', en: 'Allies × And × Lies' },
  56: { mn: 'Хайртай хүмүүс ба өшөө хонзон', en: 'Beloved × And × Beleaguered' },
  57: { mn: 'Эхлэл ба санаачлага', en: 'Initiative × And × Law' },
  58: { mn: 'Дохио ба сүүлчийн ялалт', en: 'Signal × To × Retreat' },
  59: { mn: 'Үнэ хаялцах даалгавар', en: 'Bid × And × Haste' },
  60: { mn: 'Төгсгөл ба эхлэл', en: 'End × And × Beginning' },
  61: { mn: 'Урилга ба найз', en: 'Invitation × And × Friend' },
  62: { mn: 'Бодит байдал ба тоглоом', en: 'Reality? × And × Raw' },
  63: { mn: 'Хатуу багш Биске', en: 'A × Hard × Teacher?' },
  64: { mn: 'Бэлтгэл сургуулилт', en: 'Strengthen × And × Threaten' },
  65: { mn: 'Аймшигт тэсрэлт', en: 'Evil Fist × And × Rock-Paper-Scissors' },
  66: { mn: 'Стратеги ба төлөвлөгөө', en: 'Strategy × And × Scheme' },
  67: { mn: '15-р хот', en: '15 × 15' },
  68: { mn: 'Далайн дээрэмчид', en: 'Pirates × And × Guesses' },
  69: { mn: 'Ширүүн тэмцэл', en: 'A × Heated × Showdown' },
  70: { mn: 'Хүч чадал ба зориг', en: 'Guts × And × Courage' },
  71: { mn: 'Гайхалтай тоглолт', en: 'Bargain × And × Deal' },
  72: { mn: 'Боломж ба тулаан', en: 'Chase × And × Chance' },
  73: { mn: 'Сүүлчийн шийдвэрлэх цохилт', en: 'Insanity × And × Sanity' },
  74: { mn: 'Ялагчийн шагнал', en: 'Victor × And × Loser' },
  75: { mn: 'Гинтэй уулзах уу?', en: 'Ging\'s Friends × And × True Friends' },
  76: { mn: 'Шинэ тив ба шинэ аюул', en: 'Reunion × And × Understanding' },
  77: { mn: 'Химера Шоргоолж', en: 'Insolence × And × Distress' },
  78: { mn: 'Аймшигт мутаци', en: 'Very × Rapid × Reproduction' },
  79: { mn: 'NGL бүс рүү нэвтэрсэн нь', en: 'No × Good × NGL' },
  80: { mn: 'Муу зүйл ба аймшиг', en: 'Evil × And × Terrible' },
  81: { mn: 'Ширүүн тулаан эхэллээ', en: 'The × Fight × Starts' },
  82: { mn: 'Питугийн сэрэлт', en: 'Kite × And × Slots' },
  83: { mn: 'Аймшигт үнэн', en: 'Inspiration × To × Evolve' },
  84: { mn: 'Хувь тавилантай өдөр', en: 'A × Fated × Awakening' },
  85: { mn: 'Гэрэл ба харанхуй', en: 'Light × And × Darkness' },
  86: { mn: 'Амлалт ба салах ёс', en: 'Promise × And × Reunion' },
  87: { mn: 'Шалгалт ба дуэлийн бэлтгэл', en: 'Duel × And × Escape' },
  88: { mn: 'Хайч, чулуу, даавуу', en: 'Rock-Paper-Scissors × And × Weakness' },
  89: { mn: 'Эр зориг ба энэрэл', en: 'Compassion × And × Strength' },
  90: { mn: 'Урам хугарал ба шийдвэр', en: 'Slow × And × Cursed' },
  91: { mn: 'Хүчтэй ба сул дорой', en: 'The Strong × And × The Weak' },
  92: { mn: 'Нэг хүсэл ба хоёр зам', en: 'One Wish × And × Two Oaths' },
  93: { mn: 'Болзоо ба Киллуагийн зовлон', en: 'Date × With × Palm' },
  94: { mn: 'Найзын холбоо', en: 'Friend × And × Journey' },
  95: { mn: 'Өс хонзон ба нууц хүч', en: 'Grudge × And × Dread' },
  96: { mn: 'Хууль бус гэр орон', en: 'A × Lawless × Home' },
  97: { mn: 'Цуст тулаан ба хариуцлага', en: 'Carnage × And × Devastation' },
  98: { mn: 'Шууд нэвтрэх дайралт', en: 'Infiltration × And × Selection' },
  99: { mn: 'Холбоо ба ур чадвар', en: 'Combination × And × Evolution' },
  100: { mn: 'Амь өрссөн эргэлт', en: 'Tracking × And × Chasing' },
  101: { mn: 'Икалго ба Киллуа', en: 'Ikalgo × And × Lightning' },
  102: { mn: 'Хүч чадлын үнэлэмж', en: 'Power × And × Games' },
  103: { mn: 'Шатрын өрөг ба Комуги', en: 'Check × And × Mate' },
  104: { mn: 'Эргэлзээ ба тайван байдал', en: 'Doubt × And × Hesitation' },
  105: { mn: 'Шийдэмгий алхам', en: 'Resolve × And × Awakening' },
  106: { mn: 'Нов ба төгс айдас', en: 'Knov × And × Morel' },
  107: { mn: 'Төлөвлөгөө ба хариу үйлдэл', en: 'Return × And × Retire' },
  108: { mn: 'Комугийн гэмтэл', en: 'Gungi × Of × Komugi' },
  109: { mn: 'Дайралтын өмнөх мөч', en: 'Taking Stock × And × Taking Action' },
  110: { mn: 'Төөрөгдөл ба ухаарал', en: 'Confusion × And × Expectation' },
  111: { mn: 'Дайралт эхэллээ!', en: 'Charge × And × Invade' },
  112: { mn: 'Мангас ба мангас', en: 'Monster × And × Monster' },
  113: { mn: 'Өршөөлгүй тулаан', en: 'An × Indebted × Insect' },
  114: { mn: 'Хуваагдмал хүч', en: 'Divide × And × Conquer' },
  115: { mn: 'Үүрэг ба сэтгэл хөдлөл', en: 'Duty × And × Question' },
  116: { mn: 'Өшөө авалт ба нөхцөл байдал', en: 'Revenge × And × Recovery' },
  117: { mn: 'Нэр төр ба өршөөл', en: 'Insult × And × Payback' },
  118: { mn: 'Хуурамч тайвшрал', en: 'A × Fake × Anger' },
  119: { mn: 'Хүчтэй ба хүчтэй', en: 'Strong × Or × Weak' },
  120: { mn: 'Хуурамч ба жинхэнэ', en: 'Fake × And × Real' },
  121: { mn: 'Ялалт ба хохирол', en: 'Defeat × And × Dignity' },
  122: { mn: 'Поз ба нэр алдар', en: 'Pose × And × Name' },
  123: { mn: 'Зуун төрлийн Гуаньинь Бодьсадва', en: 'Centipede × And × Memory' },
  124: { mn: 'Эвдрэл ба туйлын хүч', en: 'Breakdown × And × Awakening' },
  125: { mn: 'Агуу хүмүүсийн өрсөлдөөн', en: 'Great Power × And × Ultimate Power' },
  126: { mn: 'Тэг цэг ба Нетерогийн золиос', en: 'Zero × And × Rose' },
  127: { mn: 'Дайсагнал ба хайр', en: 'Hostility × And × Determination' },
  128: { mn: 'Хосгүй баяр баясал', en: 'Unparalleled Joy × And × Unconditional Love' },
  129: { mn: 'Сүүлчийн өшөө авалт', en: 'Formidable Enemy × And × Clear Objective' },
  130: { mn: 'Гоны туйлын хувьсал', en: 'Magic × To × Destroy' },
  131: { mn: 'Цөхрөл ба туйлын хүч', en: 'Anger × And × Light' },
  132: { mn: 'Гэрэл ба үнс нурам', en: 'Flash × And × Start' },
  133: { mn: 'Үхэл ба амьдралын зааг', en: 'Deadline × To × Live' },
  134: { mn: 'Үг ба үйлдэл', en: 'The Word × Is × That Person' },
  135: { mn: 'Энэ өдөр ба энэ мөч (Төгсгөл)', en: 'This Person × And × This Moment' },
  136: { mn: 'Гэртээ харих зам', en: 'Homecoming × And × Real Name' },
  137: { mn: 'Арван хоёр Зурхайч (Zodiacs)', en: 'Debate × Among × Zodiacs' },
  138: { mn: 'Гуйлт ба хүсэл', en: 'Plea × And × Favor' },
  139: { mn: 'Аллука ба Наника', en: 'Alluka × And × That Thing' },
  140: { mn: 'Ах дүүсийн шийдвэр', en: 'Join Battle × And × Open Battle' },
  141: { mn: 'Илбэчин ба туслагчид', en: 'Magician × And × Butler' },
  142: { mn: 'Зүү ба хууран мэхлэлт', en: 'Needles × And × Debt' },
  143: { mn: 'Нүгэл ба зөв сэтгэл', en: 'Sin × And × Claw' },
  144: { mn: 'Зөвшөөрөл ба алга ташилт', en: 'Sanction × And × Clapping' },
  145: { mn: 'Ялалт ба эргэлзээ', en: 'Defeat × And × Reunion' },
  146: { mn: 'Дарга ба сонгууль', en: 'Chairman × And × Release' },
  147: { mn: 'Аврал ба ирээдүй', en: 'Salvation × And × Future' },
  148: { mn: 'Өнгөрсөн ба Одоо (Төгсгөл)', en: 'Past × And × Future' },
};

/**
 * 1-ээс 148 хүртэлх ангиудыг үүсгэх
 */
export const HUNTER_X_HUNTER_EPISODES: Episode[] = Array.from({ length: 148 }, (_, i) => {
  const epNum = i + 1;
  const titleInfo = HUNTER_X_HUNTER_TITLES[epNum] || {
    mn: `${epNum}-р анги`,
    en: `Episode ${epNum}`,
  };

  return {
    episodeNumber: epNum,
    title: `${epNum}-р анги - ${titleInfo.mn} (${titleInfo.en})`,
    duration: '24 мин',
    videoUrl: HUNTER_X_HUNTER_EPISODE_LINKS[epNum],
    releaseDate: epNum <= 21 ? 'Hunter Exam Arc' : epNum <= 36 ? 'Heavens Arena Arc' : epNum <= 58 ? 'Yorknew City Arc' : epNum <= 75 ? 'Greed Island Arc' : epNum <= 136 ? 'Chimera Ant Arc' : 'Election Arc',
    isNew: epNum >= 140,
  };
});

/**
 * 🎬 ХАНТЭР Х ХАНТЭР ҮНДСЭН КИНО О БЬЕКТ
 */
export const HUNTER_X_HUNTER: Movie = {
  id: 'm_hunter_x_hunter',
  title: 'Hunter x Hunter (2011)',
  titleMongolian: 'Хантэр х Хантэр (Hunter x Hunter)',
  type: 'anime',
  poster: 'https://tse3.mm.bing.net/th/id/OIP.Hs8e0KneebfdE-5KIZgQcAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  backdrop: 'https://tse4.mm.bing.net/th/id/OIP.SSSsg3xpzlb87IlINixnCQHaDx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
  year: 2011,
  duration: '148 анги (Бүрэн цуврал)',
  rating: 9.8,
  genres: ['Shounen', 'Action', 'Adventure', 'Fantasy', 'Supernatural', 'Нэн хүч'],
  description: 'Гон Фрикс хэмээх 12 настай хүү өөрийг нь багад нь орхиж явсан эцэг Гин Фриксийг дэлхийн хамгийн шилдэг Хантэр байсныг мэдсэнээр өөрөө ч Хантэр болохоор шийднэ. Тэрээр аюултай шалгалтыг давах замдаа Киллуа, Курапика, Леорио нартай нөхөрлөж, Нэн (Nen) хэмээх амьдралын нууцлаг энергийн тулааны урлагт суралцан Фантом Труп, Грийд Айланд, Химера Шоргоолжны эсрэг агуу тулаануудад оролцоно. Бүх 148 анги монгол дуу оруулга, хадмалтайгаар бүрэн холбогдсон.',
  director: 'Хироши Кошина (Hiroshi Kōjina)',
  cast: ['Гон Фрикс', 'Киллуа Золдик', 'Курапика Курута', 'Леорио Паладинайт', 'Хисока Мороу', 'Меруем (Хаан)', 'Нетеро'],
  country: 'Япон',
  price: 1000,
  isNewEpisode: true,
  newEpisodeLabel: '148 АНГИ БҮРЭН',
  totalEpisodes: 148,
  views: 3200000,
  featured: true,
  featuredRank: 2,
  trailerUrl: 'https://www.youtube.com/embed/d6kBeJjTGnY',
  videoUrl: HUNTER_X_HUNTER_EPISODE_LINKS[1],
  ageRating: '+16',
  audioTracks: ['Монгол дуу оруулга (MN DUB)', 'Япон эх хэлээр (JP Original)'],
  subtitles: ['Монгол хадмал (MN SUB)', 'English Subtitles'],
  episodes: HUNTER_X_HUNTER_EPISODES,
};
