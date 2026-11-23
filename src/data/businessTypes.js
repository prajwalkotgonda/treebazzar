import { 
  Sprout, 
  Microscope, 
  Layers, 
  Leaf, 
  Grid3X3, 
  Cog, 
  FlaskConical 
} from 'lucide-react';

export const BUSINESS_TYPES = [
  {
    id: 'nursery_plants_producer',
    num: 1,
    titleEn: 'Nursery & Plants Producer',
    titleMr: 'रोपवाटिका व रोपे उत्पादक',
    shortTitleEn: 'Nursery & Plants',
    shortTitleMr: 'रोपवाटिका व रोपे',
    subtitleEn: 'Fruit Plants & Grafts • Flowering Plants • Indoor Plants',
    subtitleMr: 'फळझाडे व कलमे • फुलझाडे • इनडोअर रोपे',
    icon: Sprout,
    emoji: '🌱',
    accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-700',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'tissue_culture_lab',
    num: 2,
    titleEn: 'Tissue Culture Lab & Plants',
    titleMr: 'टिशू कल्चर लॅब व रोपे',
    shortTitleEn: 'Tissue Culture',
    shortTitleMr: 'टिशू कल्चर',
    subtitleEn: 'Tissue Culture Plants • Banana & Sugarcane • Teak Wood',
    subtitleMr: 'टिशू कल्चर रोपे • केळी व ऊस • सागवान',
    icon: Microscope,
    emoji: '🔬',
    accentBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconBg: 'bg-cyan-100 text-cyan-700',
    badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  {
    id: 'cocopeat_producer',
    num: 3,
    titleEn: 'Cocopeat Producer',
    titleMr: 'कोकोपीट उत्पादक',
    shortTitleEn: 'Cocopeat Producer',
    shortTitleMr: 'कोकोपीट उत्पादक',
    subtitleEn: 'Cocopeat Blocks & Powder • Ready Potting Mix • Grow Bags',
    subtitleMr: 'कोकोपीट ब्लॉक व पावडर • पॉटिंग मिक्स • ग्रो बॅग्ज',
    icon: Layers,
    emoji: '🥥',
    accentBg: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-800',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'seeds_fertilizers_pesticides',
    num: 4,
    titleEn: 'Seeds, Fertilizers & Pesticides',
    titleMr: 'बियाणे, खते व कीटकनाशके',
    shortTitleEn: 'Seeds & Fertilizers',
    shortTitleMr: 'बियाणे व खते',
    subtitleEn: 'Vegetable Seeds • Flower Seeds • Hybrid Seeds & Bio-Fertilizers',
    subtitleMr: 'भाजीपाला बियाणे • फुले बियाणे • सेंद्रिय खते व औषधे',
    icon: Leaf,
    emoji: '🌿',
    accentBg: 'bg-lime-50 text-lime-800 border-lime-200',
    iconBg: 'bg-lime-100 text-lime-800',
    badgeClass: 'bg-lime-50 text-lime-800 border-lime-200'
  },
  {
    id: 'nursery_tray_producer',
    num: 5,
    titleEn: 'Nursery Tray Producer',
    titleMr: 'रोपवाटिका ट्रे उत्पादक',
    shortTitleEn: 'Nursery Trays',
    shortTitleMr: 'रोपवाटिका ट्रे',
    subtitleEn: 'Seedling Pro Trays (50, 98, 104) • Cavity Trays • Pots',
    subtitleMr: 'प्रोट्रे (५०, ९८, १०४) • कॅव्हिटी ट्रे • नर्सरी कुंडी',
    icon: Grid3X3,
    emoji: '🪴',
    accentBg: 'bg-orange-50 text-orange-700 border-orange-200',
    iconBg: 'bg-orange-100 text-orange-700',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  {
    id: 'nursery_machinery_equipment',
    num: 6,
    titleEn: 'Nursery Machinery & Equipment',
    titleMr: 'नर्सरी मशिनरी व अवजारे',
    shortTitleEn: 'Machinery & Tools',
    shortTitleMr: 'मशिनरी व अवजारे',
    subtitleEn: 'Sprayer Machines & Pumps • Soil Mixer • Shade Net & Tools',
    subtitleMr: 'स्प्रेअर व पंप्स • सॉईल मिक्सर • शेडनेट व अवजारे',
    icon: Cog,
    emoji: '⚙️',
    accentBg: 'bg-slate-100 text-slate-800 border-slate-300',
    iconBg: 'bg-slate-200 text-slate-800',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
  },
  {
    id: 'soil_water_testing_labs',
    num: 7,
    titleEn: 'Soil & Water Testing Labs',
    titleMr: 'माती व पाणी तपासणी प्रयोगशाळा',
    shortTitleEn: 'Soil & Water Testing',
    shortTitleMr: 'माती व पाणी परीक्षण',
    subtitleEn: 'Soil Testing Services • Water Testing Services • Advisory',
    subtitleMr: 'माती परीक्षण • पाणी परीक्षण • खत व्यवस्थापन सल्ला',
    icon: FlaskConical,
    emoji: '🧪',
    accentBg: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-100 text-purple-700',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200'
  }
];

export function getBusinessType(id) {
  if (!id) return BUSINESS_TYPES[0];
  const found = BUSINESS_TYPES.find(b => b.id.toLowerCase() === id.toLowerCase());
  return found || BUSINESS_TYPES[0];
}

export function getBusinessTypeTitle(id, lang = 'en') {
  const bt = getBusinessType(id);
  return lang === 'mr' ? bt.titleMr : bt.titleEn;
}
