import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ReadingHistoryService } from '@/services/readingHistory';
import { OfflineQuranService, type QuranSettings } from '@/services/offlineQuran';
import { getSurahByNumber, type SurahData, type AyatData } from '@/data/quran';
import { 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff,
  Type,
  Settings as SettingsIcon
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface OfflineQuranReaderProps {
  surahNumber: number;
  initialAyah?: number;
  onAyahChange?: (ayahNumber: number) => void;
}

export function OfflineQuranReader({ 
  surahNumber, 
  initialAyah = 1, 
  onAyahChange 
}: OfflineQuranReaderProps) {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [currentAyah, setCurrentAyah] = useState(initialAyah);
  const [settings, setSettings] = useState<QuranSettings | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AyatData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeReader();
  }, [surahNumber]);

  const initializeReader = async () => {
    try {
      // Load surah data
      const surahData = getSurahByNumber(surahNumber);
      if (!surahData) {
        Alert.alert('Error', 'Surah tidak ditemukan');
        return;
      }
      setSurah(surahData);

      // Load settings
      const userSettings = await OfflineQuranService.getSettings();
      setSettings(userSettings);

      // Load bookmarks for this surah
      const allBookmarks = await OfflineQuranService.getBookmarks();
      const surahBookmarks = allBookmarks
        .filter(b => b.surahNumber === surahNumber)
        .map(b => b.ayahNumber);
      setBookmarks(new Set(surahBookmarks));

      // Update last read
      await OfflineQuranService.updateLastRead(surahNumber, initialAyah);
    } catch (error) {
      console.error('Error initializing reader:', error);
    }
  };

  const updateCurrentAyah = async (ayahNumber: number) => {
    setCurrentAyah(ayahNumber);
    onAyahChange?.(ayahNumber);

    if (user && surah) {
      try {
        // Update reading history in database
        await ReadingHistoryService.updateProgress(
          user.id,
          surah.nomor,
          surah.namaLatin,
          ayahNumber,
          surah.jumlahAyat
        );

        // Update local settings
        await OfflineQuranService.updateLastRead(surah.nomor, ayahNumber);
      } catch (error) {
        console.error('Error updating reading progress:', error);
      }
    }
  };

  const toggleBookmark = async (ayahNumber: number) => {
    if (!surah) return;

    const isBookmarked = bookmarks.has(ayahNumber);

    try {
      if (isBookmarked) {
        await OfflineQuranService.removeBookmark(surah.nomor, ayahNumber);
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(ayahNumber);
          return newSet;
        });
      } else {
        await OfflineQuranService.addBookmark(surah.nomor, ayahNumber);
        setBookmarks(prev => new Set([...prev, ayahNumber]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Gagal menyimpan bookmark');
    }
  };

  const updateSettings = async (newSettings: Partial<QuranSettings>) => {
    if (!settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await OfflineQuranService.saveSettings(updatedSettings);
  };

  const searchInSurah = (query: string) => {
    setSearchQuery(query);
    if (!surah || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = OfflineQuranService.searchInSurah(surah.nomor, query);
    setSearchResults(results);
  };

  const scrollToAyah = (ayahNumber: number) => {
    updateCurrentAyah(ayahNumber);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Scroll to ayah (approximate)
    const ayahHeight = 120;
    const scrollY = (ayahNumber - 1) * ayahHeight;
    scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
  };

  const playAudio = (ayahNumber: number) => {
    // In a real implementation, you would integrate with an audio player
    // For now, just show an alert
    Alert.alert('Audio', `Memutar ayat ${ayahNumber} dari ${surah?.namaLatin}`);
  };

  if (!surah || !settings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat Al-Quran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {showSearch && (
        <Animated.View entering={FadeInDown} style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari dalam surah ini..."
            value={searchQuery}
            onChangeText={searchInSurah}
            placeholderTextColor="#9CA3AF"
          />
          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResults} nestedScrollEnabled>
              {searchResults.map((ayat) => (
                <Pressable
                  key={ayat.nomorAyat}
                  style={styles.searchResultItem}
                  onPress={() => scrollToAyah(ayat.nomorAyat)}
                >
                  <Text style={styles.searchResultNumber}>Ayat {ayat.nomorAyat}</Text>
                  <Text style={styles.searchResultText} numberOfLines={2}>
                    {ayat.teksIndonesia}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Animated.View entering={FadeInDown} style={styles.settingsPanel}>
          <Text style={styles.settingsPanelTitle}>Pengaturan Bacaan</Text>
          
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Ukuran Font</Text>
            <View style={styles.fontSizeControls}>
              <Pressable 
                style={styles.fontButton}
                onPress={() => updateSettings({ fontSize: Math.max(14, settings.fontSize - 2) })}
              >
                <ZoomOut size={16} color="#6B7280" />
              </Pressable>
              <Text style={styles.fontSizeText}>{settings.fontSize}px</Text>
              <Pressable 
                style={styles.fontButton}
                onPress={() => updateSettings({ fontSize: Math.min(28, settings.fontSize + 2) })}
              >
                <ZoomIn size={16} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Tampilkan Terjemahan</Text>
            <Pressable 
              style={[styles.toggleButton, settings.showTranslation && styles.toggleButtonActive]}
              onPress={() => updateSettings({ showTranslation: !settings.showTranslation })}
            >
              {settings.showTranslation ? (
                <Eye size={16} color="#10B981" />
              ) : (
                <EyeOff size={16} color="#6B7280" />
              )}
            </Pressable>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Tampilkan Transliterasi</Text>
            <Pressable 
              style={[styles.toggleButton, settings.showTransliteration && styles.toggleButtonActive]}
              onPress={() => updateSettings({ showTransliteration: !settings.showTransliteration })}
            >
              {settings.showTransliteration ? (
                <Type size={16} color="#10B981" />
              ) : (
                <Type size={16} color="#6B7280" />
              )}
            </Pressable>
          </View>

          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Audio Otomatis</Text>
            <Pressable 
              style={[styles.toggleButton, settings.audioEnabled && styles.toggleButtonActive]}
              onPress={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
            >
              {settings.audioEnabled ? (
                <Volume2 size={16} color="#10B981" />
              ) : (
                <VolumeX size={16} color="#6B7280" />
              )}
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Reader Controls */}
      <View style={styles.readerControls}>
        <Pressable 
          style={styles.controlButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Search size={18} color={showSearch ? "#10B981" : "#6B7280"} />
        </Pressable>
        
        <Pressable 
          style={styles.controlButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon size={18} color={showSettings ? "#10B981" : "#6B7280"} />
        </Pressable>
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Ayat {currentAyah}/{surah.jumlahAyat}
          </Text>
        </View>
      </View>

      {/* Surah Header */}
      <Animated.View entering={FadeInUp} style={styles.surahHeader}>
        <Text style={styles.surahNameArabic}>{surah.nama}</Text>
        <Text style={styles.surahNameLatin}>{surah.namaLatin}</Text>
        <Text style={styles.surahMeaning}>"{surah.arti}"</Text>
        
        {surah.nomor !== 1 && surah.nomor !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={[styles.bismillahText, { fontSize: settings.fontSize + 2 }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
            {settings.showTransliteration && (
              <Text style={styles.bismillahLatin}>
                Bismillahir rahmanir rahiim
              </Text>
            )}
            {settings.showTranslation && (
              <Text style={styles.bismillahTranslation}>
                Dengan nama Allah Yang Maha Pengasih, Maha Penyayang
              </Text>
            )}
          </View>
        )}
      </Animated.View>

      {/* Ayat List */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.ayatContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          const ayahHeight = 120;
          const newCurrentAyah = Math.floor(scrollY / ayahHeight) + 1;
          if (newCurrentAyah !== currentAyah && newCurrentAyah <= surah.jumlahAyat) {
            updateCurrentAyah(newCurrentAyah);
          }
        }}
        scrollEventThrottle={1000}
      >
        {surah.ayat.map((ayat, index) => {
          const isBookmarked = bookmarks.has(ayat.nomorAyat);
          const isCurrentAyah = ayat.nomorAyat === currentAyah;
          
          return (
            <Animated.View 
              key={ayat.nomorAyat} 
              entering={FadeInDown.delay(index * 30)}
              style={[styles.ayatCard, isCurrentAyah && styles.currentAyatCard]}
            >
              <View style={styles.ayatHeader}>
                <View style={styles.ayatNumber}>
                  <Text style={styles.ayatNumberText}>{ayat.nomorAyat}</Text>
                </View>
                
                <View style={styles.ayatActions}>
                  {settings.audioEnabled && (
                    <Pressable 
                      style={styles.ayatActionButton}
                      onPress={() => playAudio(ayat.nomorAyat)}
                    >
                      <Volume2 size={14} color="#10B981" />
                    </Pressable>
                  )}
                  
                  <Pressable 
                    style={styles.ayatActionButton}
                    onPress={() => toggleBookmark(ayat.nomorAyat)}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={14} color="#F59E0B" />
                    ) : (
                      <Bookmark size={14} color="#9CA3AF" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.ayatArabic, { fontSize: settings.fontSize + 4 }]}>
                {ayat.teksArab}
              </Text>

              {settings.showTransliteration && (
                <Text style={[styles.ayatLatin, { fontSize: settings.fontSize - 2 }]}>
                  {ayat.teksLatin}
                </Text>
              )}

              {settings.showTranslation && (
                <Text style={[styles.ayatTranslation, { fontSize: settings.fontSize - 2 }]}>
                  {ayat.teksIndonesia}
                </Text>
              )}
            </Animated.View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentAyah / surah.jumlahAyat) * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInfo: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 8,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  searchResultText: {
    fontSize: 14,
    color: '#1F2937',
  },
  settingsPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingsPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fontButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontSizeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#DCFCE7',
  },
  surahHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  surahNameArabic: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  surahNameLatin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  surahMeaning: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  bismillahContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginTop: 8,
    width: '100%',
  },
  bismillahText: {
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  bismillahLatin: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  bismillahTranslation: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  ayatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  ayatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentAyatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  ayatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayatNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayatNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ayatActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ayatActionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayatArabic: {
    textAlign: 'right',
    lineHeight: 40,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 12,
  },
  ayatLatin: {
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  ayatTranslation: {
    color: '#374151',
    lineHeight: 24,
  },
  progressContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
});