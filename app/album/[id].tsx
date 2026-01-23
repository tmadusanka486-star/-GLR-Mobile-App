import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const columnWidth = width / 2 - 20;

export default function ClientGallery() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const q = query(collection(db, "albums"), where("albumId", "==", id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const albumData = querySnapshot.docs[0].data();
          setPhotos(albumData.photos || []);
        } else {
          Alert.alert("Error", "ඇල්බමය සොයාගත නොහැක.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#1a73e8" /></View>;

  return (
    <View style={styles.container}>
      {/* Header කොටස */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#1a73e8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GLR Gallery</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <Text style={styles.albumInfo}>Album ID: {id}</Text>

      <FlatList
        data={photos}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item }} style={styles.image} />
            {/* වෙබ් ඇප් එකේ වගේම වෝටර්මාර්ක් එකක් පෙන්නන්න පුළුවන් */}
            <Text style={styles.watermark}>GLR Photography</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 20, 
    backgroundColor: '#f8f9fa' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a73e8' },
  albumInfo: { textAlign: 'center', marginVertical: 10, color: '#666', fontWeight: 'bold' },
  list: { paddingHorizontal: 10 },
  imageWrapper: { margin: 5, borderRadius: 10, overflow: 'hidden', backgroundColor: '#eee' },
  image: { width: columnWidth, height: columnWidth, resizeMode: 'cover' },
  watermark: { 
    position: 'absolute', 
    bottom: 5, 
    right: 5, 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 10, 
    fontWeight: 'bold' 
  }
});