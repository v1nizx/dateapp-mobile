import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChipButton, PrimaryButton, SectionCard, FeatureItem, FacilityChip } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/theme';
import { useRecommendations } from '../hooks';
import { PlacesService } from '../services/placeService';
import { Place } from '../types/place';

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
            {place.rating > 0 && (
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
    const [selectedBudget, setSelectedBudget] = useState<BudgetType>(null);
    const [selectedExperience, setSelectedExperience] = useState<ExperienceType>('gastronomy');
    const [selectedTime, setSelectedTime] = useState<TimeType>('day');

    // Estados dos filtros avançados
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedVibe, setSelectedVibe] = useState<VibeType>(null);
    const [selectedDistance, setSelectedDistance] = useState<DistanceType>(null);
    const [hasParking, setHasParking] = useState(false);
    const [isAccessible, setIsAccessible] = useState(false);

    // Estados de localização
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Hook de recomendações
    const { places, loading, error, searchPlaces, clearPlaces } = useRecommendations();

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

        // Obter localização se ainda não tiver
        let location = userLocation;
        if (!location) {
            try {
                location = await PlacesService.getCurrentLocation();
                setUserLocation(location);
                setLocationStatus('granted');
            } catch {
                location = PlacesService.getDefaultLocation();
                setUserLocation(location);
            }
        }

        // Montar filtros
        const filters = {
            budget: BUDGET_MAP[selectedBudget],
            type: TYPE_MAP[selectedExperience],
            period: selectedTime === 'day' ? 'dia' : 'noite',
            ambiente: selectedVibe ? VIBE_MAP[selectedVibe] : undefined,
            distancia: selectedDistance ? DISTANCE_MAP[selectedDistance] : undefined,
            temEstacionamento: hasParking || undefined,
            acessivel: isAccessible || undefined,
            latitude: location.latitude,
            longitude: location.longitude,
        };

        // Buscar recomendações
        await searchPlaces(filters);
    };

    if (places.length < 5) {
  // opcional: mostrar aviso discreto
        console.log('Alguns lugares sugeridos não foram encontrados e foram removidos.');
    }

    const canSearch = selectedBudget && selectedExperience && selectedTime;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <LinearGradient
                colors={['#FFE4EC', '#FFF5F8', '#FFFFFF']}
                style={styles.gradient}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>💕 Roteiro Surpresa ✨</Text>
                        <Text style={styles.headerSubtitle}>
                            ✨ Descubra experiências <Text style={styles.highlight}>únicas e inesquecíveis</Text> perto de você
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
                                        onPress={() => setSelectedExperience('gastronomy')}
                                    />
                                    <ChipButton
                                        emoji="🎭"
                                        label="Cultura"
                                        selected={selectedExperience === 'culture'}
                                        onPress={() => setSelectedExperience('culture')}
                                    />
                                    <ChipButton
                                        emoji="🌿"
                                        label="Natureza"
                                        selected={selectedExperience === 'nature'}
                                        onPress={() => setSelectedExperience('nature')}
                                    />
                                </View>
                                <View style={styles.chipRowSmall}>
                                    <ChipButton
                                        emoji="⚡"
                                        label="Aventura"
                                        selected={selectedExperience === 'adventure'}
                                        onPress={() => setSelectedExperience('adventure')}
                                    />
                                    <ChipButton
                                        emoji="🧸"
                                        label="Casual"
                                        selected={selectedExperience === 'casual'}
                                        onPress={() => setSelectedExperience('casual')}
                                    />
                                </View>
                            </View>
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
                                <View style={styles.section}>
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
                                <View style={styles.section}>
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
                                <View style={styles.section}>
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
                                canSearch && styles.surpriseButtonActive,
                                loading && styles.surpriseButtonLoading,
                            ]}
                            onPress={handleSurprise}
                            disabled={loading}
                        >
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color={colors.primary} size="small" />
                                    <Text style={styles.loadingText}>Buscando e validando lugares... ✨</Text>
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

                        <Text style={styles.helperText}>
                            {canSearch
                                ? 'Tudo pronto! Clique em Me Surpreenda! 🎉'
                                : 'Selecione orçamento, tipo e período para continuar'}
                        </Text>
                    </SectionCard>

                    {/* Erro */}
                    {error && (
                        <SectionCard>
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorEmoji}>😔</Text>
                                <Text style={styles.errorTitle}>Ops! Algo deu errado</Text>
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={handleSurprise}
                                >
                                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                                </TouchableOpacity>
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
                                    : 'Permita o acesso à localização'}
                            </Text>
                            <Text style={styles.locationSubtitle}>
                                {locationStatus === 'granted'
                                    ? 'Vamos encontrar lugares próximos a você'
                                    : 'Para encontrar lugares incríveis próximos a você'}
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

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>💕 Roteiro Surpresa 💕</Text>
                        <Text style={styles.footerSubtext}>
                            Criando memórias inesquecíveis para casais ✨
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
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
        paddingBottom: spacing.xxxl,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.xxxl + 20,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    headerTitle: {
        fontSize: typography.fontSize.title,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    headerSubtitle: {
        fontSize: typography.fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    highlight: {
        color: colors.primary,
        fontWeight: '600',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
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
    filterButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.sm,
    },
    filterButtonText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
    },
    advancedFiltersContainer: {
        backgroundColor: '#FEFAFC',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        borderStyle: 'dashed',
    },
    facilitiesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    surpriseButton: {
        backgroundColor: '#FFF0F5',
        borderRadius: borderRadius.full,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    surpriseButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    surpriseButtonLoading: {
        backgroundColor: '#FFE4EC',
    },
    surpriseButtonText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.md,
    },
    surpriseButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    loadingText: {
        color: colors.primary,
        fontSize: typography.fontSize.md,
    },
    helperText: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
        marginTop: spacing.sm,
    },
    // Estilos para resultados
    placeCard: {
        backgroundColor: '#FEFAFC',
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    placeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    placeName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    placeRating: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    placeDescription: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    placeAddress: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    placeActivity: {
        fontSize: typography.fontSize.sm,
        color: colors.primary,
        marginTop: spacing.sm,
        fontStyle: 'italic',
    },
    placeTip: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        backgroundColor: '#FFF8DC',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
    },
    placeTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    placeTag: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    placeTagText: {
        fontSize: typography.fontSize.xs,
        color: '#2E7D32',
    },
    placeHours: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    romanticTip: {
        backgroundColor: '#FFF0F5',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    romanticTipTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    romanticTipText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    specialTipBox: {
        backgroundColor: '#FFF8DC',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: '#F5A623',
    },
    specialTipTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: '#F5A623',
        marginBottom: spacing.xs,
    },
    specialTipText: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    mapButtonText: {
        color: colors.primary,
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
    },
    newSearchButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    newSearchButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    // Estilos para erro
    errorContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    errorText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    retryButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    // Estilos de localização
    locationSection: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    locationIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E3F2FD',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    locationEmoji: {
        fontSize: 32,
    },
    locationTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    locationSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    locationButtonContainer: {
        width: '100%',
        paddingHorizontal: spacing.lg,
    },
    howItWorks: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    howItWorksTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    featuresContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.medium,
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
        backgroundColor: '#FFF0F5',
        marginTop: spacing.lg,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
    },
    footerText: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.primary,
    },
    footerSubtext: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});
