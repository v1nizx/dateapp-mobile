import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';
import { HomeScreen } from './src/screens';
import { colors } from './src/styles/theme';

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <HomeScreen />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
});