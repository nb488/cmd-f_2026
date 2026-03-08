import { Stack } from "expo-router";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pin" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/resources" />
        <Stack.Screen name="settings/chatbot" />
    </Stack>
  );
}
