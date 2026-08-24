import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Modal,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChipButton, PrimaryButton, SectionCard, FeatureItem, FacilityChip } from '../components';
import { BottomNavBar } from '../components/BottomNavBar';
import { AdBanner } from '../components/AdBanner';
import { colors, spacing, radius, fontSize, fonts, shadows, borderRadius } from '../styles/theme';
import { useRecommendations, useSearchLimit } from '../hooks';
import { usePlan } from '../context/PlanContext';
import { PlacesService, GASTRONOMY_SUBTYPES } from '../services/placeService';
import { Place } from '../types/place';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

// Habilitar animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Tipos de dados para seleção
type BudgetType = 'economic' | 'moderate' | 'premium' | null;
type ExperienceType = 'gastronomy' | 'culture' | 'nature' | 'adventure' | 'casual' | null;
type TimeType = 'day' | 'night' | null;
type VibeType = 'intimate' | 'lively' | 'calm' | null;
type DistanceType = 'nearby' | 'medium' | 'explore' | null;

// Mapeamento de valores para API
const BUDGET_MAP: Record<NonNullable<BudgetType>, '$' | '$$' | '$$$'> = {
    'economic': '$',
    'moderate': '$$',
    'premium': '$$$',
};

const TYPE_MAP: Record<NonNullable<ExperienceType>, 'gastronomia' | 'cultura' | 'ao-ar-livre' | 'aventura' | 'casual'> = {
    'gastronomy': 'gastronomia',
    'culture': 'cultura',
    'nature': 'ao-ar-livre',
    'adventure': 'aventura',
    'casual': 'casual',
};

const VIBE_MAP: Record<NonNullable<VibeType>, 'intimo' | 'animado' | 'tranquilo'> = {
    'intimate': 'intimo',
    'lively': 'animado',
    'calm': 'tranquilo',
};

const DISTANCE_MAP: Record<NonNullable<DistanceType>, 'perto' | 'medio' | 'longe'> = {
    'nearby': 'perto',
    'medium': 'medio',
    'explore': 'longe',
};

// Função para abrir o mapa
const openMap = async (place: Place) => {
    const name = encodeURIComponent(place.name ?? '');
    const query = encodeURIComponent(`${place.name} ${place.address} São Luís MA`);
    const hasCoords = place.latitude != null && place.longitude != null;

    try {
        if (Platform.OS === 'ios') {
            // Com coordenadas: ll= fixa o pin, q= define o nome exibido — sem sobrescrita
            // Sem coordenadas: busca por texto como fallback
            const url = hasCoords
                ? `maps://?ll=${place.latitude},${place.longitude}&q=${name}`
                : `maps://?q=${query}`;

            const canOpen = await Linking.canOpenURL(url);
            await Linking.openURL(canOpen ? url : `https://maps.apple.com/?ll=${place.latitude},${place.longitude}&q=${name}`);

        } else {
            // Android: geo: abre o Google Maps instalado com pin nomeado
            // Fallback web se o app não estiver instalado
            const geoUrl = hasCoords
                ? `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${name})`
                : `https://www.google.com/maps/search/?api=1&query=${query}`;

            const canOpen = await Linking.canOpenURL(geoUrl);
            await Linking.openURL(
                canOpen
                    ? geoUrl
                    : `https://www.google.com/maps/search/?api=1&query=${query}`
            );
        }
    } catch {
        Alert.alert('Erro', 'Não foi possível abrir o mapa');
    }
};

// Componente para exibir um lugar recomendado
const PlaceCard: React.FC<{ place: Place }> = ({ place }) => (
    <View style={styles.placeCard}>
        <View style={styles.placeHeader}>
            <Text style={styles.placeName}>{place.name}</Text>
        {place.rating >= 3 && (
                <Text style={styles.placeRating}>⭐ {place.rating.toFixed(1)}</Text>
            )}
        </View>
        <Text style={styles.placeDescription}>{place.description}</Text>
        <TouchableOpacity onPress={() => openMap(place)}>
            <Text style={styles.placeAddress}>📍 {place.address}</Text>
        </TouchableOpacity>
        {place.openingHours && place.openingHours !== 'Consultar horários' && (
            <Text style={styles.placeHours}>🕐 {place.openingHours}</Text>
        )}
        {place.suggestedActivity && (
            <View style={styles.romanticTip}>
                <Text style={styles.romanticTipTitle}>✨ Dica Romântica</Text>
                <Text style={styles.romanticTipText}>{place.suggestedActivity}</Text>
            </View>
        )}
        {place.specialTip && (
            <View style={styles.specialTipBox}>
                <Text style={styles.specialTipTitle}>💡 Dica Especial</Text>
                <Text style={styles.specialTipText}>{place.specialTip}</Text>
            </View>
        )}
        <View style={styles.placeTags}>
            {place.temEstacionamento && (
                <View style={styles.placeTag}>
                    <Text style={styles.placeTagText}>🅿️ Estacionamento</Text>
                </View>
            )}
            {place.acessivel && (
                <View style={styles.placeTag}>
                    <Text style={styles.placeTagText}>♿ Acessível</Text>
                </View>
            )}
        </View>
        {/* Botão Ver no Mapa */}
        <TouchableOpacity
            style={styles.mapButton}
            onPress={() => openMap(place)}
        >
            <Text style={styles.mapButtonText}>📍 Ver no Mapa</Text>
        </TouchableOpacity>
    </View>
);

export const HomeScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [selectedBudget, setSelectedBudget] = useState<BudgetType>(null);
    const [selectedExperience, setSelectedExperience] = useState<ExperienceType>('gastronomy');
    const [selectedTime, setSelectedTime] = useState<TimeType>('day');

    // Estados dos filtros avançados
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedVibe, setSelectedVibe] = useState<VibeType>(null);
    const [selectedDistance, setSelectedDistance] = useState<DistanceType>(null);
    const [hasParking, setHasParking] = useState(false);
    const [isAccessible, setIsAccessible] = useState(false);

    // Subcategoria de gastronomia
    const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
    const [showCuisineModal, setShowCuisineModal] = useState(false);

    // Estados de localização
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Hooks
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { isPremium } = usePlan();
    const { places, loading, error, searchPlaces, clearPlaces } = useRecommendations();
    const { remaining, isLimitReached, registerSearch } = useSearchLimit();

    const toggleAdvancedFilters = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAdvancedFilters(!showAdvancedFilters);
    };

    const handleLocationRequest = async () => {
        setLocationStatus('loading');
        try {
            const location = await PlacesService.getCurrentLocation();
            setUserLocation(location);
            setLocationStatus('granted');
            Alert.alert('Sucesso!', 'Localização obtida com sucesso! 📍');
        } catch (err) {
            setLocationStatus('denied');
            // Usar localização padrão de São Luís
            setUserLocation(PlacesService.getDefaultLocation());
            Alert.alert(
                'Aviso',
                'Não foi possível obter sua localização. Usaremos São Luís como referência.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleSurprise = async () => {
        // Validar seleções obrigatórias
        if (!selectedBudget || !selectedExperience || !selectedTime) {
            Alert.alert(
                'Atenção',
                'Selecione orçamento, tipo de experiência e período para continuar! 💕',
                [{ text: 'OK' }]
            );
            return;
        }

        // ── Verificar limite de buscas para usuários gratuitos ────────────────
        if (!isPremium && isLimitReached) {
            Alert.alert(
                'Limite diário atingido 😊',
                'Você usou todas as 3 buscas gratuitas de hoje!\n\nVolte amanhã ou assine o Plano Premium para buscas ilimitadas.',
                [
                    { text: 'Voltar amanhã', style: 'cancel' },
                    {
                        text: '✨ Ver Plano Premium',
                        onPress: () => navigation.navigate('Planos'),
                    },
                ]
            );
            return;
        }

        // Obter localização se ainda não tiver (mas sem pedir permissão automaticamente agora)
        let location = userLocation;
        if (!location) {
            // Usa localização padrão silenciosamente se o usuário ainda não permitiu.
            // Para pedir permissão, o usuário deve clicar explicitamente no botão de localização.
            location = PlacesService.getDefaultLocation();
            setUserLocation(location);
        }

        // Montar filtros
        const filters = {
            budget: BUDGET_MAP[selectedBudget],
            type: TYPE_MAP[selectedExperience],
            period: (selectedTime === 'day' ? 'dia' : 'noite') as 'dia' | 'noite',
            ambiente: selectedVibe ? VIBE_MAP[selectedVibe] : undefined,
            distancia: selectedDistance ? DISTANCE_MAP[selectedDistance] : undefined,
            cuisineSubtype: selectedExperience === 'gastronomy' && selectedCuisine ? selectedCuisine : undefined,
            temEstacionamento: hasParking || undefined,
            acessivel: isAccessible || undefined,
            latitude: location.latitude,
            longitude: location.longitude,
        };

        // Buscar recomendações e registrar uso
        await searchPlaces(filters);
        await registerSearch();
    };

    if (places.length < 8) {
  // opcional: mostrar aviso discreto
        console.log('Alguns lugares sugeridos não foram encontrados e foram removidos.');
    }

    const canSearch = selectedBudget && selectedExperience && selectedTime;


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <LinearGradient
                colors={[colors.background, colors.backgroundEnd, colors.card]}
                style={styles.gradient}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logoHeart}>💕</Text>
                        <View style={styles.logoRow}>
                            <Text style={styles.logoBold}>Date</Text>
                            <Text style={styles.logoLight}>App</Text>
                        </View>
                        <Text style={styles.logoTagline}>EXPERIÊNCIAS ROMÂNTICAS</Text>
                        <Text style={styles.headerSubtitle}>
                            Descubra experiências <Text style={styles.highlight}>únicas e inesquecíveis</Text> perto de você
                        </Text>
                    </View>

                    {/* Seção Principal - Monte seu rolê */}
                    <SectionCard
                        title="Monte seu rolê perfeito"
                        subtitle="Personalize cada detalhe da experiência"
                        sparkles
                    >
                        {/* Quanto desejam gastar? */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💰 Quanto desejam gastar?</Text>
                            <View style={styles.chipRow}>
                                <ChipButton
                                    emoji="👛"
                                    label="Econômico"
                                    sublabel="Até R$ 50"
                                    selected={selectedBudget === 'economic'}
                                    onPress={() => setSelectedBudget('economic')}
                                />
                                <ChipButton
                                    emoji="💎"
                                    label="Moderado"
                                    sublabel="R$ 50 - R$ 150"
                                    selected={selectedBudget === 'moderate'}
                                    onPress={() => setSelectedBudget('moderate')}
                                />
                                <ChipButton
                                    emoji="👑"
                                    label="Premium"
                                    sublabel="Acima de R$ 150"
                                    selected={selectedBudget === 'premium'}
                                    onPress={() => setSelectedBudget('premium')}
                                />
                            </View>
                        </View>

                        {/* Que tipo de experiência? */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🎯 Que tipo de experiência?</Text>
                            <View style={styles.chipGrid}>
                                <View style={styles.chipRow}>
                                    <ChipButton
                                        emoji="🍽️"
                                        label="Gastronomia"
                                        selected={selectedExperience === 'gastronomy'}
                                        onPress={() => {
                                            setSelectedExperience('gastronomy');
                                            setSelectedCuisine(null);
                                        }}
                                    />
                                    <ChipButton
                                        emoji="🎭"
                                        label="Cultura"
                                        selected={selectedExperience === 'culture'}
                                        onPress={() => {
                                            setSelectedExperience('culture');
                                            setSelectedCuisine(null);
                                        }}
                                    />
                                    <ChipButton
                                        emoji="🌿"
                                        label="Natureza"
                                        selected={selectedExperience === 'nature'}
                                        onPress={() => {
                                            setSelectedExperience('nature');
                                            setSelectedCuisine(null);
                                        }}
                                    />
                                </View>
                                <View style={styles.chipRowSmall}>
                                    <ChipButton
                                        emoji="⚡"
                                        label="Aventura"
                                        selected={selectedExperience === 'adventure'}
                                        onPress={() => {
                                            setSelectedExperience('adventure');
                                            setSelectedCuisine(null);
                                        }}
                                    />
                                    <ChipButton
                                        emoji="🧸"
                                        label="Casual"
                                        selected={selectedExperience === 'casual'}
                                        onPress={() => {
                                            setSelectedExperience('casual');
                                            setSelectedCuisine(null);
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Seletor de culinária — abre modal quando Gastronomia está selecionada */}
                            {selectedExperience === 'gastronomy' && (
                                <TouchableOpacity
                                    style={styles.cuisinePickerButton}
                                    onPress={() => setShowCuisineModal(true)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={styles.cuisinePickerEmoji}>
                                        {selectedCuisine
                                            ? GASTRONOMY_SUBTYPES.find(s => s.key === selectedCuisine)?.emoji ?? '🍴'
                                            : '🍽️'}
                                    </Text>
                                    <Text style={styles.cuisinePickerText}>
                                        {selectedCuisine
                                            ? GASTRONOMY_SUBTYPES.find(s => s.key === selectedCuisine)?.label ?? 'Qualquer'
                                            : 'Qualquer tipo de comida'}
                                    </Text>
                                    <Text style={styles.cuisinePickerArrow}>›</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Quando querem ir? */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🕐 Quando querem ir?</Text>
                            <View style={styles.chipRowTime}>
                                <ChipButton
                                    emoji="☀️"
                                    label="Durante o Dia"
                                    selected={selectedTime === 'day'}
                                    onPress={() => setSelectedTime('day')}
                                />
                                <ChipButton
                                    emoji="🌙"
                                    label="À Noite"
                                    selected={selectedTime === 'night'}
                                    onPress={() => setSelectedTime('night')}
                                />
                            </View>
                        </View>

                        {/* Botão de filtros avançados */}
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={toggleAdvancedFilters}
                        >
                            <Text style={styles.filterButtonText}>
                                ✨ {showAdvancedFilters ? 'Esconder filtros avançados' : 'Mais opções de filtro'} ✨
                            </Text>
                        </TouchableOpacity>

                        {/* Filtros Avançados - Expansível */}
                        {showAdvancedFilters && (
                            <View style={styles.advancedFiltersContainer}>
                                {/* Qual clima vocês preferem? */}
                                <View style={styles.sectionCompact}>
                                    <Text style={styles.sectionTitle}>🎵 Qual clima vocês preferem?</Text>
                                    <View style={styles.chipRow}>
                                        <ChipButton
                                            emoji="💕"
                                            label="Íntimo"
                                            selected={selectedVibe === 'intimate'}
                                            onPress={() => setSelectedVibe('intimate')}
                                        />
                                        <ChipButton
                                            emoji="🎉"
                                            label="Animado"
                                            selected={selectedVibe === 'lively'}
                                            onPress={() => setSelectedVibe('lively')}
                                        />
                                        <ChipButton
                                            emoji="🧘"
                                            label="Tranquilo"
                                            selected={selectedVibe === 'calm'}
                                            onPress={() => setSelectedVibe('calm')}
                                        />
                                    </View>
                                </View>

                                {/* Distância máxima */}
                                <View style={styles.sectionCompact}>
                                    <Text style={styles.sectionTitle}>📍 Distância máxima</Text>
                                    <View style={styles.chipRow}>
                                        <ChipButton
                                            emoji="📍"
                                            label="Pertinho"
                                            sublabel="Até 5km"
                                            selected={selectedDistance === 'nearby'}
                                            onPress={() => setSelectedDistance('nearby')}
                                        />
                                        <ChipButton
                                            emoji="🚗"
                                            label="Médio"
                                            sublabel="5 a 15km"
                                            selected={selectedDistance === 'medium'}
                                            onPress={() => setSelectedDistance('medium')}
                                        />
                                        <ChipButton
                                            emoji="🗺️"
                                            label="Explorar"
                                            sublabel="+15km"
                                            selected={selectedDistance === 'explore'}
                                            onPress={() => setSelectedDistance('explore')}
                                        />
                                    </View>
                                </View>

                                {/* Facilidades */}
                                <View style={[styles.sectionCompact, { marginBottom: 0 }]}>
                                    <Text style={styles.sectionTitle}>🎁 Facilidades</Text>
                                    <View style={styles.facilitiesRow}>
                                        <FacilityChip
                                            emoji="🅿️"
                                            label="Estacionamento"
                                            selected={hasParking}
                                            onPress={() => setHasParking(!hasParking)}
                                        />
                                        <FacilityChip
                                            emoji="♿"
                                            label="Acessível"
                                            selected={isAccessible}
                                            onPress={() => setIsAccessible(!isAccessible)}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Me Surpreenda */}
                        <TouchableOpacity
                            style={[
                                styles.surpriseButton,
                                canSearch && !isLimitReached && styles.surpriseButtonActive,
                                loading && styles.surpriseButtonLoading,
                                !isPremium && isLimitReached && styles.surpriseButtonBlocked,
                            ]}
                            onPress={handleSurprise}
                            disabled={loading}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color={colors.primary} size="small" />
                                    <Text style={styles.loadingText} numberOfLines={1}>Buscando lugares... ✨</Text>
                                </View>
                            ) : !isPremium && isLimitReached ? (
                                <View style={styles.loadingContainer}>
                                    <Text style={styles.surpriseButtonTextBlocked}>🔒 Limite diário atingido</Text>
                                </View>
                            ) : (
                                <Text style={[
                                    styles.surpriseButtonText,
                                    canSearch && styles.surpriseButtonTextActive,
                                ]}>
                                    💕 Me Surpreenda! 💕
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Contador de buscas / helper text */}
                        {!isPremium && !isLimitReached && remaining !== null ? (
                            <View style={styles.searchCounterRow}>
                                <Text style={styles.searchCounterText}>
                                    {remaining === 3
                                        ? '3 buscas gratuitas disponíveis hoje'
                                        : remaining === 1
                                        ? '⚠️ Última busca gratuita de hoje!'
                                        : `${remaining} buscas gratuitas restantes hoje`}
                                </Text>
                            </View>
                        ) : !isPremium && isLimitReached ? (
                            <TouchableOpacity
                                style={styles.upgradeBanner}
                                onPress={() => navigation.navigate('Planos')}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.upgradeBannerText}>
                                    ✨ Assine o Premium para buscas ilimitadas
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.helperText}>
                                {canSearch
                                    ? 'Tudo pronto! Clique em Me Surpreenda! 🎉'
                                    : 'Selecione orçamento, tipo e período para continuar'}
                            </Text>
                        )}
                    </SectionCard>


                    {/* Erro */}
                    {error && (
                        <SectionCard>
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorEmoji}>😔</Text>
                                <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
                                <Text style={styles.errorText}>
                                    Ocorreu um erro inesperado. Por favor, entre em contato com o suporte.
                                </Text>
                                <View style={styles.errorButtons}>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={handleSurprise}
                                    >
                                        <Text style={styles.retryButtonText}>🔄 Tentar novamente</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={clearPlaces}
                                    >
                                        <Text style={styles.clearButtonText}>✏️ Nova busca</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SectionCard>
                    )}

                    {/* Resultados */}
                    {places.length > 0 && (
                        <SectionCard
                            title="🎉 Lugares Recomendados"
                            subtitle={`Encontramos ${places.length} opções incríveis para vocês!`}
                        >
                            {places.map((place, index) => (
                                <PlaceCard key={place.id || index} place={place} />
                            ))}
                            <TouchableOpacity
                                style={styles.newSearchButton}
                                onPress={clearPlaces}
                            >
                                <Text style={styles.newSearchButtonText}>🔄 Nova Busca</Text>
                            </TouchableOpacity>
                        </SectionCard>
                    )}

                    {/* Seção Localização */}
                    <SectionCard>
                        <View style={styles.locationSection}>
                            <View style={styles.locationIcon}>
                                <Text style={styles.locationEmoji}>
                                    {locationStatus === 'granted' ? '✅' : '📍'}
                                </Text>
                            </View>
                            <Text style={styles.locationTitle}>
                                {locationStatus === 'granted'
                                    ? 'Localização permitida!'
                                    : 'Encontros perto de você'}
                            </Text>
                            <Text style={styles.locationSubtitle}>
                                {locationStatus === 'granted'
                                    ? 'Vamos encontrar lugares incríveis próximos a você!'
                                    : 'Para sugerir os melhores lugares, precisamos saber onde vocês estão. Sua localização será usada apenas durante a busca e nunca será compartilhada.'}
                            </Text>
                            {locationStatus !== 'granted' && (
                                <View style={styles.locationButtonContainer}>
                                    <PrimaryButton
                                        title={locationStatus === 'loading' ? 'Obtendo...' : 'Permitir Localização'}
                                        emoji="📍"
                                        onPress={handleLocationRequest}
                                    />
                                </View>
                            )}
                        </View>
                    </SectionCard>

                    {/* Como funciona? */}
                    <View style={styles.howItWorks}>
                        <Text style={styles.howItWorksTitle}>Como funciona?</Text>
                        <View style={styles.featuresContainer}>
                            <View style={styles.featuresRow}>
                                <FeatureItem
                                    emoji="📍"
                                    title="Localização"
                                    description="Permita acesso"
                                />
                                <FeatureItem
                                    emoji="⚙️"
                                    title="Configure"
                                    description="Escolha suas preferências"
                                />
                                <FeatureItem
                                    emoji="🎉"
                                    title="Descubra"
                                    description="Lugares incríveis!"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Banner de anúncio — visível apenas para usuários gratuitos */}
                    <AdBanner marginVertical={spacing.md} />

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>💕 DateApp</Text>
                        <Text style={styles.footerSubtext}>
                            Criando memórias inesquecíveis para casais ✨
                        </Text>
                        <View style={styles.footerDivider} />
                        <Text style={styles.footerDev}>Desenvolvedor Principal</Text>
                        <Text style={styles.footerDevName}>Marcos Vinicius Morais Rios</Text>
                        <Text style={styles.footerCopy}>© {new Date().getFullYear()} DateApp · Todos os direitos reservados</Text>
                    </View>
                </ScrollView>
            </LinearGradient>

            {/* Barra de navegação inferior */}
            <BottomNavBar />

            {/* ── Modal de seleção de culinária ─────────────────────────────── */}
            <Modal
                visible={showCuisineModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCuisineModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCuisineModal(false)}
                >
                    {/* Card do modal — toque interno não fecha */}
                    <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
                        {/* Cabeçalho */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🍴 Que tipo de comida?</Text>
                            <TouchableOpacity
                                onPress={() => setShowCuisineModal(false)}
                                style={styles.modalCloseBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.modalCloseBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Grade de opções */}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Opção "Qualquer" */}
                            <TouchableOpacity
                                style={[
                                    styles.modalOption,
                                    selectedCuisine === null && styles.modalOptionSelected,
                                ]}
                                onPress={() => {
                                    setSelectedCuisine(null);
                                    setShowCuisineModal(false);
                                }}
                            >
                                <Text style={styles.modalOptionEmoji}>🍽️</Text>
                                <Text style={[
                                    styles.modalOptionLabel,
                                    selectedCuisine === null && styles.modalOptionLabelSelected,
                                ]}>
                                    Qualquer tipo
                                </Text>
                                {selectedCuisine === null && (
                                    <Text style={styles.modalOptionCheck}>✓</Text>
                                )}
                            </TouchableOpacity>

                            {GASTRONOMY_SUBTYPES.map((sub) => (
                                <TouchableOpacity
                                    key={sub.key}
                                    style={[
                                        styles.modalOption,
                                        selectedCuisine === sub.key && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedCuisine(
                                            selectedCuisine === sub.key ? null : sub.key
                                        );
                                        setShowCuisineModal(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionEmoji}>{sub.emoji}</Text>
                                    <Text style={[
                                        styles.modalOptionLabel,
                                        selectedCuisine === sub.key && styles.modalOptionLabelSelected,
                                    ]}>
                                        {sub.label}
                                    </Text>
                                    {selectedCuisine === sub.key && (
                                        <Text style={styles.modalOptionCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 90, // espaço para a BottomNavBar
    },

    // ── Header / Logo ──────────────────────────────────────────────────────────
    header: {
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    logoHeart: {
        fontSize: 38,
        marginBottom: spacing.xs,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xs,
    },
    logoBold: {
        fontSize: fontSize.hero,
        fontFamily: fonts.headlineExtraBold,
        color: colors.primary,
        letterSpacing: -0.5,
    },
    logoLight: {
        fontSize: fontSize.hero,
        fontFamily: fonts.regular,
        color: colors.vibrant,
        letterSpacing: -0.5,
    },
    logoTagline: {
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        color: colors.textMuted,
        letterSpacing: 3,
        marginBottom: spacing.sm,
    },
    headerSubtitle: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },
    highlight: {
        color: colors.primary,
        fontFamily: fonts.semiBold,
    },

    // ── Seções e filtros ──────────────────────────────────────────────────────
    section: {
        marginBottom: spacing.xl,
    },
    sectionCompact: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        marginBottom: spacing.md,
    },
    chipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    chipRowSmall: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    chipRowTime: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
    },
    chipGrid: {
        gap: spacing.sm,
    },

    // ── Botão que abre o modal de culinária ───────────────────────────────────
    cuisinePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.medium,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    cuisinePickerEmoji: {
        fontSize: 22,
    },
    cuisinePickerText: {
        flex: 1,
        fontSize: fontSize.sm,
        fontFamily: fonts.semiBold,
        color: colors.textDark,
    },
    cuisinePickerArrow: {
        fontSize: 22,
        color: colors.textMuted,
    },

    // ── Modal de seleção de culinária ─────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl + 12,
        maxHeight: '75%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.medium,
    },
    modalTitle: {
        fontSize: fontSize.md,
        fontFamily: fonts.bold,
        color: colors.textDark,
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.tipBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseBtnText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        fontFamily: fonts.semiBold,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
        marginBottom: spacing.xs,
        gap: spacing.sm,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    modalOptionSelected: {
        backgroundColor: `${colors.primary}18`,
        borderColor: colors.primary,
    },
    modalOptionEmoji: {
        fontSize: 24,
        width: 36,
        textAlign: 'center',
    },
    modalOptionLabel: {
        flex: 1,
        fontSize: fontSize.sm,
        fontFamily: fonts.semiBold,
        color: colors.textDark,
    },
    modalOptionLabelSelected: {
        color: colors.primary,
    },
    modalOptionCheck: {
        fontSize: fontSize.md,
        color: colors.primary,
        fontFamily: fonts.bold,
    },
    filterButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
    },
    filterButtonText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontFamily: fonts.semiBold,
    },
    advancedFiltersContainer: {
        backgroundColor: colors.tipBackground,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.medium,
        borderStyle: 'dashed',
    },
    facilitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },

    // ── Botão principal ───────────────────────────────────────────────────────
    surpriseButton: {
        backgroundColor: colors.tipBackground,
        borderRadius: radius.full,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginVertical: spacing.md,
        borderWidth: 1.5,
        borderColor: colors.medium,
    },
    surpriseButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    surpriseButtonLoading: {
        backgroundColor: colors.background,
    },
    surpriseButtonText: {
        color: colors.textMuted,
        fontSize: fontSize.md,
        fontFamily: fonts.semiBold,
    },
    surpriseButtonTextActive: {
        color: colors.textOnPrimary,
        fontFamily: fonts.headlineBold,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    loadingText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontFamily: fonts.semiBold,
    },
    helperText: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        marginTop: spacing.sm,
    },

    // ── Limite de buscas ──────────────────────────────────────────────────────
    surpriseButtonBlocked: {
        backgroundColor: '#F5F5F5',
        borderColor: '#DDDDDD',
        opacity: 0.85,
    },
    surpriseButtonTextBlocked: {
        color: '#999999',
        fontSize: fontSize.md,
        fontFamily: fonts.semiBold,
    },
    searchCounterRow: {
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingVertical: spacing.xs,
    },
    searchCounterText: {
        color: colors.textMuted,
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        textAlign: 'center',
    },
    upgradeBanner: {
        marginTop: spacing.sm,
        backgroundColor: `${colors.primary}15`,
        borderRadius: radius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${colors.primary}40`,
    },
    upgradeBannerText: {
        color: colors.primary,
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        textAlign: 'center',
    },

    // ── Cards de lugares ──────────────────────────────────────────────────────

    placeCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.medium,
        ...shadows.small,
    },
    placeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    placeName: {
        fontSize: fontSize.lg,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        flex: 1,
    },
    placeRating: {
        fontSize: fontSize.sm,
        fontFamily: fonts.headlineBold,
        color: colors.primary,
    },
    placeDescription: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginBottom: spacing.sm,
        lineHeight: 21,
    },
    placeAddress: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    placeActivity: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.primary,
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    placeTip: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.xs,
        backgroundColor: colors.tipBackground,
        padding: spacing.sm,
        borderRadius: radius.sm,
    },
    placeTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    placeTag: {
        backgroundColor: colors.tipBackground,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.medium,
    },
    placeTagText: {
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        color: colors.primary,
    },
    placeHours: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    romanticTip: {
        backgroundColor: colors.tipBackground,
        padding: spacing.md,
        borderRadius: radius.md,
        marginTop: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    romanticTipTitle: {
        fontSize: fontSize.sm,
        fontFamily: fonts.headlineBold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    romanticTipText: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    specialTipBox: {
        backgroundColor: '#FFF8E7',
        padding: spacing.md,
        borderRadius: radius.md,
        marginTop: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: '#F5A623',
    },
    specialTipTitle: {
        fontSize: fontSize.sm,
        fontFamily: fonts.headlineBold,
        color: '#D4870A',
        marginBottom: spacing.xs,
    },
    specialTipText: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    mapButtonText: {
        color: colors.primary,
        fontSize: fontSize.sm,
        fontFamily: fonts.headlineBold,
    },
    newSearchButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    newSearchButtonText: {
        color: colors.textOnPrimary,
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
    },

    // ── Erro ─────────────────────────────────────────────────────────────────
    errorContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorTitle: {
        fontSize: fontSize.lg,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    retryButtonText: {
        color: colors.textOnPrimary,
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
    },
    errorBullet: {
        paddingLeft: spacing.sm,
        color: colors.primary,
        fontFamily: fonts.medium,
    },
    errorButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    clearButton: {
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    clearButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
    },

    // ── Localização ───────────────────────────────────────────────────────────
    locationSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    locationIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.tipBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.medium,
    },
    locationEmoji: {
        fontSize: 32,
    },
    locationTitle: {
        fontSize: fontSize.lg,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    locationSubtitle: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    locationButtonContainer: {
        width: '100%',
        paddingHorizontal: spacing.lg,
    },

    // ── Como funciona ─────────────────────────────────────────────────────────
    howItWorks: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    howItWorksTitle: {
        fontSize: fontSize.xl,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    featuresContainer: {
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: spacing.xl,
        ...shadows.medium,
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    footer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
        backgroundColor: colors.tipBackground,
        marginTop: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.medium,
    },
    footerText: {
        fontSize: fontSize.lg,
        fontFamily: fonts.headlineBold,
        color: colors.primary,
    },
    footerSubtext: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    footerDivider: {
        width: '60%',
        height: 1,
        backgroundColor: colors.medium,
        marginVertical: spacing.lg,
        opacity: 0.6,
    },
    footerDev: {
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        color: colors.primary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    footerDevName: {
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
        marginTop: spacing.xs,
    },
    footerCopy: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});
