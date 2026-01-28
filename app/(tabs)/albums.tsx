import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ImageBackground, Linking, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';

export default function AlbumsScreen() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ඇල්බම් ටික Firebase එකෙන් ගන්න
  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "albums"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedAlbums = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error("Error fetching albums: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // --- Delete Function ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Album",
      "Are you sure you want to delete this album? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Firebase එකෙන් document එක delete කරනවා
              await deleteDoc(doc(db, "albums", id));
              Alert.alert("Deleted", "Album has been removed.");
              // ලිස්ට් එක refresh කරනවා
              fetchAlbums();
            } catch (error) {
              Alert.alert("Error", "Could not delete album.");
            }
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderAlbum = ({ item }: { item: any }) => {
    const coverImage = item.photos && item.photos.length > 0 ? item.photos[0] : null;
    const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Unknown Date';

    return (
      <View style={styles.card}>
         {/* Cover Image */}
        <View style={styles.imageContainer}>
            {coverImage ? (
                <ImageBackground source={{ uri: coverImage }} style={styles.coverImage} imageStyle={{ borderRadius: 12 }}>
                    <View style={styles.imageOverlay} />
                    <Ionicons name="images" size={24} color="#fff" style={styles.iconOverlay} />
                </ImageBackground>
            ) : (
                <View style={[styles.coverImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={40} color="#666" />
                </View>
            )}
        </View>

        {/* Details */}
        <View style={styles.details}>
            <View style={styles.textRow}>
                <View>
                    <Text style={styles.albumId}>ID: {item.albumId}</Text>
                    <Text style={styles.date}>{date}</Text>
                </View>
                
                {/* Delete Button (Trash Icon) */}
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={22} color="#ff4444" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.count}>{item.photos?.length || 0} Photos</Text>
            
            <TouchableOpacity 
                style={styles.openBtn} 
                onPress={() => openLink(`https://glr-photography-6cd081.netlify.app/?id=${item.albumId}`)}
            >
                <Text style={styles.btnText}>Open Web Gallery</Text>
                <Ionicons name="arrow-forward" size={16} color="#1a73e8" />
            </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
        <View style={styles.overlay}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>All Albums</Text>
                <TouchableOpacity onPress={fetchAlbums}>
                    <Ionicons name="refresh" size={24} color="#1a73e8" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={albums}
                    renderItem={renderAlbum}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 150 }} // Tab bar එකට යට නොවෙන්න ඉඩ තියලා
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 100 }}>
                            <Text style={{ color: '#aaa' }}>No albums found yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, paddingTop: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },

  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageContainer: { width: 100, height: 100 },
  coverImage: { width: '100%', height: '100%', borderRadius: 12 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
  iconOverlay: { position: 'absolute', bottom: 5, right: 5 },

  details: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  
  textRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  
  albumId: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  date: { color: '#aaa', fontSize: 12, marginBottom: 5 },
  count: { color: '#1a73e8', fontSize: 12, fontWeight: '600', marginBottom: 10 },

  openBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(26, 115, 232, 0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  btnText: { color: '#1a73e8', fontSize: 12, fontWeight: 'bold', marginRight: 5 },

  deleteBtn: { padding: 8, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 8 }
});