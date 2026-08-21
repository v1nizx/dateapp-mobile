import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    WelcomeScreen,
    LoginScreen,
    PlanosScreen,
    RegisterScreen,
    HomeScreen,
    PerfilScreen,
} from '../screens';

export type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Planos: undefined;
    Perfil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Planos" component={PlanosScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
        </Stack.Navigator>
    );
}
