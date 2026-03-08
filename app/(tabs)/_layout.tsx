import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
        <Tabs.Screen 
            name="(tabs)" options={{
            headerShown: false,
        }}/>
        <Tabs.Screen name="about" options={{
            headerTitle: "About Screen"
        }}/>
        <Tabs.Screen name="+not-found" options={{}}/>
    </Tabs>
  );
}
