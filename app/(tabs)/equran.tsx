import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ReadingHistoryService } from '@/services/readingHistory';
import { QURAN_DATA, getSurahByNumber, type AyatData } from '@/data/quran';
impoimport { ArrowLeft, Chrome as Home } from 'lucide-react-native'-context';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  Settings, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function EquranScreen() {
  const { nomor } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [currentSurah, setCurrentSurah] = useState<typeof QURAN_DATA[0] | null>(null);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AyatData[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nomor) {
      const surahNumber = parseInt(nomor as string);
      const surah = getSurahByNumber(surahNumber);
      
      if (surah) {
        setCurrentSurah(surah);
        loadBookmarks();
        updateReadingHistory(1); // Start from ayah 1
      } else {
        Alert.alert('Error', 'Surah tidak ditemukan');
        router.back();
      }
    }
    setLoading(false);
  }, [nomor]);

  const loadBookmarks = async () => {
    if (!user || !currentSurah) return;

    try {
      const { data } = await supabase
        .from('quran_bookmarks')
        .select('ayah_number')
        .eq('user_id', user.id)
        .eq('surah_number', currentSurah.nomor);

      if (data) {
        setBookmarks(data.map(b => b.ayah_number.toString()));
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const toggleBookmark = async (ayahNumber: number) => {
    if (!user || !currentSurah) return;

    const isBookmarked = bookmarks.includes(ayahNumber.toString());

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('quran_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('surah_number', currentSurah.nomor)
          .eq('ayah_number', ayahNumber);

        setBookmarks(prev => prev.filter(b => b !== ayahNumber.toString()));
      } else {
        // Add bookmark
        await supabase
          .from('quran_bookmarks')
          .insert([{
            user_id: user.id,
            surah_number: currentSurah.nomor,
            ayah_number: ayahNumber,
          }]);

        setBookmarks(prev => [...prev, ayahNumber.toString()]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      Alert.alert('Error', 'Gagal menyimpan bookmark');
    }
  };

  const updateReadingHistory = async (ayahNumber: number) => {
    if (!user || !currentSurah) return;

    setCurrentAyah(ayahNumber);

    try {
      await ReadingHistoryService.updateProgress(
        user.id,
        currentSurah.nomor,
        currentSurah.namaLatin,
        ayahNumber,
        currentSurah.jumlahAyat
      );
    } catch (error) {
      console.error('Error updating reading history:', error);
    }
  };

  const searchInSurah = (query: string) => {
    if (!currentSurah || !query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = currentSurah.ayat.filter(ayat =>
      ayat.teksArab.includes(query) ||
      ayat.teksLatin.toLowerCase().includes(query.toLowerCase()) ||
      ayat.teksIndonesia.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
  };

  const scrollToAyah = (ayahNumber: number) => {
    // In a real implementation, you would scroll to the specific ayah
    updateReadingHistory(ayahNumber);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigateToSurah = (direction: 'prev' | 'next') => {
    if (!currentSurah) return;

    const targetSurah = direction === 'prev' 
      ? currentSurah.nomor - 1 
      : currentSurah.nomor + 1;

    if (targetSurah >= 1 && targetSurah <= 114) {
      router.push(`/(tabs)/equran?nomor=${targetSurah}`);
    }
  };

  const playAudio = (ayahNumber: number) => {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Audio akan diputar (fitur demo)');
    } else {
      // In real implementation, integrate with audio player
      Alert.alert('Audio', `Memutar ayat ${ayahNumber} dari ${currentSurah?.namaLatin}`);
    }
  };

  if (loading || !currentSurah) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat surah...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInUp} style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1F2937" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.surahName}>{currentSurah.namaLatin}</Text>
            <Text style={styles.surahInfo}>
              {currentSurah.jumlahAyat} ayat • {currentSurah.tempatTurun === 'mekah' ? 'Mekkah' : 'Madinah'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <Pressable 
            style={styles.headerButton} 
            onPress={() => setShowSearch(!showSearch)}
          >
            <Search size={20} color="#1F2937" />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Settings size={20} color="#1F2937" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Search Bar */}
      {showSearch && (
        <Animated.View entering={FadeInDown} style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari dalam surah ini..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              searchInSurah(text);
            }}
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

      {/* Reading Controls */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.controlsContainer}>
        <View style={styles.controls}>
          <Pressable 
            style={styles.controlButton}
            onPress={() => setFontSize(Math.max(14, fontSize - 2))}
          >
            <ZoomOut size={16} color="#6B7280" />
          </Pressable>
          
          <Text style={styles.fontSizeText}>{fontSize}px</Text>
          
          <Pressable 
            style={styles.controlButton}
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
          >
            <ZoomIn size={16} color="#6B7280" />
          </Pressable>
          
          <View style={styles.controlDivider} />
          
          <Pressable 
            style={[styles.controlButton, showTranslation && styles.controlButtonActive]}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <Text style={[styles.controlButtonText, showTranslation && styles.controlButtonTextActive]}>
              ID
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.controlButton, showTransliteration && styles.controlButtonActive]}
            onPress={() => setShowTransliteration(!showTransliteration)}
          >
            <Text style={[styles.controlButtonText, showTransliteration && styles.controlButtonTextActive]}>
              Latin
            </Text>
          </Pressable>
          
          <Pressable 
            style={[styles.controlButton, audioEnabled && styles.controlButtonActive]}
            onPress={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? (
              <Volume2 size={16} color="#10B981" />
            ) : (
              <VolumeX size={16} color="#6B7280" />
            )}
          </Pressable>
        </View>
      </Animated.View>

      {/* Surah Header */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.surahHeader}>
        <Text style={styles.surahNameArabic}>{currentSurah.nama}</Text>
        <Text style={styles.surahNameLatin}>{currentSurah.namaLatin}</Text>
        <Text style={styles.surahMeaning}>"{currentSurah.arti}"</Text>
        
        {currentSurah.nomor !== 1 && currentSurah.nomor !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={[styles.bismillahText, { fontSize: fontSize + 2 }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
            {showTransliteration && (
              <Text style={styles.bismillahLatin}>
                Bismillahir rahmanir rahiim
              </Text>
            )}
            {showTranslation && (
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
          // Calculate current ayah based on scroll position
          const ayahHeight = 120; // Approximate height per ayah
          const newCurrentAyah = Math.floor(scrollY / ayahHeight) + 1;
          if (newCurrentAyah !== currentAyah && newCurrentAyah <= currentSurah.jumlahAyat) {
            updateReadingHistory(newCurrentAyah);
          }
        }}
        scrollEventThrottle={1000}
      >
        {currentSurah.ayat.map((ayat, index) => {
          const isBookmarked = bookmarks.includes(ayat.nomorAyat.toString());
          const isCurrentAyah = ayat.nomorAyat === currentAyah;
          
          return (
            <Animated.View 
              key={ayat.nomorAyat} 
              entering={FadeInDown.delay(index * 50)}
              style={[styles.ayatCard, isCurrentAyah && styles.currentAyatCard]}
            >
              <View style={styles.ayatHeader}>
                <View style={styles.ayatNumber}>
                  <Text style={styles.ayatNumberText}>{ayat.nomorAyat}</Text>
                </View>
                
                <View style={styles.ayatActions}>
                  {audioEnabled && (
                    <Pressable 
                      style={styles.ayatActionButton}
                      onPress={() => playAudio(ayat.nomorAyat)}
                    >
                      <Volume2 size={16} color="#10B981" />
                    </Pressable>
                  )}
                  
                  <Pressable 
                    style={styles.ayatActionButton}
                    onPress={() => toggleBookmark(ayat.nomorAyat)}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={16} color="#F59E0B" />
                    ) : (
                      <Bookmark size={16} color="#9CA3AF" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.ayatArabic, { fontSize: fontSize + 4 }]}>
                {ayat.teksArab}
              </Text>

              {showTransliteration && (
                <Text style={[styles.ayatLatin, { fontSize: fontSize - 2 }]}>
                  {ayat.teksLatin}
                </Text>
              )}

              {showTranslation && (
                <Text style={[styles.ayatTranslation, { fontSize: fontSize - 2 }]}>
                  {ayat.teksIndonesia}
                </Text>
              )}
            </Animated.View>
          );
        })}

        {/* End of Surah */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.surahEnd}>
          <Text style={styles.surahEndText}>
            صَدَقَ اللَّهُ الْعَظِيمُ
          </Text>
          <Text style={styles.surahEndTranslation}>
            "Maha Benar Allah Yang Maha Agung"
          </Text>
        </Animated.View>

        {/* Navigation to Next/Previous Surah */}
        <View style={styles.navigationContainer}>
          {currentSurah.nomor > 1 && (
            <Pressable 
              style={styles.navigationButton}
              onPress={() => navigateToSurah('prev')}
            >
              <ChevronLeft size={20} color="#10B981" />
              <Text style={styles.navigationText}>
                Surah Sebelumnya
              </Text>
            </Pressable>
          )}
          
          {currentSurah.nomor < 114 && (
            <Pressable 
              style={styles.navigationButton}
              onPress={() => navigateToSurah('next')}
            >
              <Text style={styles.navigationText}>
                Surah Selanjutnya
              </Text>
              <ChevronRight size={20} color="#10B981" />
            </Pressable>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentAyah / currentSurah.jumlahAyat) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Ayat {currentAyah} dari {currentSurah.jumlahAyat} 
          ({Math.round((currentAyah / currentSurah.jumlahAyat) * 100)}%)
        </Text>
      </View>

      {/* Quick Navigation */}
      <View style={styles.quickNavigation}>
        <Pressable 
          style={styles.quickNavButton}
          onPress={() => router.push('/(tabs)/quran')}
        >
          <Home size={20} color="#10B981" />
          <Text style={styles.quickNavText}>Daftar Surah</Text>
        </Pressable>
        
        <Pressable 
          style={styles.quickNavButton}
          onPress={() => {
            if (bookmarks.length > 0) {
              const firstBookmark = parseInt(bookmarks[0]);
              scrollToAyah(firstBookmark);
            } else {
              Alert.alert('Info', 'Belum ada bookmark di surah ini');
            }
          }}
        >
          <Bookmark size={20} color="#F59E0B" />
          <Text style={styles.quickNavText}>Bookmark ({bookmarks.length})</Text>
        </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  surahInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
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
  controlsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#10B981',
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  controlButtonTextActive: {
    color: 'white',
  },
  fontSizeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  controlDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  surahHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  surahNameArabic: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  surahNameLatin: {
    fontSize: 20,
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
  surahEnd: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    margin: 16,
  },
  surahEndText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  surahEndTranslation: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navigationText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  quickNavigation: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  quickNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  quickNavText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
});