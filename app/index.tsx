import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, ImageBackground } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as SecureStore from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import TutorialOverlay, { TutorialStep } from '../components/TutorialOverlay';

export default function WeatherCoverScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  const checkTutorialStatus = useCallback(async () => {
    if (params.showTutorial === 'true') {
      setIsTutorialVisible(true);
      return;
    }

    try {
      const hasSeen = await SecureStore.getItemAsync('has_seen_tutorial');
      if (hasSeen !== 'true') {
        setIsTutorialVisible(true);
      }
    } catch (error) {
      console.error('Error checking tutorial status:', error);
    }
  }, [params.showTutorial]);

  useEffect(() => {
    checkTutorialStatus();
  }, [checkTutorialStatus]);

  const handleTutorialComplete = async () => {
    try {
      await SecureStore.setItemAsync('has_seen_tutorial', 'true');
      setIsTutorialVisible(false);
    } catch (error) {
      console.error('Error saving tutorial status:', error);
      setIsTutorialVisible(false); // Hide anyway
    }
  };

  const tutorialSteps: TutorialStep[] = [
    {
      title: 'Welcome to Wing',
      description: 'On the surface, this app blends in perfectly. Currently, it looks like a weather app, but you can customize it with different \'faces\' like a music player or a period tracker.',
      top: 100, // Show near the top middle
    },
    {
      title: 'Emergency SOS',
      description: 'Tapping this "Severe Weather Alert" card will immediately and silently send an SMS with your location to your saved emergency contacts.',
      top: 300, // Near the SOS card
      arrow: {
        direction: 'left',
        left: -40,
        top: 20,
      }
    },
    {
      title: 'Hidden Settings',
      description: 'This is the discreet app button. Tap the hand icon at the bottom right corner of the screen to enter your PIN and access the real settings, configure contacts, or use the hidden AI chatbot.',
      bottom: 110, // Close to the bottom bar
      right: '2%', // Pushed more towards the right border
      arrow: {
        direction: 'down-right',
        bottom: -45,
        right: 15,
      }
    }
  ];

  const handleSettingsPress = async () => {
    try {
      const storedPin = await SecureStore.getItemAsync('app_settings_pin');
      if (!storedPin) {
        router.push('/settings');
      } else {
        router.push('/pin');
      }
    } catch (error) {
      console.error('SecureStore error:', error);
      router.push('/settings');
    }
  };

  const handleSOSPress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      const googleMapsLink = `https://maps.google.com/?q=${lat},${lon}`;

      const customMessage = await SecureStore.getItemAsync('emergency_message');
      const messageText = customMessage || 'I need help. Please contact me or send assistance.';
      
      const contactsStr = await SecureStore.getItemAsync('emergency_contacts');
      let contacts: string[] = [];
      if (contactsStr) {
        contacts = JSON.parse(contactsStr);
      }

      const message = `${messageText}\n\nMy location: ${googleMapsLink}`;

      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && contacts.length > 0) {
        await SMS.sendSMSAsync(contacts, message);
      }
    } catch (error) {
      console.error('SOS Error:', error);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/sunny_background.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <TutorialOverlay 
        isVisible={isTutorialVisible} 
        steps={tutorialSteps} 
        onFinish={handleTutorialComplete}
        onExit={handleTutorialComplete}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.city}>Vancouver</Text>
            <Text style={styles.temperature}>4°</Text>
            <Text style={styles.condition}>Mostly Sunny</Text>
            <Text style={styles.highLow}>H:6°  L:-1°</Text>
          </View>

          {/* SOS Alert Card */}
          <TouchableOpacity onPress={handleSOSPress} activeOpacity={0.8} style={styles.sosCard}>
            <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <Ionicons name="warning" size={20} color="#ff6b6b" style={{marginTop: 2, marginRight: 8}} />
                <View>
                    <Text style={styles.sosCardTitle}>Severe Weather Alert</Text>
                    <Text style={styles.sosCardSubtitle}>Winter Storm Warning until 11:00 PM</Text>
                </View>
            </View>
          </TouchableOpacity>

          {/* Hourly Forecast */}
          <View style={styles.card}>
            <Text style={styles.cardDesc}>
              Cloudy conditions will continue for the rest of the day. Wind gusts are up to 20 km/h.
            </Text>
            <View style={styles.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyList}>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>Now</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>11°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>7PM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>11°</Text>
              </View>
              <View style={styles.hourlyItem}>
                 <Text style={styles.hourlyTime}>8PM</Text>
                 <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                 <Text style={styles.hourlyTemp}>10°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>9PM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>10°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>10PM</Text>
                <View style={styles.hourlyIconGroup}>
                  <Ionicons name="rainy" size={24} color="white" />
                  <Text style={styles.chanceText}>70%</Text>
                </View>
                <Text style={styles.hourlyTemp}>10°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>11PM</Text>
                <View style={styles.hourlyIconGroup}>
                  <Ionicons name="rainy" size={24} color="white" />
                  <Text style={styles.chanceText}>75%</Text>
                </View>
                <Text style={styles.hourlyTemp}>9°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>12AM</Text>
                <View style={styles.hourlyIconGroup}>
                  <Ionicons name="rainy" size={24} color="white" />
                  <Text style={styles.chanceText}>75%</Text>
                </View>
                <Text style={styles.hourlyTemp}>9°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>1AM</Text>
                <View style={styles.hourlyIconGroup}>
                  <Ionicons name="rainy" size={24} color="white" />
                  <Text style={styles.chanceText}>70%</Text>
                </View>
                <Text style={styles.hourlyTemp}>9°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>3AM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>8°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>4AM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>8°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>5AM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>7°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>6AM</Text>
                <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>6°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>7AM</Text>
                <Ionicons name="partly-sunny" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>6°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>7:43AM</Text>
                <Ionicons name="sunny-outline" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>Sunrise</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>8AM</Text>
                <Ionicons name="partly-sunny" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>5°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>9AM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>5°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>10AM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>6°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>11AM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>6°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>12PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>7°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>1PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>7°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>2PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>8°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>3PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>8°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>4PM</Text>
                <Ionicons name="partly-sunny" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>8°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>5PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>7°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>6PM</Text>
                <Ionicons name="partly-sunny" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>7°</Text>
              </View>
              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>7PM</Text>
                <Ionicons name="sunny" size={24} color="#ffcc00" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>6°</Text>
              </View>
            </ScrollView>
          </View>
          
          {/* 10-Day Forecast */}
          <View style={[styles.card, { marginBottom: 100 }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.cardTitle}>10-DAY FORECAST</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Today</Text>
              <View style={styles.dailyIconGroup}>
                <Ionicons name="rainy" size={20} color="white" />
                <Text style={styles.chanceText}>75%</Text>
              </View>
              <Text style={styles.dailyTempLow}>7°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#5ac8fa', '#66cc99']} style={[styles.barFill, { width: '80%', left: '10%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
                <View style={[styles.dotActive, { position: 'absolute', right: '15%' }]} />
              </View>
              <Text style={styles.dailyTempHigh}>14°</Text>
            </View>

            <View style={styles.dividerInner} />

            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Sun</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>90%</Text>
              </View>
              <Text style={styles.dailyTempLow}>2°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#5ac8fa']} style={[styles.barFill, { width: '40%', left: '10%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>9°</Text>
            </View>

            <View style={styles.dividerInner} />

            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Mon</Text>
              <Ionicons name="cloud" size={20} color="white" style={styles.dailyIcon} />
              <Text style={styles.dailyTempLow}>1°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '30%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>6°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Tue</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="snow" size={20} color="white" />
                 <Text style={styles.chanceText}>75%</Text>
              </View>
              <Text style={styles.dailyTempLow}>1°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '30%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>6°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Wed</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>95%</Text>
              </View>
              <Text style={styles.dailyTempLow}>3°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '40%', left: '15%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>9°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Thu</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>55%</Text>
              </View>
              <Text style={styles.dailyTempLow}>2°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '30%', left: '10%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>6°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Fri</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>45%</Text>
              </View>
              <Text style={styles.dailyTempLow}>1°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '25%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>5°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Sat</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>50%</Text>
              </View>
              <Text style={styles.dailyTempLow}>1°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '30%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>6°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Sun</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="snow" size={20} color="white" />
                 <Text style={styles.chanceText}>45%</Text>
              </View>
              <Text style={styles.dailyTempLow}>1°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '20%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>4°</Text>
            </View>
            
            <View style={styles.dividerInner} />
            
            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Mon</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="rainy" size={20} color="white" />
                 <Text style={styles.chanceText}>70%</Text>
              </View>
              <Text style={styles.dailyTempLow}>2°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '35%', left: '10%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>7°</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Ionicons name="map-outline" size={28} color="white" />
          
          <View style={styles.pageControl}>
             <Ionicons name="location-sharp" size={12} color="white" style={{ marginHorizontal: 2 }}/>
             <View style={styles.dotActive} />
             <View style={styles.dot} />
             <View style={styles.dot} />
          </View>

          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton} activeOpacity={0.8}>
            <FontAwesome5 name="hand-rock" size={20} color="white" />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scroll: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 60,
    marginBottom: 40,
  },
  city: {
    fontSize: 34,
    color: '#fff',
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  temperature: {
    fontSize: 96,
    color: '#fff',
    fontWeight: '200',
    marginVertical: -5,
  },
  condition: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
  highLow: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    backgroundColor: 'rgba(0, 50, 120, 0.25)',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 15,
  },
  cardDesc: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: -15,
    marginBottom: 10,
  },
  dividerInner: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },
  hourlyList: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 25,
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  hourlyIcon: {
    marginBottom: 10,
  },
  hourlyIconGroup: {
    marginBottom: 10,
    alignItems: 'center',
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyDay: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    width: 60,
  },
  dailyIcon: {
    width: 30,
    textAlign: 'center',
  },
  dailyIconGroup: {
    width: 30,
    alignItems: 'center',
  },
  chanceText: {
    color: '#5ac8fa',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -2,
  },
  dailyTempLow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 20,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  dailyTempHigh: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    width: 40,
    textAlign: 'right',
  },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    marginHorizontal: 15,
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(15, 80, 150, 0.9)',
  },
  pageControl: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginHorizontal: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 3,
  },
  settingsButton: {
    padding: 2,
    marginRight: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 34,
    height: 34,
    overflow: 'hidden'
  },
  sosCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 15,
    marginBottom: 15,
  },
  sosCardTitle: {
    color: '#ffcccc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sosCardSubtitle: {
    color: 'rgba(255, 204, 204, 0.8)',
    fontSize: 13,
  }
});
