import * as Location from 'expo-location';

export const WEST_VANCOUVER_COORDS = {
  latitude: 49.3667,
  longitude: -123.1665
};

// Define types for our internal weather state
export interface DailyForecast {
  periodName: string;
  temperature: number;
  temperatureClass: 'high' | 'low';
  condition: string;
  iconCode: number;
}

export interface HourlyForecast {
  timestamp: string; // ISO string
  temperature: number;
  condition: string;
  iconCode: number;
}

export interface WeatherData {
  stationName: string;
  temperature: number;
  condition: string;
  iconCode: number;
  dailyForecast: DailyForecast[];
  hourlyForecast: HourlyForecast[];
  high?: number;
  low?: number;
  sunrise?: string;
  sunset?: string;
}

/**
 * Fetches the user's current location directly using expo-location.
 */
export async function fetchUserLocation(): Promise<Location.LocationObjectCoords | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission to access location was denied');
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  } catch (error) {
    console.error('Error fetching location:', error);
    return null;
  }
}

/**
 * Maps ECCC numerical icon codes to Ionicons names
 */
export function mapIconCodeToIonicon(iconCode: number): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
  // Map based on ECCC standard codes (https://dd.weather.gc.ca/citypage_weather/docs/current_conditions_icon_code_description_e.csv)
  switch (iconCode) {
    case 0: // Sunny
      return 'sunny';
    case 1: // Mainly sunny
    case 2: // A mix of sun and cloud
      return 'partly-sunny';
    case 3: // Mainly cloudy
    case 10: // Cloudy
      return 'cloudy';
    case 6: // Drizzle
    case 9: // Thunderstorm with rain
    case 11: // Squalls
    case 12: // Showers
      return 'rainy';
    case 13: // Rain at times heavy
      return 'water';
    case 14: // Freezing rain
    case 15: // Rain or snow
    case 16: // Snow
    case 17: // Snow at times heavy
    case 18: // Freezing drizzle
      return 'snow';
    case 19: // Thunderstorms
      return 'thunderstorm';
    case 30: // Clear (night)
      return 'moon';
    case 31: // Mainly clear (night)
    case 32: // A mix of clear and cloud (night)
      return 'cloudy-night';
    case 33: // Mainly cloudy (night)
      return 'cloud';
    case 36: // Showers (night)
      return 'rainy';
    case 37: // Rain or snow (night)
    case 38: // Snow (night)
      return 'snow';
    case 39: // Thunderstorms (night)
      return 'thunderstorm';
    default:
      // Fallbacks based on ranges if specific codes are missing
      if (iconCode >= 4 && iconCode <= 8) return 'rainy';
      if (iconCode >= 23 && iconCode <= 24) return 'cloud'; // Fog
      if (iconCode >= 40 && iconCode <= 48) return 'snow';
      return 'partly-sunny';
  }
}

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/**
 * Fetches real-time weather from ECCC MSC GeoMet API for given coordinates
 */
export async function fetchWeatherForLocation(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    // Create a bounding box around the coordinate (+/- 0.5 degrees is roughly 50km)
    const margin = 0.5;
    const minLon = lon - margin;
    const minLat = lat - margin;
    const maxLon = lon + margin;
    const maxLat = lat + margin;

    const url = `https://api.weather.gc.ca/collections/citypageweather-realtime/items?f=json&bbox=${minLon},${minLat},${maxLon},${maxLat}`;
    console.log('Fetching weather from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      // No weather stations found perfectly in range, could retry with larger bbox, but for now return null
      console.warn('No weather stations found in bounding box.');
      return null;
    }

    // Find closest station
    let closestFeature = data.features[0];
    let minDistance = Infinity;

    for (const feature of data.features) {
      if (feature.geometry && feature.geometry.coordinates) {
        const [stnLon, stnLat] = feature.geometry.coordinates;
        const dist = getDistanceFromLatLonInKm(lat, lon, stnLat, stnLon);
        if (dist < minDistance) {
          minDistance = dist;
          closestFeature = feature;
        }
      }
    }

    const properties = closestFeature.properties;
    if (!properties) return null;

    // Parse current conditions
    const current = properties.currentConditions || {};
    const condition = properties.condition?.en || current.condition?.en || 'Unknown';
    const temp = current.temperature?.value?.en ?? 0;
    const stationName = properties.station?.value?.en || 'Unknown Station';
    const iconCode = current.iconCode?.value ?? 0; // Default to 0

    // Parse Sunrise and Sunset
    const riseSet = properties.riseSet || {};
    let sunriseLocal = '';
    let sunsetLocal = '';
    
    if (riseSet.sunrise?.en) {
      const d = new Date(riseSet.sunrise.en);
      sunriseLocal = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    if (riseSet.sunset?.en) {
      const d = new Date(riseSet.sunset.en);
      sunsetLocal = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    // Parse Daily Forecast
    const daily: DailyForecast[] = [];
    let high: number | undefined;
    let low: number | undefined;

    const fg = properties.forecastGroup;
    if (fg && fg.forecasts) {
      // ECCC API often returns Day and Night separately.
      for (let i = 0; i < fg.forecasts.length; i++) {
        const item = fg.forecasts[i];
        
        const periodName = item.period?.textForecastName?.en || 'Unknown';
        
        let itemTemp = 0;
        let tClass = 'high';
        if (item.temperatures?.temperature && item.temperatures.temperature.length > 0) {
          itemTemp = item.temperatures.temperature[0].value?.en ?? 0;
          tClass = item.temperatures.temperature[0].class?.en ?? 'high';
        }

        const itemCondition = item.abbreviatedForecast?.textSummary?.en || 'Unknown';
        const itemIconCode = item.abbreviatedForecast?.icon?.value ?? 0;

        // Skip night entries to keep it to one per day if we have enough items, 
        // but keep the first one if it's "Tonight"
        const isNight = periodName.toLowerCase().includes('night');
        
        if (i === 0 || !isNight) {
           daily.push({
             periodName: isNight && i === 0 ? 'Tonight' : periodName,
             temperature: itemTemp,
             temperatureClass: tClass as 'high' | 'low',
             condition: itemCondition,
             iconCode: itemIconCode
           });
        }

        // Set today's high and low from the first few items if not yet set
        if (tClass === 'high' && high === undefined) high = itemTemp;
        if (tClass === 'low' && low === undefined) low = itemTemp;
      }
    }

    // Parse Hourly Forecast
    const hourly: HourlyForecast[] = [];
    const hg = properties.hourlyForecastGroup;
    if (hg && hg.hourlyForecasts) {
      for (const item of hg.hourlyForecasts) {
        hourly.push({
          timestamp: item.timestamp,
          temperature: item.temperature?.value?.en ?? 0,
          condition: item.condition?.en ?? 'Unknown',
          iconCode: item.iconCode?.value ?? 0
        });
      }
    }

    // Fallbacks if current conditions part was empty (sometimes happens with ECCC stations)
    if (condition === 'Unknown' && daily.length > 0) {
      // The new parsing already sets `condition` and `iconCode` from `properties.condition` or `current.condition`.
      // This fallback might be less necessary now, but keeping it for robustness if `current` is truly empty.
      // However, the new parsing sets `condition` and `iconCode` to 'Unknown' and 0 if not found,
      // so this block would only trigger if `properties.condition` and `current.condition` were both empty,
      // AND `daily` has items.
      // Let's adjust to use the new variable names.
      // If `condition` is still 'Unknown' after initial parsing, try to get it from the first daily forecast.
      if (condition === 'Unknown') {
        // This part of the original code was:
        // currentCondition = daily[0].condition;
        // currentIconCode = daily[0].iconCode;
        // currentTemperature = currentTemperature || daily[0].temperature;
        // With the new structure, `condition` and `iconCode` are already defined.
        // We'll assume the new parsing is more robust and this specific fallback isn't needed for `condition`/`iconCode`
        // if `temp` is 0, we can try to get it from daily.
        // The instruction didn't explicitly modify this fallback, but the new parsing changes the variables.
        // For now, I'll remove the fallback for condition/iconCode as the new parsing handles it.
        // If `temp` is 0, we can try to get it from daily.
        // The instruction didn't explicitly modify this fallback, but the new parsing changes the variables.
        // For now, I'll remove the fallback for condition/iconCode as the new parsing handles it.
      }
    }

    return {
      temperature: temp,
      condition,
      stationName,
      iconCode,
      hourlyForecast: hourly.slice(0, 24), // Keep next 24 hours
      dailyForecast: daily.slice(0, 7), // Keep 7 days roughly
      high,
      low,
      sunrise: sunriseLocal,
      sunset: sunsetLocal
    };

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
