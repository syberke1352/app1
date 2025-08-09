import AsyncStorage from '@react-native-async-storage/async-storage';
import { QURAN_DATA, type SurahData, type AyatData } from '@/data/quran';
import { JUZ_MAPPING, getJuzBySurah } from '@/data/juz-mapping';

export interface QuranSettings {
  fontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  audioEnabled: boolean;
  lastReadSurah: number;
  lastReadAyah: number;
}

export interface BookmarkData {
  surahNumber: number;
  ayahNumber: number;
  note?: string;
  timestamp: string;
}

export class OfflineQuranService {
  private static readonly SETTINGS_KEY = 'quran_settings';
  private static readonly BOOKMARKS_KEY = 'quran_bookmarks';

  // Settings Management
  static async getSettings(): Promise<QuranSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    // Default settings
    return {
      fontSize: 18,
      showTranslation: true,
      showTransliteration: true,
      audioEnabled: false,
      lastReadSurah: 1,
      lastReadAyah: 1,
    };
  }

  static async saveSettings(settings: QuranSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async updateLastRead(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings.lastReadSurah = surahNumber;
      settings.lastReadAyah = ayahNumber;
      await this.saveSettings(settings);
    } catch (error) {
      console.error('Error updating last read:', error);
    }
  }

  // Bookmarks Management
  static async getBookmarks(): Promise<BookmarkData[]> {
    try {
      const bookmarksJson = await AsyncStorage.getItem(this.BOOKMARKS_KEY);
      if (bookmarksJson) {
        return JSON.parse(bookmarksJson);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
    return [];
  }

  static async addBookmark(surahNumber: number, ayahNumber: number, note?: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const existingIndex = bookmarks.findIndex(
        b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
      );

      if (existingIndex === -1) {
        bookmarks.push({
          surahNumber,
          ayahNumber,
          note,
          timestamp: new Date().toISOString(),
        });
        await AsyncStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  }

  static async removeBookmark(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filtered = bookmarks.filter(
        b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      );
      await AsyncStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  static async isBookmarked(surahNumber: number, ayahNumber: number): Promise<boolean> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }

  // Quran Data Access
  static getSurahList(): SurahData[] {
    return QURAN_DATA;
  }

  static getSurahByNumber(nomor: number): SurahData | undefined {
    return QURAN_DATA.find(surah => surah.nomor === nomor);
  }

  static searchSurah(query: string): SurahData[] {
    const lowercaseQuery = query.toLowerCase();
    return QURAN_DATA.filter(surah =>
      surah.namaLatin.toLowerCase().includes(lowercaseQuery) ||
      surah.nama.includes(query) ||
      surah.arti.toLowerCase().includes(lowercaseQuery) ||
      surah.nomor.toString().includes(query)
    );
  }

  static searchInSurah(surahNumber: number, query: string): AyatData[] {
    const surah = this.getSurahByNumber(surahNumber);
    if (!surah || !query.trim()) return [];

    const lowercaseQuery = query.toLowerCase();
    return surah.ayat.filter(ayat =>
      ayat.teksArab.includes(query) ||
      ayat.teksLatin.toLowerCase().includes(lowercaseQuery) ||
      ayat.teksIndonesia.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Juz and Navigation
  static getJuzBySurahAyah(surahNumber: number, ayahNumber: number): number {
    return getJuzBySurah(surahNumber, ayahNumber);
  }

  static getNextSurah(currentSurah: number): SurahData | null {
    if (currentSurah >= 114) return null;
    return this.getSurahByNumber(currentSurah + 1) || null;
  }

  static getPreviousSurah(currentSurah: number): SurahData | null {
    if (currentSurah <= 1) return null;
    return this.getSurahByNumber(currentSurah - 1) || null;
  }

  // Statistics
  static async getReadingStats(): Promise<{
    totalSurahsRead: number;
    totalBookmarks: number;
    averageProgress: number;
    lastReadSurah: string;
  }> {
    try {
      const settings = await this.getSettings();
      const bookmarks = await this.getBookmarks();
      
      // Get unique surahs from bookmarks as a proxy for read surahs
      const uniqueSurahs = new Set(bookmarks.map(b => b.surahNumber));
      const lastReadSurah = this.getSurahByNumber(settings.lastReadSurah);

      return {
        totalSurahsRead: uniqueSurahs.size,
        totalBookmarks: bookmarks.length,
        averageProgress: 0, // Would need reading history for accurate calculation
        lastReadSurah: lastReadSurah?.namaLatin || 'Al-Fatihah',
      };
    } catch (error) {
      console.error('Error getting reading stats:', error);
      return {
        totalSurahsRead: 0,
        totalBookmarks: 0,
        averageProgress: 0,
        lastReadSurah: 'Al-Fatihah',
      };
    }
  }

  // Data validation and integrity
  static validateData(): boolean {
    try {
      // Check if all surahs have required fields
      for (const surah of QURAN_DATA) {
        if (!surah.nomor || !surah.namaLatin || !surah.ayat || surah.ayat.length === 0) {
          return false;
        }
        
        // Check if ayat count matches
        if (surah.ayat.length !== surah.jumlahAyat) {
          console.warn(`Surah ${surah.namaLatin} ayat count mismatch`);
        }
      }
      return true;
    } catch (error) {
      console.error('Data validation error:', error);
      return false;
    }
  }

  // Export/Import functionality for backup
  static async exportUserData(): Promise<string> {
    try {
      const settings = await this.getSettings();
      const bookmarks = await this.getBookmarks();
      
      const userData = {
        settings,
        bookmarks,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  static async importUserData(dataJson: string): Promise<void> {
    try {
      const userData = JSON.parse(dataJson);
      
      if (userData.settings) {
        await this.saveSettings(userData.settings);
      }
      
      if (userData.bookmarks) {
        await AsyncStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(userData.bookmarks));
      }
    } catch (error) {
      console.error('Error importing user data:', error);
      throw error;
    }
  }
}