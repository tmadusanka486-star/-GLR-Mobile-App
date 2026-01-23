import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing'; 
import ViewShot from "react-native-view-shot";
import { db } from '../../firebase'; // ඔයාගේ firebase.ts පාර නිවැරදිද බලන්න
import { collection, addDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';

export default function PhotographerPanel() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const qrRef = useRef<any>(null); // null ලෙස ආරම්භ කළා

  // ඔයාගේ API සහ URL විස්තර
  const IMGBB_API_KEY = "393a5a8a13c40573262488e73dfdde50"; 
  const NETLIFY_URL = "https://glr-photography-6cd081.netlify.app"; 

  const shareQR = async () => {
    try {
      const uri = await qrRef.current.capture();
      await Sharing.shareAsync(uri);
    } catch (err) {
      Alert.alert("Error", "QR එක ලබා ගැනීමට නොහැකි විය.");
    }
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
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.data.url;
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return Alert.alert("පණිවිඩය", "කරුණාකර පින්තූර තෝරන්න");
    setUploading(true);
    try {
      const photoUrls: string[] = [];
      const albumId = Math.random().toString(36).substring(2, 10);
      for (const uri of selectedImages) {
        const url = await uploadToImgBB(uri);
        photoUrls.push(url);
      }
      await addDoc(collection(db, "albums"), { albumId, photos: photoUrls, createdAt: new Date() });
      
      // Query parameter එකක් විදියට ලින්ක් එක හැදීම
      const fullLink = `${NETLIFY_URL}/?id=${albumId}`;
      setGeneratedLink(fullLink);
      setModalVisible(true);
      setSelectedImages([]);
    } catch (error) {
      Alert.alert("Error", "Upload failed.");
    } finally { setUploading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ප්‍රධාන Upload Card එක */}
      <View style={styles.card}>
        <Text style={styles.header}>📸 GLR PHOTOGRAPHY</Text>
        <Text style={styles.subHeader}>Admin Upload Panel</Text>

        <TouchableOpacity style={styles.pickBtn} onPress={pickImages}>
          <Ionicons name="images" size={32} color="#1a73e8" />
          <Text style={styles.pickBtnText}>Select Gallery Photos</Text>
        </TouchableOpacity>

        <View style={styles.imageGrid}>
          {selectedImages.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.thumbnail} />
          ))}
        </View>

        {selectedImages.length > 0 && (
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={uploading}>
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadBtnText}>GENERATE QR & LINK</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* හිස් ඉඩ පිරවීමට එකතු කළ කොටස් */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Activity</Text>
        <View style={styles.historyPlaceholder}>
          <Ionicons name="cloud-done-outline" size={24} color="#ccc" />
          <Text style={styles.historyText}>New albums will appear here</Text>
        </View>
      </View>

      {/* Footer එක - T&S PowerTech බ්‍රෑන්ඩ් එකත් එක්ක */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by T&S PowerTech</Text>
        <Text style={styles.versionText}>Version 1.0.5</Text>
      </View>

      {/* Result Modal එක */}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle" size={30} color="#999" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Album Ready!</Text>
            <ViewShot ref={qrRef} options={{ format: "jpg", quality: 0.9 }}>
              <View style={styles.qrWrapper}>
                <QRCode value={generatedLink} size={180} color="#1a73e8" />
                <Text style={styles.qrLabel}>Scan to View</Text>
              </View>
            </ViewShot>
            <TouchableOpacity style={styles.shareBtn} onPress={shareQR}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.shareBtnText}>Share QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBox} onPress={async () => {
              await Clipboard.setStringAsync(generatedLink);
              Alert.alert("Copied!", "Link copied");
            }}>
              <Text style={styles.linkText} numberOfLines={1}>{generatedLink}</Text>
              <Text style={styles.copyHint}>Tap to copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#f4f7f9',
    justifyContent: 'center' // මේකෙන් ඔක්කොම මැදට ගන්නවා
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 25, 
    padding: 25, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 10 
  },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center' },
  subHeader: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 25 },
  pickBtn: { backgroundColor: '#e8f0fe', padding: 25, borderRadius: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#1a73e8' },
  pickBtnText: { color: '#1a73e8', fontWeight: 'bold', marginTop: 10 },
  uploadBtn: { backgroundColor: '#1a73e8', padding: 18, borderRadius: 15, marginTop: 25, alignItems: 'center' },
  uploadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, justifyContent: 'center' },
  thumbnail: { width: 60, height: 60, borderRadius: 10, margin: 4 },
  
  // අලුතින් එකතු කළ Styles
  historySection: { marginTop: 30, paddingHorizontal: 10 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 10 },
  historyPlaceholder: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#eee',
    opacity: 0.6
  },
  historyText: { color: '#999', fontSize: 13, marginTop: 5 },
  footer: { marginTop: 50, alignItems: 'center', opacity: 0.4 },
  footerText: { fontSize: 12, fontWeight: '600', color: '#666' },
  versionText: { fontSize: 10, color: '#999', marginTop: 2 },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalView: { width: '85%', backgroundColor: '#fff', borderRadius: 30, padding: 25, alignItems: 'center' },
  closeIcon: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#28a745', marginBottom: 20 },
  qrWrapper: { padding: 20, backgroundColor: '#fff', alignItems: 'center', borderRadius: 20, borderWidth: 1, borderColor: '#eee' },
  qrLabel: { marginTop: 10, fontSize: 12, color: '#1a73e8', fontWeight: 'bold' },
  shareBtn: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, borderRadius: 15, marginTop: 20, alignItems: 'center', width: '100%', justifyContent: 'center' },
  shareBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
  linkBox: { padding: 15, backgroundColor: '#f8f9fa', borderRadius: 12, width: '100%', marginTop: 15, alignItems: 'center' },
  linkText: { color: '#1a73e8', fontSize: 12 },
  copyHint: { fontSize: 10, color: '#999', marginTop: 5 }
});