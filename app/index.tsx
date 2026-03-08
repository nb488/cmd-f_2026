import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as SecureStore from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function WeatherCoverScreen() {
  const router = useRouter();

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
    <LinearGradient colors={['#7E8B99', '#5B6B7C', '#3A4755']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.city}>North Vancouver</Text>
            <Text style={styles.temperature}>-4°</Text>
            <Text style={styles.condition}>Feels Like: -8°</Text>
            <Text style={styles.highLow}>H:-3°  L:-5°</Text>
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
              Cloudy conditions will continue for the rest of the day. The lowest Feels Like temperature was -10° around 12PM.
            </Text>
            <View style={styles.divider} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyList}>
              {['Now', '2PM', '3PM', '4PM', '5PM'].map((time, i) => (
                <View key={i} style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>{time}</Text>
                  <Ionicons name="cloud" size={24} color="white" style={styles.hourlyIcon} />
                  <Text style={styles.hourlyTemp}>{i === 1 ? '-3°' : '-4°'}</Text>
                </View>
              ))}

              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>6PM</Text>
                <Ionicons name="cloud-outline" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>-3°</Text>
              </View>

              <View style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>7PM</Text>
                <Ionicons name="cloud-outline" size={24} color="white" style={styles.hourlyIcon} />
                <Text style={styles.hourlyTemp}>-4°</Text>
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
              <Ionicons name="cloud" size={20} color="white" style={styles.dailyIcon} />
              <Text style={styles.dailyTempLow}>-5°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '40%', left: '30%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>-3°</Text>
            </View>

            <View style={styles.dividerInner} />

            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Tue</Text>
              <View style={styles.dailyIconGroup}>
                 <Ionicons name="snow" size={20} color="white" />
                 <Text style={styles.chanceText}>30%</Text>
              </View>
              <Text style={styles.dailyTempLow}>-7°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff']} style={[styles.barFill, { width: '50%', left: '10%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>-2°</Text>
            </View>

            <View style={styles.dividerInner} />

            <View style={styles.dailyRow}>
              <Text style={styles.dailyDay}>Wed</Text>
              <Ionicons name="partly-sunny" size={20} color="white" style={styles.dailyIcon} />
              <Text style={styles.dailyTempLow}>-8°</Text>
              <View style={styles.barBg}>
                <LinearGradient colors={['#5ac8fa', '#007aff', '#ffcc00']} style={[styles.barFill, { width: '70%', left: '5%' }]} start={{x: 0, y: 0}} end={{x: 1, y: 0}} />
              </View>
              <Text style={styles.dailyTempHigh}>0°</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(40, 50, 65, 0.4)',
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
    backgroundColor: 'rgba(58, 71, 85, 0.9)',
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
