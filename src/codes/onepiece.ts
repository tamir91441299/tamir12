import { PromoCode } from '../lib/codeService';
import { Episode } from '../types';

/**
 * One Piece 1-р ангиас 100-р анги хүртэлх албан ёсны ангийн мэдээлэл болон холбоос
 * (East Blue Saga & Arabasta Saga 1-100)
 */
export const BASE_SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
export const EPISODE_1_DRIVE_URL = 'https://drive.google.com/file/d/17DVAzznd7y3pBb-lr9yF0pTGfJGUDu0r/view?usp=drivesdk';

// 1-100 ангийн албан ёсны нэрсийн бүрэн жагсаалт
export const ONE_PIECE_EPISODE_TITLES: { [key: number]: string } = {
  1: 'Би бол Луффи! Далайн дээрэмчдийн хаан болох хүн!',
  2: 'Их сэлэмчин гарч ирэв! Дээрэмчдийн ангууч Ророноа Зоро',
  3: 'Морган ба Луффи! Нууцлаг үзэсгэлэнт охин хэн бэ?',
  4: 'Луффигийн өнгөрсөн үе! Улаан үст Шанкс гарч ирэв',
  5: 'Аймшигт нууцлаг хүч! Алиалагч Багги ахмад',
  6: 'Цөхрөлтгүй тулаан! Илбэчин Можи ба Луффи',
  7: 'Ширүүн тэмцэл! Сэлэмчин Зоро ба акробатчин Кабажи',
  8: 'Хэн нь ялах вэ? Чөтгөрийн жимсний хүчний мөргөлдөөн!',
  9: 'Шударга худалч уу? Ахмад Усопп',
  10: 'Дэлхийн хамгийн этгээд эр! Капитан Күрогийн хорон төлөвлөгөө',
  11: 'Хуйвалдааныг илрүүлсэн нь! Дээрэмчин хар муурсын баг',
  12: 'Их тулаан! Муурсын багийн эсрэг эрэлхэг хамгаалалт',
  13: 'Аймшигт хос! Муур ах дүүсийн эсрэг Зоро',
  14: 'Луффигийн сэргэлт! Каяа авхайн зоригт шийдвэр',
  15: 'Күрог ялсан нь! Усоппын нулимст тангараг',
  16: 'Усоппын багийг хамгаал! Going Merry хөлөг төрсөн нь',
  17: 'Уур хилэн дэлбэрэв! Баггигийн эсрэг шийдвэрлэх цохилт',
  18: 'Чи бол ховор амьтан! Гаймон ба түүний хачин нөхөд',
  19: 'Гурван сэлмийн өнгөрсөн үе! Зоро ба Куинагийн амлалт',
  20: 'Алдарт тогооч! Далайн Барати ресторан дахь Санжи',
  21: 'Урилгагүй зочин! Гин хэмээх өлссөн далайн дээрэмчин',
  22: 'Дон Крик! Зүүн тэнгисийн хамгийн хүчирхэг флот',
  23: 'Баратиг хамгаал! Улаан хөлт Зефф ба Санжи',
  24: 'Шонхор нүдэт Михок! Сэлэмчин Зоро далайд унав',
  25: 'Үхлийн тулаан! Санжигийн хөлийн хүч ба Паарл',
  26: 'Зефф ба Санжийн мөрөөдөл! Бүх цэнхэр далай (All Blue)',
  27: 'Хүйтэн сэтгэлт чөтгөр! Гингийн нулимс ба үнэнч сэтгэл',
  28: 'Би үхэхгүй! Луффигийн амь өрссөн шийдвэр',
  29: 'Шийдвэрлэх цохилт! Зориг ба итгэлийн төгсгөл',
  30: 'Баяртай найзууд минь! Санжи замдаа гарав',
  31: 'Зүүн тэнгисийн хамгийн хорон муу эр! Загас хүн Арлонг',
  32: 'Кокоми арал дахь шулмас! Намигийн нууц гэрээ',
  33: 'Усопп үхэх үү? Луффи арал дээр буув',
  34: 'Үнэн илчлэгдэв! Намигийн гашуун өнгөрсөн үе',
  35: 'Үл үзэгдэх өнгөрсөн үе! Эрэлхэг дайчин Беллмере',
  36: 'Амьд үлдэх тэмцэл! Беллмере ээжийн агуу хайр',
  37: 'Луффи босож ирэв! Намигийн тусламж эрэн дуудах дуу',
  38: 'Луффигийн уур хилэн! Загас хүмүүсийн цайз дахь тулаан',
  39: 'Зоро ба Хачийн тулаан! Октопус сэлэмчний эсрэг',
  40: 'Бахархалт дайчид! Санжи ба Усоппын ялалт',
  41: 'Луффигийн дээд хүч! Намигийн зовлонт өрөөг устгав',
  42: 'Арлонгийн сүйрэл! Намигийн нулимс ба эрх чөлөө',
  43: 'Зүүн тэнгисийн хаан! Луффи 30 сая беригийн шагналтай болов',
  44: 'Инээмсэглэлээр дүүрэн аялал! Баяртай эх нутаг минь',
  45: 'Эрэн сурвалжлагдах хуудас! Сүрэл малгайт баг дэлхийд танигдав',
  46: 'Баггигийн адал явдал! Бяцхан ахмадын эрэл',
  47: 'Албин тулаан! Ахмад Багги ба Альвидагийн нэгдэл',
  48: 'Эхлэл ба төгсгөлийн хот! Логтаун хотод ирсэн нь',
  49: 'Сандай Китэцу ба Юбашири! Зоро шинэ сэлэм сонгов',
  50: 'Усопп ба Усоппын эцгийн буудлагын өрсөлдөөн',
  51: 'Хамгийн амтат тулаан! Санжигийн хоол хийх тэмцээн',
  52: 'Цаазын тавцан дээрх инээмсэглэл! Луффи ба аянга',
  53: 'Домогт аянга ба Смокер офицерын мөрдлөг',
  54: 'Шинэ аяллын эхлэл! Нууцлаг охин Апис ба лууны домог',
  55: 'Гайхамшигт луу! Аписын нууц ба арал',
  56: 'Эрикын дайралт! Лууны арлаас зугтсан нь',
  57: 'Домогт алдагдсан арал! Далайн нууцыг тайлав',
  58: 'Балгас дахь тулаан! Зоро ба Эрикын сэлмийн тулаан',
  59: 'Луффи бүслэлтийг сэтлэв! Тэнгисийн цэргийн төлөвлөгөө нурав',
  60: 'Тэнгэрт дүүлэх луу! Домогт луугийн үүр',
  61: 'Улаан шугамыг давах нь! Гранд Лайн руу орох хаалга',
  62: 'Анхны саад! Аварга халим Лабүүн гарч ирэв',
  63: 'Эр хүний амлалт! Луффи ба халим Лабүүний тангараг',
  64: 'Дээрэмчдийг угтах хотхон! Виски Пикт тавтай морил',
  65: 'Зорогийн ганцаарчилсан тулаан! 100 ангуучийн эсрэг',
  66: 'Ширүүн тулаан! Луффи ба Зорогийн ойлгомжгүй маргаан',
  67: 'Гүнж Вивиг авар! Барок Воркс бүлэглэлийн нууц',
  68: 'Бууж өгөхгүй зориг! Коби ба Хельмеппогийн шинэ замнал',
  69: 'Гарпын хатуу шийтгэл! Цэргүүдийн дасгал сургуулилт',
  70: 'Эртний ертөнц! Бяцхан Цэцэрлэг (Little Garden) арал',
  71: 'Аварга биет дайчид! Дорри ба Брогигийн 100 жилийн тулаан',
  72: 'Луффигийн уур хилэн! Аваргуудын тулаанд орсон урхи',
  73: 'Брогигийн нулимст ялалт! Ноён 3-ын хорон санаа',
  74: 'Лааны тосон урхи! Ноён 3 ба Луффигийн тулаан',
  75: 'Луффигийн инээдэмт хүч! Өнгөт хавхыг эвдсэн нь',
  76: 'Эсрэг дайралт! Усоппын галт бөмбөлөг ба аврал',
  77: 'Баяртай аваргууд аа! Алабастаг чиглэсэн шинэ аялал',
  78: 'Нами өвдөв! Цасан шуурга дахь эмчийн эрэл',
  79: 'Гэнэтийн дайралт! Вапол ба Бликинг хөлөг',
  80: 'Эмчгүй арал! Драм хаант улс дахь адал явдал',
  81: 'Сэтгэл хангалуун уу? Цасан уулын орой дахь эмч Куреха',
  82: 'Долтонгийн зориг! Ваполын арми буцаж ирэв',
  83: 'Цасан оргилыг давах нь! Намиг үүрсэн Луффигийн тэсвэр',
  84: 'Цэнхэр хамарт буга! Чопперын нууц илчлэгдэв',
  85: 'Чөтгөр гэж нэрлэгдсэн нь! Доктор Хирулукийн агуу мөрөөдөл',
  86: 'Хирулукийн интоорын цэцэгс ба дэлбэрсэн үхэл',
  87: 'Ваполын эсрэг бослого! Чопперын тулааны хувирлууд',
  88: 'Амьтны төрөлт чөтгөрийн жимс! Чопперын 7 хувирал',
  89: 'Хааны төгсгөл! Луффигийн пуужин цохилт',
  90: 'Хирулукийн интоорын цас! Драм арлын гайхамшиг',
  91: 'Баяртай Драм арал! Чоппер багт нэгдэв',
  92: 'Алабастагийн баатар ба цөлийн нууц',
  93: 'Элсэн цөл рүү! Юба хот дахь хуурайшилтын нууц',
  94: 'Хүчирхэг баатрууд уулзав! Галт нударга Эйс ба Луффи',
  95: 'Эйс ба Луффи! Ах дүүсийн халуун дурсамж',
  96: 'Ногоон хот Эрума ба Кунг-фү дугуйт дунгууд',
  97: 'Элсэн цөлийн адал явдал! Чөтгөрийн хөндийг гаталсан нь',
  98: 'Цөлийн дээрэмчид! Энх тайвныг эрэлхийлэгч залуус',
  99: 'Хуурамч баатрууд! Камелийн зоригт сэтгэл',
  100: 'Босогчдын ахлагч Коза! Вивигийн нулимст итгэл найдварын тангараг'
};

/**
 * 🏴‍☠️ 1-100-р АНГИ БҮРИЙН ШУУД ВИДЕО / GOOGLE DRIVE ЛИНК ХОЛБОХ ХЭСЭГ
 * 
 * Та доорх жагсаалтын хүссэн ангийнхаа ард Google Drive, шууд MP4, эсвэл видео линкээ оруулж холбоно уу.
 * Жишээ: 1: 'https://drive.google.com/file/d/.../view?usp=drivesdk'
 */
export const ONE_PIECE_EPISODE_LINKS: { [key: number]: string } = {
  // === EAST BLUE SAGA: Romance Dawn & Orange Town (1-8) ===
  1: EPISODE_1_DRIVE_URL,
  2: BASE_SAMPLE_VIDEO,
  3: BASE_SAMPLE_VIDEO,
  4: BASE_SAMPLE_VIDEO,
  5: BASE_SAMPLE_VIDEO,
  6: BASE_SAMPLE_VIDEO,
  7: BASE_SAMPLE_VIDEO,
  8: BASE_SAMPLE_VIDEO,

  // === Syrup Village Arc: Captain Kuro (9-18) ===
  9: BASE_SAMPLE_VIDEO,
  10: BASE_SAMPLE_VIDEO,
  11: BASE_SAMPLE_VIDEO,
  12: BASE_SAMPLE_VIDEO,
  13: BASE_SAMPLE_VIDEO,
  14: BASE_SAMPLE_VIDEO,
  15: BASE_SAMPLE_VIDEO,
  16: BASE_SAMPLE_VIDEO,
  17: BASE_SAMPLE_VIDEO,
  18: BASE_SAMPLE_VIDEO,

  // === Baratie Arc: Sanji & Don Krieg (19-30) ===
  19: BASE_SAMPLE_VIDEO,
  20: BASE_SAMPLE_VIDEO,
  21: BASE_SAMPLE_VIDEO,
  22: BASE_SAMPLE_VIDEO,
  23: BASE_SAMPLE_VIDEO,
  24: BASE_SAMPLE_VIDEO,
  25: BASE_SAMPLE_VIDEO,
  26: BASE_SAMPLE_VIDEO,
  27: BASE_SAMPLE_VIDEO,
  28: BASE_SAMPLE_VIDEO,
  29: BASE_SAMPLE_VIDEO,
  30: BASE_SAMPLE_VIDEO,

  // === Arlong Park Arc: Nami's Past (31-44) ===
  31: BASE_SAMPLE_VIDEO,
  32: BASE_SAMPLE_VIDEO,
  33: BASE_SAMPLE_VIDEO,
  34: BASE_SAMPLE_VIDEO,
  35: BASE_SAMPLE_VIDEO,
  36: BASE_SAMPLE_VIDEO,
  37: BASE_SAMPLE_VIDEO,
  38: BASE_SAMPLE_VIDEO,
  39: BASE_SAMPLE_VIDEO,
  40: BASE_SAMPLE_VIDEO,
  41: BASE_SAMPLE_VIDEO,
  42: BASE_SAMPLE_VIDEO,
  43: BASE_SAMPLE_VIDEO,
  44: BASE_SAMPLE_VIDEO,

  // === Loguetown & Warship Island Arc (45-61) ===
  45: BASE_SAMPLE_VIDEO,
  46: BASE_SAMPLE_VIDEO,
  47: BASE_SAMPLE_VIDEO,
  48: BASE_SAMPLE_VIDEO,
  49: BASE_SAMPLE_VIDEO,
  50: BASE_SAMPLE_VIDEO,
  51: BASE_SAMPLE_VIDEO,
  52: BASE_SAMPLE_VIDEO,
  53: BASE_SAMPLE_VIDEO,
  54: BASE_SAMPLE_VIDEO,
  55: BASE_SAMPLE_VIDEO,
  56: BASE_SAMPLE_VIDEO,
  57: BASE_SAMPLE_VIDEO,
  58: BASE_SAMPLE_VIDEO,
  59: BASE_SAMPLE_VIDEO,
  60: BASE_SAMPLE_VIDEO,
  61: BASE_SAMPLE_VIDEO,

  // === ARABASTA SAGA: Reverse Mountain & Whisky Peak (62-67) ===
  62: BASE_SAMPLE_VIDEO,
  63: BASE_SAMPLE_VIDEO,
  64: BASE_SAMPLE_VIDEO,
  65: BASE_SAMPLE_VIDEO,
  66: BASE_SAMPLE_VIDEO,
  67: BASE_SAMPLE_VIDEO,

  // === Little Garden Arc: Giants Dorry & Brogy (68-77) ===
  68: BASE_SAMPLE_VIDEO,
  69: BASE_SAMPLE_VIDEO,
  70: BASE_SAMPLE_VIDEO,
  71: BASE_SAMPLE_VIDEO,
  72: BASE_SAMPLE_VIDEO,
  73: BASE_SAMPLE_VIDEO,
  74: BASE_SAMPLE_VIDEO,
  75: BASE_SAMPLE_VIDEO,
  76: BASE_SAMPLE_VIDEO,
  77: BASE_SAMPLE_VIDEO,

  // === Drum Island Arc: Chopper & Dr. Hiriluk (78-91) ===
  78: BASE_SAMPLE_VIDEO,
  79: BASE_SAMPLE_VIDEO,
  80: BASE_SAMPLE_VIDEO,
  81: BASE_SAMPLE_VIDEO,
  82: BASE_SAMPLE_VIDEO,
  83: BASE_SAMPLE_VIDEO,
  84: BASE_SAMPLE_VIDEO,
  85: BASE_SAMPLE_VIDEO,
  86: BASE_SAMPLE_VIDEO,
  87: BASE_SAMPLE_VIDEO,
  88: BASE_SAMPLE_VIDEO,
  89: BASE_SAMPLE_VIDEO,
  90: BASE_SAMPLE_VIDEO,
  91: BASE_SAMPLE_VIDEO,

  // === Arabasta Kingdom Arc: Desert & Port City (92-100) ===
  92: BASE_SAMPLE_VIDEO,
  93: BASE_SAMPLE_VIDEO,
  94: BASE_SAMPLE_VIDEO,
  95: BASE_SAMPLE_VIDEO,
  96: BASE_SAMPLE_VIDEO,
  97: BASE_SAMPLE_VIDEO,
  98: BASE_SAMPLE_VIDEO,
  99: BASE_SAMPLE_VIDEO,
  100: BASE_SAMPLE_VIDEO,
};

/**
 * 1-100 хүртэлх ангиудын бүрэн жагсаалт үүсгэх
 */
export const ONE_PIECE_100_EPISODES: Episode[] = Array.from({ length: 100 }, (_, index) => {
  const epNum = index + 1;
  const title = ONE_PIECE_EPISODE_TITLES[epNum] || `${epNum}-р анги - One Piece Их аялал`;
  const videoUrl = ONE_PIECE_EPISODE_LINKS[epNum] || (epNum === 1 ? EPISODE_1_DRIVE_URL : BASE_SAMPLE_VIDEO);

  return {
    episodeNumber: epNum,
    title: `${epNum}-р анги: ${title}`,
    duration: '24 мин',
    videoUrl: videoUrl,
    releaseDate: '2025',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  };
});

/**
 * Тухайн ангийн шууд холбоосыг авах туслах функц
 */
export function getOnePieceEpisodeLink(episodeNumber: number): string {
  return ONE_PIECE_EPISODE_LINKS[episodeNumber] || BASE_SAMPLE_VIDEO;
}

/**
 * Тухайн ангийн бүрэн мэдээллийг авах туслах функц
 */
export function getOnePieceEpisode(episodeNumber: number): Episode | undefined {
  return ONE_PIECE_100_EPISODES.find((ep) => ep.episodeNumber === episodeNumber);
}

/**
 * One Piece тусгай эрхийн кодууд (1-100 анги)
 */
export const ONE_PIECE_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo_onepiece_100',
    code: 'ONEPIECE100',
    type: 'anime',
    durationDays: 30,
    description: '🏴‍☠️ One Piece (Ван Пис) 1-100 анги үзэх 30 хоногийн эрхийн код',
    maxUses: 10000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_onepiece',
    code: 'ONEPIECE',
    type: 'anime',
    durationDays: 30,
    description: '🏴‍☠️ One Piece (Ван Пис) 1-100 анги үзэх 30 хоногийн код',
    maxUses: 10000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_op100',
    code: 'OP100',
    type: 'anime',
    durationDays: 30,
    description: '🏴‍☠️ OP 1-100 бүрэн анги үзэх шуурхай эрхийн код',
    maxUses: 10000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_movie100',
    code: 'MOVIE100',
    type: 'movie',
    durationDays: 30,
    description: '🎬 One Piece болон 100 ангит цуврал, кино үзэх 30 хоногийн эрх',
    maxUses: 10000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  },
  {
    id: 'promo_onepiece_movie',
    code: 'ONEPIECE-MOVIE',
    type: 'movie',
    durationDays: 30,
    description: '🎬 One Piece 1-100 анги болон кино багц үзэх код',
    maxUses: 10000,
    usedCount: 0,
    createdAt: '2025.01.01',
    createdBy: 'Тамир Админ',
    isActive: true,
  }
];

/**
 * One Piece кодын мэдээлэл болон баталгаажуулагч туслах функц
 */
export function isOnePieceCode(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase().replace(/[\s_-]/g, '');
  return clean === 'ONEPIECE' || clean === 'ONEPIECE100' || clean === 'OP100' || clean === 'MOVIE100' || clean === 'ONEPIECEMOVIE';
}

export function getOnePieceCodeDetails(code: string): PromoCode | undefined {
  if (!code) return undefined;
  const clean = code.trim().toUpperCase().replace(/[\s_-]/g, '');
  return ONE_PIECE_PROMO_CODES.find(
    (c) => c.code.toUpperCase().replace(/[\s_-]/g, '') === clean
  );
}

