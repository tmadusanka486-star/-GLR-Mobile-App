import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, View } from 'react-native';

// වැදගත්: ඔයාගේ assets ෆෝල්ඩර් එකේ bg.jpg කියලා ෆොටෝ එකක් තියෙන්න ඕනේ.
// ෆොටෝ එකේ නම වෙනස් නම්, මෙතන නම මාරු කරන්න.
const bgImage = require('../assets/bg.jpg'); 

export default function RootLayout() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  
  // Animation සඳහා අගයන්
  const fadeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(0.3)).current; 

  useEffect(() => {
    if (isSplashVisible) {
      // 1. Animation පටන් ගන්නවා
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();

      // 2. තත්පර 3කින් Splash එක අයින් කරලා Main App එකට යනවා
      setTimeout(() => {
        setSplashVisible(false);
      }, 3000);
    }
  }, []);

  // --- Splash Screen කොටස ---
  if (isSplashVisible) {
    return (
      <ImageBackground 
        source={bgImage} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Overlay - ෆොටෝ එක උඩින් යන කළු ලේයර් එක */}
        <View style={styles.overlay}>
            <StatusBar style="light" />
            
            {/* මැද තියෙන Logo Animation එක */}
            <Animated.View style={{ 
                opacity: fadeAnim, 
                transform: [{ scale: scaleAnim }],
                alignItems: 'center' 
            }}>
               <View style={styles.iconCircle}>
                  <Ionicons name="camera" size={50} color="#1a73e8" />
               </View>
               
               <Text style={styles.logoText}>GLR STUDIO</Text>
               <Text style={styles.subText}>Capture the Moment</Text>
            </Animated.View>

            {/* යටින් තියෙන Version සහ Powered By කොටස */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by T&S PowerTech</Text>
                <Text style={styles.versionText}>Version 1.0.5</Text>
            </View>

        </View>
      </ImageBackground>
    );
  }

  // --- Splash එකෙන් පස්සේ එන Main App එක ---
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // 85% කළු (ලෝගෝ එක කැපිලා පේන්න)
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // වීදුරු වගේ පෙනුම
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  subText: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 5,
    letterSpacing: 1,
  },
  
  // Footer Styles (Version එක පෙන්වන්න)
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: '100%',
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
  }
});