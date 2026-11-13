// Yapılandırıcının TEK veri kaynağı: seçenekler, geometri sabitleri ve hesap formülleri.
// Gerçek üretim verisine geçiş için yalnızca bu dosya değişir:
//   1) Katsayıları (TYPES, LOADS, GEOMETRY) fabrikanın değerleriyle güncelleyin, veya
//   2) TABLE içine kesin satırlar yazın ('tip|uzunluk|dingil'); tablo formülün önüne geçer, veya
//   3) Açılışta setProductionData(await (await fetch('/data/uretim.json')).json()) çağırın.
// Tüm değerler şablon örneğidir.

export const GEOMETRY = {
  width: 2.55,           // m, yasal azami genişlik
  deckHeight: 1.3,       // m, zemin üst kotu
  kingpinSetback: 1.0,   // m, ön yüzden kingpin eksenine
  firstAxleFromRear: 1.7, // m, arka yüzden son dingile
  axleSpacing: 1.35,     // m, dingil aralığı
  landingFromFront: 2.6, // m, ön yüzden iniş ayaklarına
};

export const LENGTH = { min: 10.5, max: 15, step: 0.1, default: 13.6 };
export const AXLES = { options: [2, 3, 4], default: 3 };

// Yük hesabı: brüt = dingil sayısı x dingil yükü + kingpin yükü
export const LOADS = {
  axleLoad: 11,       // t, dingil başına teknik kapasite
  kingpinLoad: 6,     // t, çekiciye binen pay
  tarePerMeter: 0.42, // t/m, referans uzunluktan sapma başına dara farkı
  tarePerAxle: 0.8,   // t, referans dingil sayısından sapma başına dara farkı
  refLength: 13.6,
  refAxles: 3,
  maxGross: null,     // t, yasal üst sınır uygulanacaksa sayı yazın (örn. 40)
};

// capacity: değer = (L + offset) x perMeter. kind, etiketi ve birimi belirler.
export const TYPES = {
  duz: { label: 'Düz platform', tare: 6.2, capacity: { kind: 'area', perMeter: 2.55, offset: 0, digits: 1 } },
  tenteli: { label: 'Tenteli', tare: 7.4, capacity: { kind: 'volume', perMeter: 2.48 * 2.7, offset: 0, digits: 0 } },
  tanker: { label: 'Tanker', tare: 7.0, capacity: { kind: 'liters', perMeter: 2700, offset: -0.3, digits: 0 } },
  kasa: { label: 'Kapalı kasa', tare: 8.2, capacity: { kind: 'volume', perMeter: 2.48 * 2.7, offset: 0, digits: 0 } },
};
export const CAPACITY_KINDS = {
  area: { label: 'Yüzey', unit: 'm²' },
  volume: { label: 'Hacim', unit: 'm³' },
  liters: { label: 'Hacim', unit: 'L' },
};

export const COLORS = [
  { id: 'beyaz', label: 'Beyaz', hex: 0xe9edf0 },
  { id: 'grafit', label: 'Grafit', hex: 0x2b3037 },
  { id: 'sari', label: 'Sinyal sarısı', hex: 0xffc400 },
  { id: 'kirmizi', label: 'Kırmızı', hex: 0xd11f2b },
  { id: 'mavi', label: 'Mavi', hex: 0x1f4f86 },
  { id: 'yesil', label: 'Yeşil', hex: 0x1f6b4a },
];

// Şasi ve donanım seçenekleri. tare: daraya etkisi (t). Fren darası dingil başınadır.
export const AXLE_BRANDS = [{ id: 'bpw', label: 'BPW' }, { id: 'saf', label: 'SAF' }, { id: 'yerli', label: 'Yerli üretim' }];
export const BRAKES = [{ id: 'disk', label: 'Disk', tare: 0 }, { id: 'kampana', label: 'Kampana', tare: 0.06 }];
export const OPTIONS = [
  { id: 'lift', label: 'Ön dingil kaldırma', tare: 0.09 },
  { id: 'stepne', label: 'Çift stepnelik', tare: 0.18 },
  { id: 'alujant', label: 'Alüminyum jant', tare: -0.12 },
  { id: 'dolap', label: 'Yemek dolabı', tare: 0.06 },
  { id: 'avadanlik', label: 'Avadanlık', tare: 0.04 },
  { id: 'yangin', label: 'Yangın tüpü dolabı', tare: 0.02 },
];

export const DEFAULTS = { type: 'duz', L: LENGTH.default, axles: AXLES.default, color: COLORS[0].hex, brand: 'bpw', brake: 'disk', options: [] };
export const byId = <T extends { id: string }>(list: T[], id: string): T => list.find((x) => x.id === id) ?? list[0];

// Kesin üretim değerleri. Anahtar: 'tip|uzunluk|dingil', örn. 'duz|13.6|3': { tare: 6.15, payload: 32.9, capacity: 34.7 }
export interface ProductionRow { tare?: number; payload?: number; capacity?: number }
export const TABLE: Record<string, ProductionRow> = {};
export function setProductionData(rows: Record<string, ProductionRow>) { Object.assign(TABLE, rows); }

export interface Config { type: string; L: number; axles: number; color?: number; brand?: string; brake?: string; options?: string[] }
const key = ({ type, L, axles }: Pick<Config, 'type' | 'L' | 'axles'>) => `${type}|${(+L).toFixed(1)}|${axles}`;

// Saf hesap: { tare, payload, gross (t), capacity, capacityKind, exact }
export function computeSpecs(cfg: Config) {
  const type = TYPES[cfg.type as keyof typeof TYPES];
  const gross0 = cfg.axles * LOADS.axleLoad + LOADS.kingpinLoad;
  const gross = LOADS.maxGross ? Math.min(gross0, LOADS.maxGross) : gross0;
  const tare = type.tare + (cfg.L - LOADS.refLength) * LOADS.tarePerMeter + (cfg.axles - LOADS.refAxles) * LOADS.tarePerAxle;
  const extra = byId(BRAKES, cfg.brake ?? 'disk').tare * cfg.axles + (cfg.options ?? []).reduce((sum: number, id: string) => sum + (OPTIONS.find((o) => o.id === id)?.tare ?? 0), 0);
  const c = type.capacity;
  const base = { tare: tare + extra, payload: gross - tare - extra, gross, capacity: (cfg.L + c.offset) * c.perMeter, capacityKind: c.kind, capacityDigits: c.digits, exact: false };
  const row = TABLE[key(cfg)];
  return row ? { ...base, ...row, exact: true } : base;
}

// Dingil eksenleri (treyler yerel z, arka -L/2): çizim, model ve ölçü katmanı aynı değeri kullanır
export function axlePositions(L: number, axles: number) {
  return Array.from({ length: axles }, (_, i) => -L / 2 + GEOMETRY.firstAxleFromRear + i * GEOMETRY.axleSpacing);
}
export const kingpinZ = (L: number) => L / 2 - GEOMETRY.kingpinSetback;

export const colorByHex = (hex: number) => COLORS.find((c) => c.hex === hex) ?? COLORS[0];
