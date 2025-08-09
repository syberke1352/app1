// Juz to Surah mapping for better organization
export interface JuzInfo {
  juz: number;
  name: string;
  surahs: {
    surahNumber: number;
    surahName: string;
    startAyah: number;
    endAyah: number;
  }[];
}

export const JUZ_MAPPING: JuzInfo[] = [
  {
    juz: 1,
    name: "Alif Lam Mim",
    surahs: [
      { surahNumber: 1, surahName: "Al-Fatihah", startAyah: 1, endAyah: 7 },
      { surahNumber: 2, surahName: "Al-Baqarah", startAyah: 1, endAyah: 141 }
    ]
  },
  {
    juz: 2,
    name: "Sayaqul",
    surahs: [
      { surahNumber: 2, surahName: "Al-Baqarah", startAyah: 142, endAyah: 252 }
    ]
  },
  {
    juz: 3,
    name: "Tilka Rusul",
    surahs: [
      { surahNumber: 2, surahName: "Al-Baqarah", startAyah: 253, endAyah: 286 },
      { surahNumber: 3, surahName: "Ali 'Imran", startAyah: 1, endAyah: 92 }
    ]
  },
  {
    juz: 4,
    name: "Lan Tanalu",
    surahs: [
      { surahNumber: 3, surahName: "Ali 'Imran", startAyah: 93, endAyah: 200 },
      { surahNumber: 4, surahName: "An-Nisa'", startAyah: 1, endAyah: 23 }
    ]
  },
  {
    juz: 5,
    name: "Wal Muhsanat",
    surahs: [
      { surahNumber: 4, surahName: "An-Nisa'", startAyah: 24, endAyah: 147 }
    ]
  }
  // Continue for all 30 juz...
];

export const getJuzBySurah = (surahNumber: number, ayahNumber: number): number => {
  for (const juz of JUZ_MAPPING) {
    for (const surah of juz.surahs) {
      if (surah.surahNumber === surahNumber && 
          ayahNumber >= surah.startAyah && 
          ayahNumber <= surah.endAyah) {
        return juz.juz;
      }
    }
  }
  return 1; // Default to juz 1 if not found
};

export const getJuzInfo = (juzNumber: number): JuzInfo | undefined => {
  return JUZ_MAPPING.find(juz => juz.juz === juzNumber);
};

export const getSurahsInJuz = (juzNumber: number): JuzInfo['surahs'] => {
  const juzInfo = getJuzInfo(juzNumber);
  return juzInfo?.surahs || [];
};