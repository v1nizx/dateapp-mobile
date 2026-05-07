# 💕 Roteiro Surpresa - Mobile App

Aplicativo mobile para casais descobrirem experiências românticas únicas em São Luís/MA, usando inteligência artificial para recomendações personalizadas e precisas.

![React Native](https://img.shields.io/badge/React_Native-0.81-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![Firebase](https://img.shields.io/badge/Firebase-10-orange)
![Groq AI](https://img.shields.io/badge/Groq-llama--3.3--70b-green)

## ✨ Funcionalidades

- 🎯 **Filtros personalizados** — Orçamento, tipo de experiência, período do dia
- 🎵 **Filtros avançados** — Clima (íntimo/animado/tranquilo), distância, acessibilidade, estacionamento
- 🤖 **IA Groq (llama-3.3-70b)** — Recomendações inteligentes de lugares reais, com endereços e coordenadas verificadas
- 📍 **Geolocalização** — Encontra lugares próximos a você
- 🗺️ **Abertura de mapas** — Link direto para Google Maps ou Apple Maps com coordenadas exatas

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native 0.81 | Framework mobile |
| Expo 54 | Plataforma de desenvolvimento |
| TypeScript | Tipagem estática |
| Firebase 10 | Infraestrutura (Auth, Firestore — expansão futura) |
| Groq AI — llama-3.3-70b | Recomendações via IA (gratuito) |
| expo-location | Geolocalização nativa |
| expo-linear-gradient | Gradientes visuais |

## 🚀 Instalação

> **Requisito:** Node.js 20+. Se usar nvm, rode `nvm use 20` antes.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dateapp-mobile.git
cd dateapp-mobile

# Instale as dependências
npm install

# Inicie o app
npm start
```

Se tiver o erro `configs.toReversed is not a function`, você está usando Node 18. Corrija com:

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 20 && npm start
```

Para não repetir isso, defina o Node 20 como padrão:

```bash
nvm alias default 20
```

## ⚙️ Configuração

Edite `src/config/env.ts`:

```typescript
export const ENV = {
    // Firebase (já configurado)
    FIREBASE_API_KEY: '...',
    FIREBASE_AUTH_DOMAIN: '...',
    FIREBASE_PROJECT_ID: '...',
    FIREBASE_STORAGE_BUCKET: '...',
    FIREBASE_MESSAGING_SENDER_ID: '...',
    FIREBASE_APP_ID: '...',
    FIREBASE_MEASUREMENT_ID: '...',

    // Groq AI — gratuito em: https://console.groq.com/keys
    GROQ_API_KEY: 'sua-chave-groq',
};
```

> **Por que Groq no app?** O Firebase Spark (plano gratuito) não permite que Cloud Functions
> façam chamadas HTTP externas. A chave Groq fica no app por ora.
> Para produção com muitos usuários, migre para o plano Blaze e mova a chave para uma Cloud Function.

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ChipButton.tsx   # Chip de seleção
│   ├── FacilityChip.tsx # Chip de facilidades (estacionamento, acessível)
│   ├── FeatureItem.tsx  # Item de feature na seção "Como funciona"
│   ├── PrimaryButton.tsx
│   └── SectionCard.tsx  # Card de seção
├── config/
│   └── env.ts           # Firebase config + chave Groq AI
├── hooks/
│   └── useRecommendations.ts  # Hook de estado para busca de lugares
├── lib/
│   └── firebase.ts      # Inicialização do Firebase
├── screens/
│   └── HomeScreen.tsx   # Tela principal
├── services/
│   └── placeService.ts  # Integração Groq AI + geolocalização
├── styles/
│   └── theme.ts         # Design system (cores, espaçamentos, tipografia)
└── types/
    └── place.ts         # Tipos TypeScript
```

## 🤖 Como funciona a IA

O `placeService.ts` monta um prompt estruturado com os filtros do usuário e chama o modelo `llama-3.3-70b-versatile` via API Groq. O prompt inclui:

- Critérios de orçamento, tipo, período e distância
- **Regras estritas de endereço** — proíbe ruas com nome do estabelecimento, exige vias reais verificáveis no Google Maps
- Solicitação de coordenadas lat/lon por lugar para abertura precisa no mapa
- `response_format: json_object` para garantir saída JSON sempre válida

## 📱 Scripts

```bash
npm start          # Inicia o Expo (requer Node 20+)
npm run android    # Abre no Android
npm run ios        # Abre no iOS
npm run web        # Abre no navegador
```

## 📄 Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.

---

Feito com 💕 para casais apaixonados
