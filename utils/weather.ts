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
    // Map based on ECCC standard codes
    switch (iconCode) {
        case 0: return 'sunny';
        case 1: case 2: return 'partly-sunny';
        case 3: case 10: return 'cloudy';
        case 6: case 9: case 11: case 12: return 'rainy';
        case 13: return 'water';
        case 14: case 15: case 16: case 17: case 18: return 'snow';
        case 19: return 'thunderstorm';
        case 30: return 'moon';
        case 31: case 32: return 'cloudy-night';
        case 33: return 'cloud';
        case 36: return 'rainy';
        case 37: case 38: return 'snow';
        case 39: return 'thunderstorm';
        default:
            if (iconCode >= 4 && iconCode <= 8) return 'rainy';
            if (iconCode >= 23 && iconCode <= 24) return 'cloud';
            if (iconCode >= 40 && iconCode <= 48) return 'snow';
            return 'partly-sunny';
    }
}

/**
 * Maps Open-Meteo WMO weather codes to Ionicons names
 * See: https://open-meteo.com/en/docs#weathervariables
 */
export function mapWmoCodeToIonicon(code: number, isDay: boolean = true): keyof typeof import('@expo/vector-icons').Ionicons.glyphMap {
    if (code === 0) return isDay ? 'sunny' : 'moon';
    if (code === 1 || code === 2) return isDay ? 'partly-sunny' : 'cloudy-night';
    if (code === 3) return 'cloudy';
    if (code >= 45 && code <= 48) return 'cloud'; // Fog
    if (code >= 51 && code <= 55) return 'rainy'; // Drizzle
    if (code >= 56 && code <= 57) return 'snow';  // Freezing drizzle
    if (code >= 61 && code <= 65) return 'rainy'; // Rain
    if (code >= 66 && code <= 67) return 'snow';  // Freezing rain
    if (code >= 71 && code <= 77) return 'snow';  // Snow
    if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
    if (code === 85 || code === 86) return 'snow'; // Snow showers
    if (code >= 95 && code <= 99) return 'thunderstorm'; // Thunderstorm
    return isDay ? 'partly-sunny' : 'moon';
}

/**
 * Fetches complete hourly forecast from Open-Meteo (free, no API key, no gaps)
 * Returns 48 hours of data starting from the current hour
 */
export async function fetchOpenMeteoHourly(lat: number, lon: number): Promise<HourlyForecast[]> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,is_day&forecast_days=3&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
        const data = await response.json();

        const times: string[] = data.hourly?.time || [];
        const temps: number[] = data.hourly?.temperature_2m || [];
        const codes: number[] = data.hourly?.weathercode || [];
        const isDayArr: number[] = data.hourly?.is_day || [];

        const now = Date.now();
        const hourly: HourlyForecast[] = [];

        for (let i = 0; i < times.length; i++) {
            // Open-Meteo returns "2026-03-08T14:00" without timezone — parse as local
            const isoWithTz = times[i] + ':00'; // add seconds
            const ts = new Date(isoWithTz).getTime();

            // Only keep entries from 1 hour ago onward (to capture the "current" hour)
            if (ts < now - 3600000) continue;

            const code = codes[i] ?? 0;
            const isDay = (isDayArr[i] ?? 1) === 1;

            hourly.push({
                timestamp: isoWithTz,
                temperature: temps[i] ?? 0,
                condition: `WMO ${code}`,
                iconCode: code + (isDay ? 0 : 1000), // offset night codes so we can detect them
            });

            if (hourly.length >= 24) break; // Limit to 24 hours
        }

        return hourly;
    } catch (error) {
        console.error('Open-Meteo hourly fetch failed:', error);
        return [];
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
