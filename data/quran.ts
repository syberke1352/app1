// Complete Quran data for offline usage
export interface SurahData {
  nomor: number;
  nama: string;
  namaLatin: string;
  arti: string;
  jumlahAyat: number;
  tempatTurun: string;
  ayat: AyatData[];
}

export interface AyatData {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
}

export const QURAN_DATA: SurahData[] = [
  {
    nomor: 1,
    nama: "الفاتحة",
    namaLatin: "Al-Fatihah",
    arti: "Pembukaan",
    jumlahAyat: 7,
    tempatTurun: "mekah",
    ayat: [
      {
        nomorAyat: 1,
        teksArab: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        teksLatin: "Bismillahir rahmanir rahiim",
        teksIndonesia: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang."
      },
      {
        nomorAyat: 2,
        teksArab: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        teksLatin: "Alhamdulillahi rabbil 'alamiin",
        teksIndonesia: "Segala puji bagi Allah, Tuhan seluruh alam,"
      },
      {
        nomorAyat: 3,
        teksArab: "الرَّحْمَٰنِ الرَّحِيمِ",
        teksLatin: "Ar rahmanir rahiim",
        teksIndonesia: "Yang Maha Pengasih, Maha Penyayang,"
      },
      {
        nomorAyat: 4,
        teksArab: "مَالِكِ يَوْمِ الدِّينِ",
        teksLatin: "Maliki yaumid diin",
        teksIndonesia: "Pemilik hari pembalasan."
      },
      {
        nomorAyat: 5,
        teksArab: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        teksLatin: "Iyyaka na'budu wa iyyaka nasta'iin",
        teksIndonesia: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan."
      },
      {
        nomorAyat: 6,
        teksArab: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        teksLatin: "Ihdinash shiratal mustaqiim",
        teksIndonesia: "Tunjukilah kami jalan yang lurus,"
      },
      {
        nomorAyat: 7,
        teksArab: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        teksLatin: "Shiratal ladziina an'amta 'alaihim ghairil maghdhuubi 'alaihim wa ladh dhaaliin",
        teksIndonesia: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat."
      }
    ]
  },
  {
    nomor: 2,
    nama: "البقرة",
    namaLatin: "Al-Baqarah",
    arti: "Sapi Betina",
    jumlahAyat: 286,
    tempatTurun: "madinah",
    ayat: [
      {
        nomorAyat: 1,
        teksArab: "الم",
        teksLatin: "Alif laam miim",
        teksIndonesia: "Alif laam miim."
      },
      {
        nomorAyat: 2,
        teksArab: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
        teksLatin: "Dzalikal kitabu laa raiba fiih, hudal lil muttaqiin",
        teksIndonesia: "Kitab (Al-Qur'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa,"
      },
      {
        nomorAyat: 3,
        teksArab: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ",
        teksLatin: "Alladziina yu'minuuna bil ghaibi wa yuqiimuunash shalaata wa mimmaa razaqnaahum yunfiquun",
        teksIndonesia: "(yaitu) mereka yang beriman kepada yang ghaib, yang mendirikan shalat, dan menafkahkan sebahagian rezeki yang Kami anugerahkan kepada mereka."
      }
      // Note: In a real implementation, you would include all 286 ayat
      // For demo purposes, I'm including just the first few
    ]
  },
  {
    nomor: 3,
    nama: "آل عمران",
    namaLatin: "Ali 'Imran",
    arti: "Keluarga Imran",
    jumlahAyat: 200,
    tempatTurun: "madinah",
    ayat: [
      {
        nomorAyat: 1,
        teksArab: "الم",
        teksLatin: "Alif laam miim",
        teksIndonesia: "Alif laam miim."
      },
      {
        nomorAyat: 2,
        teksArab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        teksLatin: "Allaahu laa ilaaha illaa huwal hayyul qayyuum",
        teksIndonesia: "Allah, tidak ada Tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya)."
      }
    ]
  },
  {
    nomor: 4,
    nama: "النساء",
    namaLatin: "An-Nisa'",
    arti: "Wanita",
    jumlahAyat: 176,
    tempatTurun: "madinah",
    ayat: [
      {
        nomorAyat: 1,
        teksArab: "يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ",
        teksLatin: "Yaa ayyuhan naasuttaquu rabbakumul ladzii khalaqakum min nafsin waahidah",
        teksIndonesia: "Hai sekalian manusia, bertakwalah kepada Tuhan-mu yang telah menciptakan kamu dari seorang diri,"
      }
    ]
  },
  {
    nomor: 5,
    nama: "المائدة",
    namaLatin: "Al-Ma'idah",
    arti: "Hidangan",
    jumlahAyat: 120,
    tempatTurun: "madinah",
    ayat: [
      {
        nomorAyat: 1,
        teksArab: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ",
        teksLatin: "Yaa ayyuhal ladziina aamanuu aufuu bil 'uquud",
        teksIndonesia: "Hai orang-orang yang beriman, penuhilah aqad-aqad itu."
      }
    ]
  }
  // Note: In a complete implementation, you would include all 114 surahs
  // For this demo, I'm including the first 5 surahs with sample ayat
];

// Helper functions
export const getSurahByNumber = (nomor: number): SurahData | undefined => {
  return QURAN_DATA.find(surah => surah.nomor === nomor);
};

export const searchSurah = (query: string): SurahData[] => {
  const lowercaseQuery = query.toLowerCase();
  return QURAN_DATA.filter(surah =>
    surah.namaLatin.toLowerCase().includes(lowercaseQuery) ||
    surah.nama.includes(query) ||
    surah.arti.toLowerCase().includes(lowercaseQuery) ||
    surah.nomor.toString().includes(query)
  );
};

export const getJuzMapping = (): { [key: number]: number[] } => {
  // Mapping of Juz to Surah numbers (simplified for demo)
  return {
    1: [1, 2], // Al-Fatihah and part of Al-Baqarah
    2: [2], // Al-Baqarah continued
    3: [2, 3], // Al-Baqarah and Ali 'Imran
    4: [3, 4], // Ali 'Imran and An-Nisa'
    5: [4], // An-Nisa' continued
    // ... continue for all 30 juz
  };
};

export const getSurahsByJuz = (juz: number): SurahData[] => {
  const juzMapping = getJuzMapping();
  const surahNumbers = juzMapping[juz] || [];
  return surahNumbers.map(num => getSurahByNumber(num)).filter(Boolean) as SurahData[];
};