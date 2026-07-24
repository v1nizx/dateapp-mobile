import React, { useEffect } from 'react';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { colors } from './src/styles/theme';
import { 
    useFonts, 
    PlusJakartaSans_700Bold, 
    PlusJakartaSans_800ExtraBold 
} from '@expo-google-fonts/plus-jakarta-sans';
import { 
    BeVietnamPro_400Regular, 
    BeVietnamPro_500Medium, 
    BeVietnamPro_600SemiBold 
} from '@expo-google-fonts/be-vietnam-pro';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { PlanProvider } from './src/context/PlanContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
    let [fontsLoaded] = useFonts({
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold,
        BeVietnamPro_400Regular,
        BeVietnamPro_500Medium,
        BeVietnamPro_600SemiBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <AuthProvider>
            <PlanProvider>
                <SafeAreaProvider style={styles.container}>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </PlanProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
});