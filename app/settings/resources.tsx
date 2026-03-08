import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function ResourcesScreen() {
  const router = useRouter();

  const resources = [
    {
      title: 'VictimLinkBC',
      description: '24/7 confidential, multilingual crisis support and referrals.',
      url: 'tel:18005630808'
    },
    {
      title: 'Vancouver Rape Relief & Women’s Shelter',
      description: '24-hour crisis line and emergency shelter for women.',
      url: 'tel:6042556344'
    },
    {
      title: 'Battered Women’s Support Services (BWSS)',
      description: 'Support, advocacy, and crisis lines for women in Metro Vancouver.',
      url: 'tel:18556871868'
    },
    {
      title: 'Legal Aid BC (Vancouver)',
      description: 'Free legal help for low-income residents for family and criminal law.',
      url: 'https://legalaid.bc.ca/'
    },
    {
      title: 'Canadian Human Trafficking Hotline',
      description: 'Confidential 24/7 hotline for support and reporting.',
      url: 'tel:18339001010'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>&lt; Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Text style={styles.header}>Help Resources</Text>
        <Text style={styles.subtext}>Quick links to organizations that can assist you in Vancouver and British Columbia.</Text>

        {resources.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', paddingTop: Platform.OS === 'ios' ? 40 : 20, paddingHorizontal: 20 },
  headerContainer: { marginTop: 10, marginBottom: 10 },
  header: { fontSize: 32, color: '#fff', fontWeight: 'bold', marginTop: 10 },
  subtext: { color: '#aaa', marginBottom: 30, fontSize: 16 },
  card: { backgroundColor: '#222', padding: 20, borderRadius: 10, marginBottom: 15 },
  cardTitle: { color: '#4A90E2', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { color: '#bbb', fontSize: 14 },
  backBtn: { paddingVertical: 10 },
  backBtnText: { color: '#4A90E2', fontSize: 18 },
  bottomSpacer: { height: 50 }
});
