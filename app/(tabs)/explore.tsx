import { Ionicons } from '@expo/vector-icons';
import { ImageBackground, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  
  const openWeb = () => {
    Linking.openURL('https://glr-photography-6cd081.netlify.app');
  };

  return (
    <ImageBackground 
      source={require('../../assets/images/bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* මෙන්න මේ කොටසෙන් තමයි පින්තූරේ උඩින් කළු පාට ලේයර් එකක් වැටෙන්නේ */}
      <View style={styles.overlay}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.contentBox}>
                <Ionicons name="information-circle-outline" size={60} color="#1a73e8" style={{marginBottom: 20}} />
                
                <Text style={styles.title}>GLR Photography</Text>
                <Text style={styles.version}>Admin Panel - Gihan Lakshan</Text>
                
                <Text style={styles.description}>
                  This application allows you to upload photos, generate albums, and share QR codes instantly with your clients.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.creditTitle}>Developed by</Text>
                <Text style={styles.creditName}>T&S PowerTech Solutions</Text>

                <TouchableOpacity style={styles.webBtn} onPress={openWeb}>
                    <Text style={styles.btnText}>Visit Website</Text>
                    <Ionicons name="globe-outline" size={16} color="#ffffff" style={{marginLeft: 5}} />
                </TouchableOpacity>
            </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // මෙන්න මේ අගය (0.85) නිසා දැන් හොඳට කළු වෙලා අකුරු පේනවා
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', // 85% කළු පාට (Dark Overlay)
    width: '100%',
    height: '100%'
  },
  
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 120 // Tab bar එකට යට නොවෙන්න ඉඩ තියලා
  },
  
  contentBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)', // බොක්ස් එක ටිකක් විනිවිද පේනවා
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  version: { fontSize: 14, color: '#09c0f8', marginBottom: 20 },
  description: { textAlign: 'center', color: '#ccc', lineHeight: 22, marginBottom: 20 },
  
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  
  creditTitle: { fontSize: 12, color: '#ffffff', marginBottom: 5 },
  creditName: { fontSize: 16, fontWeight: 'bold', color: '#09c0f8', marginBottom: 30 },

  webBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#1a73e8', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 25, 
    alignItems: 'center' 
  },
  btnText: { color: '#fff', fontWeight: 'bold' }
});