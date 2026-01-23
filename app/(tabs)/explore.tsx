import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { db } from '../../firebase'; // firebase.js ඇති ස්ථානය නිවැරදිදැයි බලන්න
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AlbumList() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Firestore එක සමඟ සජීවීව සම්බන්ධ වීම (Real-time sync)
    const q = query(collection(db, "albums"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const albumData: any[] = [];
      querySnapshot.forEach((doc) => {
        albumData.push({ id: doc.id, ...doc.data() });
      });
      setAlbums(albumData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ඇල්බමය මකා දැමීමට පෙර තහවුරු කරගැනීම
  const confirmDelete = (id: string) => {
    Alert.alert(
      "ඇල්බමය මකා දැමීම",
      "මෙම ඇල්බමය ස්ථිරවම මකා දැමීමට ඔබට අවශ්‍යද?",
      [
        { text: "අවලංගු කරන්න", style: "cancel" },
        { text: "මකා දමන්න", style: "destructive", onPress: () => deleteAlbum(id) }
      ]
    );
  };

  const deleteAlbum = async (id: string) => {
    try {
      await deleteDoc(doc(db, "albums", id));
      // සටහන: ImgBB හි ඇති පින්තූර මකා දැමීමට ImgBB API එක අවශ්‍ය වේ.
    } catch (error) {
      Alert.alert("දෝෂයකි", "ඇල්බමය මකා දැමීමට නොහැකි විය.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>ඇල්බම පූරණය වෙමින් පවතී...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📂 All Shared Albums</Text>
      
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => router.push(`/album/${item.albumId}`as any )} // Dynamic routing
          >
            {/* ඇල්බමයේ පළමු පින්තූරය Preview එකක් ලෙස */}
            {item.photos && item.photos.length > 0 ? (
              <Image source={{ uri: item.photos[0] }} style={styles.previewImage} />
            ) : (
              <View style={[styles.previewImage, styles.placeholder]}>
                <Ionicons name="images-outline" size={30} color="#999" />
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.albumIdText}>ID: {item.albumId}</Text>
              <Text style={styles.photoCount}>{item.photos?.length || 0} Photos Available</Text>
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item.id)}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>තවමත් ඇල්බම කිසිවක් නැත.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, paddingTop: 60, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#1a73e8' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a73e8', marginBottom: 20, textAlign: 'center' },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: 'center',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  previewImage: { width: 75, height: 75, borderRadius: 12, marginRight: 15 },
  placeholder: { backgroundColor: '#e9ecef', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  albumIdText: { fontSize: 17, fontWeight: 'bold', color: '#202124' },
  photoCount: { fontSize: 13, color: '#5f6368', marginTop: 4 },
  deleteBtn: { padding: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});