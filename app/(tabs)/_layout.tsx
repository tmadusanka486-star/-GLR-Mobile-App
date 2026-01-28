import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { Platform, View } from 'react-native';

// 1. Navigator එක හදාගැනීම
const { Navigator } = createMaterialTopTabNavigator();

// 2. TypeScript වලට මෙයාව අඳුරගන්න බැරි නිසා ignore කරනවා
// @ts-ignore
const MaterialTopTabs = withLayoutContext(Navigator);

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MaterialTopTabs
        initialRouteName="index"
        tabBarPosition="bottom"
        
        screenOptions={{
          swipeEnabled: true, // Swipe වැඩ කරනවා
          animationEnabled: true,
          
          // --- Tab Bar Design ---
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(18, 18, 18, 0.20)', // ඔයා ඉල්ලපු පාට
            elevation: 0,
            borderTopWidth: 0,
            height: Platform.OS === 'ios' ? 90 : 120,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
          },
          
          tabBarIndicatorStyle: {
            height: 0,
            backgroundColor: 'transparent',
          },
          
          tabBarActiveTintColor: '#1a73e8',
          tabBarInactiveTintColor: '#666',
          
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'capitalize',
          },
          
          // * නිවැරදි කිරීම 1: tabBarIconStyle අයින් කළා (එතකොට Error එක එන්නේ නෑ)
        }}
      >
        <MaterialTopTabs.Screen
          name="index"
          options={{
            title: 'Upload',
            // * නිවැරදි කිරීම 2: color එකට Type එකක් දුන්නා ({ color: string })
            tabBarIcon: ({ color }: { color: string }) => <Ionicons name="cloud-upload" size={24} color={color} />,
          }}
        />

        <MaterialTopTabs.Screen
          name="albums"
          options={{
            title: 'Gallery',
            tabBarIcon: ({ color }: { color: string }) => <Ionicons name="images" size={24} color={color} />,
          }}
        />

        <MaterialTopTabs.Screen
          name="explore"
          options={{
            title: 'About',
            tabBarIcon: ({ color }: { color: string }) => <Ionicons name="information-circle" size={24} color={color} />,
          }}
        />
      </MaterialTopTabs>
    </View>
  );
}