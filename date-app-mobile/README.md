# 💕 Roteiro Surpresa - Mobile App

Aplicativo mobile para casais descobrirem experiências românticas únicas em São Luís/MA, usando inteligência artificial do Perplexity para recomendações personalizadas.

![React Native](https://img.shields.io/badge/React_Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-green)
![Perplexity AI](https://img.shields.io/badge/Perplexity-AI-purple)

## ✨ Funcionalidades

- 🎯 **Filtros personalizados** - Orçamento, tipo de experiência, período do dia
- 🎵 **Filtros avançados** - Ambiente (íntimo/animado/tranquilo), distância, acessibilidade
- 🤖 **IA Perplexity** - Recomendações inteligentes de lugares reais
- 📍 **Geolocalização** - Encontra lugares próximos a você
- 🗺️ **Integração com Mapas** - Abre Google Maps/Apple Maps diretamente

## 🚀 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dateapp-mobile.git

# Acesse a pasta do projeto
cd dateapp-mobile/date-app-mobile

# Instale as dependências
npm install

# Inicie o app
npm start
```

## ⚙️ Configuração

### 1. Supabase

Edite o arquivo `src/config/env.ts` com suas credenciais:

```typescript
export const ENV = {
  SUPABASE_URL: 'sua-url-do-supabase',
  SUPABASE_ANON_KEY: 'sua-chave-anonima',
};
```

### 2. Deploy da Edge Function

```bash
# Na pasta do projeto
supabase functions deploy perplexity-recommendations
```

### 3. Configurar Secret do Perplexity

No Supabase Dashboard:
1. Vá em **Edge Functions** → **perplexity-recommendations** → **Secrets**
2. Adicione: `PERPLEXITY_API_KEY` = `sua-chave-do-perplexity`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ChipButton.tsx
│   ├── FacilityChip.tsx
│   ├── FeatureItem.tsx
│   ├── PrimaryButton.tsx
│   └── SectionCard.tsx
├── config/              # Configurações
│   └── env.ts
├── hooks/               # React Hooks customizados
│   └── useRecommendations.ts
├── lib/                 # Bibliotecas/clients
│   └── supabase.ts
├── screens/             # Telas do app
│   └── HomeScreen.tsx
├── services/            # Serviços de API
│   └── placeService.ts
├── styles/              # Estilos e tema
│   └── theme.ts
├── supabase/            # Edge Functions
│   └── functions/
│       └── perplexity-recommendations/
└── types/               # Tipos TypeScript
    └── place.ts
```

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **Supabase** - Backend as a Service
- **Perplexity AI** - Inteligência artificial para recomendações
- **expo-location** - Geolocalização nativa
- **expo-linear-gradient** - Gradientes visuais

## 📱 Scripts

```bash
npm start      # Inicia o Expo
npm run android   # Abre no Android
npm run ios       # Abre no iOS
npm run web       # Abre no navegador
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

Feito com 💕 para casais apaixonados
