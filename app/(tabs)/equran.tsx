import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ReadingHistoryService } from '@/services/readingHistory';
import { getSurahByNumber } from '@/data/quran';
import { OfflineQuranReader } from '@/components/OfflineQuranReader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Home } from 'lucide-react-native';
import { Pressable } from 'react-native';

export default function EquranScreen() {
  const { nomor } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [surahNumber, setSurahNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nomor) {
      const parsedSurahNumber = parseInt(nomor as string);
      const surah = getSurahByNumber(parsedSurahNumber);
      
      if (surah) {
        setSurahNumber(parsedSurahNumber);
      } else {
        Alert.alert('Error', 'Surah tidak ditemukan');
        router.back();
      }
    }
    setLoading(false);
  }, [nomor]);

  if (loading || !surahNumber) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat surah...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Al-Quran</Text>
        <Pressable style={styles.headerButton} onPress={() => router.push('/(tabs)')}>
          <Home size={20} color="#1F2937" />
        </Pressable>
      </View>

      {/* Offline Quran Reader Component */}
      <OfflineQuranReader 
        surahNumber={surahNumber}
        onAyahChange={(ayahNumber) => {
          // Optional: Handle ayah change events
          console.log(`Reading ayah ${ayahNumber}`);
        }}
      />
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
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});