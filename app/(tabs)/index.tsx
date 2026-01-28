import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from "react-native-view-shot";

// Firebase Import
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const { width } = Dimensions.get('window');

export default function PhotographerPanel() {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const qrRef = useRef<any>(null);

  // API Configuration
  const IMGBB_API_KEY = "393a5a8a13c40573262488e73dfdde50"; 
  const NETLIFY_URL = "https://glr-photography-6cd081.netlify.app"; 

  // --- Functions ---

  const shareQR = async () => {
    try {
      const uri = await qrRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (err) { Alert.alert("Error", "Error sharing QR"); }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setSelectedImages(result.assets.map(asset => asset.uri));
      setGeneratedLink('');
    }
  };

  const uploadToImgBB = async (uri: string) => {
    const filename = uri.split('/').pop() || 'photo.jpg';
    const formData = new FormData();
    // @ts-ignore
    formData.append('image', { uri, name: filename, type: 'image/jpeg' });
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST', body: formData,
    });
    const data = await response.json();
    return data.data.url;
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return Alert.alert("Oops!", "Please select photos first.");
    setUploading(true);
    try {
      const photoUrls: string[] = [];
      const albumId = Math.random().toString(36).substring(2, 10);
      for (const uri of selectedImages) {
        const url = await uploadToImgBB(uri);
        photoUrls.push(url);
      }
      await addDoc(collection(db, "albums"), { albumId, photos: photoUrls, createdAt: new Date() });
      const fullLink = `${NETLIFY_URL}/?id=${albumId}`;
      setGeneratedLink(fullLink);
      setModalVisible(true);
      setSelectedImages([]);
    } catch (error) { Alert.alert("Error", "Upload failed."); } 
    finally { setUploading(false); }
  };

  // --- UI Colors ---
  const textMain = '#ffffff'; 
  const textSub = '#cccccc';
  const accent = '#00d9ff'; // Blue

  // Glassmorphism Style
  const glassCardStyle = {
    backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderRadius: 24,
  };

  return (
    // Background Image
    <ImageBackground 
      source={require('../../assets/images/bg.jpg')} 
      style={styles.mainContainer}
      resizeMode="cover"
    >
      {/* Dark Overlay */}
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.brandName, { color: accent }]}>GLR STUDIO</Text>
            <Text style={[styles.greeting, { color: textMain }]}>Create New Album</Text>
            <Text style={[styles.subGreeting, { color: textSub }]}>Share memories in seconds.</Text>
          </View>

          {/* Main Upload Card (Glass) */}
          <View style={[styles.actionCard, glassCardStyle]}>
              
              {selectedImages.length === 0 ? (
                  <View style={styles.emptyState}>
                      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                          <Ionicons name="images-outline" size={35} color={accent} />
                      </View>
                      <Text style={[styles.emptyTitle, { color: textMain }]}>No Photos Selected</Text>
                      <Text style={[styles.emptySub, { color: textSub }]}>Tap below to start selecting</Text>
                  </View>
              ) : (
                  <View>
                        <View style={styles.selectedHeader}>
                          <Text style={[styles.countText, { color: textMain }]}>{selectedImages.length} Photos Ready</Text>
                          <TouchableOpacity onPress={() => setSelectedImages([])}>
                              <Text style={{ color: '#ff6b6b', fontWeight: '600' }}>Clear All</Text>
                          </TouchableOpacity>
                        </View>

                      {/* Horizontal Image List */}
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                          {selectedImages.map((uri, index) => (
                              <Image key={index} source={{ uri }} style={styles.scrollImage} />
                          ))}
                      </ScrollView>
                  </View>
              )}

              {/* Pick Button */}
              <TouchableOpacity style={[styles.pickButton, { borderColor: accent }]} onPress={pickImages}>
                  <Text style={[styles.pickButtonText, { color: accent }]}>
                      {selectedImages.length > 0 ? "+ Add More Photos" : "Select from Gallery"}
                  </Text>
              </TouchableOpacity>

          </View>

          {/* Upload Button */}
          {selectedImages.length > 0 && (
              <TouchableOpacity 
                  style={[styles.uploadButton, { backgroundColor: accent, opacity: uploading ? 0.7 : 1 }]} 
                  onPress={handleUpload}
                  disabled={uploading}
              >
                  {uploading ? (
                      <ActivityIndicator color="#fff" />
                  ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                          <Text style={styles.uploadButtonText}>Generate Link & QR</Text>
                      </View>
                  )}
              </TouchableOpacity>
          )}

        </ScrollView>

        {/* --- Footer (Updated Section) --- */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by T&S PowerTech</Text>
          <Text style={styles.versionText}>Version 1.0.5</Text>
        </View>

      </View>


      {/* --- MODAL (QR Code Result) --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            
            <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: accent }]}>Success!</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: '#666' }]}>Your album is live. Share this QR code.</Text>

            <ViewShot ref={qrRef} options={{ format: "jpg", quality: 0.9 }}>
              <View style={styles.qrContainer}>
                <QRCode value={generatedLink} size={160} color="#000" backgroundColor="#fff" />
              </View>
            </ViewShot>

            <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: accent }]} onPress={shareQR}>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Share QR</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#eee' }]} 
                    onPress={async () => {
                        await Clipboard.setStringAsync(generatedLink);
                        Alert.alert("Copied!", "Link copied to clipboard");
                    }}
                >
                    <Ionicons name="copy-outline" size={20} color="#333" />
                    <Text style={[styles.actionBtnText, { color: '#333' }]}>Copy Link</Text>
                </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', width: '100%', height: '100%' }, 
  
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  // Header
  headerSection: { marginBottom: 30 },
  brandName: { fontSize: 14, fontWeight: '800', letterSpacing: 2, marginBottom: 5, textTransform: 'uppercase' },
  greeting: { fontSize: 32, fontWeight: '300', marginBottom: 5 },
  subGreeting: { fontSize: 16 },

  // Glass Card Base Style
  actionCard: { 
    padding: 24, 
    // backgroundColor & borderColor handled inline
  },
  
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  iconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  emptySub: { fontSize: 14 },

  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  countText: { fontSize: 16, fontWeight: '600' },
  imageScroll: { marginBottom: 20 },
  scrollImage: { width: 80, height: 100, borderRadius: 12, marginRight: 10, backgroundColor: '#333' },

  pickButton: { 
    paddingVertical: 16, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderStyle: 'dashed', 
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  pickButtonText: { fontSize: 16, fontWeight: '600' },

  uploadButton: {
    marginTop: 30,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#1a73e8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  uploadButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // Footer Styles (Updated)
  footer: { 
    position: 'absolute', 
    bottom: 130, // Tab Bar එකට උඩින් පේන විදිහට
    width: '100%', 
    alignItems: 'center',
    zIndex: 10 
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 2,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 30, 
    paddingBottom: 50,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  modalSub: { fontSize: 14, marginBottom: 20 },
  qrContainer: { padding: 15, backgroundColor: '#fff', borderRadius: 20, marginBottom: 25 },
  
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  actionBtn: { flex: 1, paddingVertical: 15, borderRadius: 15, marginHorizontal: 5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { marginLeft: 8, fontWeight: '600', fontSize: 14, color: '#fff' }
});