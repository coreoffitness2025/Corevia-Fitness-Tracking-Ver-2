import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  NativeAdView,
  CallToActionView,
  IconView,
  HeadlineView,
  TaglineView,
  AdvertiserView,
  ImageView,
} from 'react-native-google-mobile-ads';

const NativeAdCard = ({ adUnitId }) => {
  const [nativeAd, setNativeAd] = useState(null);

  // This is a simplified example. In a real app, you would use a more robust
  // ad loading strategy, possibly with a global ad manager.
  useEffect(() => {
    // Here you would typically load an ad from a NativeAd instance.
    // For this example, we'll just show the structure.
  }, []);

  if (!nativeAd) {
    // In a real app, you'd return null or a placeholder
    // while the ad is loading.
    return (
        <View style={styles.adContainer}>
            <Text>Ad placeholder</Text>
        </View>
    );
  }

  return (
    <NativeAdView
        ad={nativeAd}
        style={styles.adContainer}
    >
      <View style={styles.adContent}>
        <IconView style={styles.icon} />
        <View style={styles.adTextContent}>
          <HeadlineView style={styles.headline} />
          <TaglineView style={styles.tagline} />
          <AdvertiserView style={styles.advertiser} />
        </View>
        <CallToActionView style={styles.callToAction} />
      </View>
      <ImageView style={styles.media} />
    </NativeAdView>
  );
};

const styles = StyleSheet.create({
    adContainer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
    },
    adContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 50,
        height: 50,
    },
    adTextContent: {
        flex: 1,
        marginLeft: 10,
    },
    headline: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    tagline: {
        fontSize: 12,
    },
    advertiser: {
        fontSize: 10,
        color: 'gray',
    },
    callToAction: {
        backgroundColor: '#007bff',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
    },
    media: {
        width: '100%',
        height: 180,
    },
});

export default NativeAdCard; 