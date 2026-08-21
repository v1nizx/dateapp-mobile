# 🔐 Guia de Configuração de Segredos e Variáveis no EAS (Expo Application Services)

Este documento detalha o procedimento seguro para gerenciamento de chaves de API, credenciais do Firebase, AdMob, Google OAuth e serviços de IA (OpenRouter) no **DateApp Mobile**, garantindo conformidade com as diretrizes de segurança e evitando o vazamento de chaves no repositório Git ou no arquivo `eas.json`.

---

## 📌 1. Visão Geral da Arquitetura de Segredos

No Expo SDK 54 com EAS Build:
- As variáveis públicas prefixadas com `EXPO_PUBLIC_` são embutidas em tempo de bundle do JavaScript na compilação do aplicativo móvel.
- Chaves de API sensíveis **NUNCA** devem ser commitadas no repositório Git ou inseridas em texto puro no arquivo `eas.json`.
- O EAS disponibiliza dois mecanismos oficiais:
  1. **EAS Environment Variables** (`eas env:create` / EAS Dashboard): Recomendado para projetos modernos (SDK 50+), permitindo segmentação por ambiente (`development`, `preview`, `production`) e visibilidade `secret` ou `plaintext`.
  2. **EAS Secrets** (`eas secret:create`): Modelo legado global em nível de projeto ou conta.

---

## 🛠️ 2. Lista de Variáveis do DateApp

| Variável | Descrição | Onde Obter |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_OPENROUTER_API_KEY` | Chave de acesso à API OpenRouter (Llama 3.3 70B) | [OpenRouter Keys](https://openrouter.ai/keys) |
| `EXPO_PUBLIC_GEOAPIFY_KEY` | Chave de busca de estabelecimentos e locais | [Geoapify Projects](https://myprojects.geoapify.com) |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Chave de API do projeto Firebase | Console Firebase → Project Settings |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação Firebase (`<proj>.firebaseapp.com`) | Console Firebase |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID do projeto Firebase | Console Firebase |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de armazenamento do Cloud Storage | Console Firebase |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID de remetente FCM | Console Firebase |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID Firebase Android/iOS | Console Firebase |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | ID de Analytics/Measurement (opcional) | Console Firebase |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Web Client ID para Google Sign-In | Google Cloud Console → APIs & Services |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Android Client ID (com SHA-1 do EAS/Play Store) | Google Cloud Console |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | iOS Client ID para login Google | Google Cloud Console |
| `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` | ID do Aplicativo AdMob Android | Google AdMob Console |
| `EXPO_PUBLIC_ADMOB_IOS_APP_ID` | ID do Aplicativo AdMob iOS | Google AdMob Console |
| `EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID` | ID do bloco de anúncio Banner | Google AdMob Console |
| `EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID`| ID do bloco de anúncio Interstitial | Google AdMob Console |

---

## 🚀 3. Configuração Automática via Script

Um script interativo foi disponibilizado em `scripts/setup-eas-secrets.sh`.

### Passo a Passo:
1. Copie e preencha seu arquivo local `.env`:
   ```bash
   cp .env.example .env
   # Edite o .env com os valores reais
   ```

2. Execute o script:
   ```bash
   ./scripts/setup-eas-secrets.sh
   ```

3. Escolha a opção desejada:
   - **Opção 1**: Cria e vincula automaticamente as variáveis aos ambientes `production`, `preview` ou `development`.
   - **Opção 2**: Cria segredos globais de projeto (`eas secret:create`).
   - **Opção 3**: Imprime a lista pronta de comandos para copiar e colar individualmente.

---

## 💻 4. Comandos Manuais (EAS CLI)

### 4.1. Configuração por Ambiente (`eas env:create`) - *Recomendado*

#### Ambiente de Produção (`production`):
```bash
eas env:create production --variable-name EXPO_PUBLIC_OPENROUTER_API_KEY --value "sk-or-v1-sua-chave-aqui" --visibility secret
eas env:create production --variable-name EXPO_PUBLIC_GEOAPIFY_KEY --value "sua-chave-geoapify" --visibility secret
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_API_KEY --value "sua-chave-firebase" --visibility secret
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "seu-app.firebaseapp.com" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "seu-projeto-id" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "seu-app.appspot.com" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "seu-sender-id" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_FIREBASE_APP_ID --value "seu-app-id" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value "seu-web-client-id.apps.googleusercontent.com" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value "seu-android-client-id.apps.googleusercontent.com" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_ADMOB_ANDROID_APP_ID --value "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID --value "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" --visibility plaintext
eas env:create production --variable-name EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID --value "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX" --visibility plaintext
```

#### Ambiente de Homologação / Testes Internos (`preview`):
```bash
eas env:create preview --variable-name EXPO_PUBLIC_OPENROUTER_API_KEY --value "sk-or-v1-sua-chave-aqui" --visibility secret
eas env:create preview --variable-name EXPO_PUBLIC_GEOAPIFY_KEY --value "sua-chave-geoapify" --visibility secret
eas env:create preview --variable-name EXPO_PUBLIC_FIREBASE_API_KEY --value "sua-chave-firebase" --visibility secret
eas env:create preview --variable-name EXPO_PUBLIC_ADMOB_ANDROID_APP_ID --value "ca-app-pub-3940256099942544~3347511713" --visibility plaintext
eas env:create preview --variable-name EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID --value "ca-app-pub-3940256099942544/6300978111" --visibility plaintext
eas env:create preview --variable-name EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID --value "ca-app-pub-3940256099942544/1033173712" --visibility plaintext
```

#### Listar ou Deletar Variáveis:
```bash
# Listar variáveis do ambiente
eas env:list --environment production

# Deletar uma variável se necessário atualizar
eas env:delete production --variable-name EXPO_PUBLIC_OPENROUTER_API_KEY
```

---

### 4.2. Configuração via EAS Secrets Legado (`eas secret:create`)

Se optar pelo formato de segredos em escopo de projeto:
```bash
eas secret:create --scope project --name EXPO_PUBLIC_OPENROUTER_API_KEY --value "sk-or-v1-sua-chave-aqui" --type string
eas secret:create --scope project --name EXPO_PUBLIC_GEOAPIFY_KEY --value "sua-chave-geoapify" --type string
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "sua-chave-firebase" --type string
```

Listar segredos configurados:
```bash
eas secret:list
```

---

## 🔒 5. Estrutura Segura do `eas.json`

O arquivo `eas.json` contém apenas as diretivas de compilação e flags de ambiente não confidenciais:

```json
{
  "cli": {
    "version": ">= 13.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_VARIANT": "preview",
        "EAS_BUILD": "true"
      }
    },
    "production": {
      "channel": "production",
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "APP_VARIANT": "production",
        "EAS_BUILD": "true"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔍 6. Auditoria e Prevenção de Vazamentos

1. **GitHub Secret Scanning**: Certifique-se de que o repositório possua proteção contra commits com segredos.
2. **Rotação de Chaves**: Caso uma chave de API tenha sido previamente commitada no histórico Git, ela deve ser **imediatamente revogada e gerada novamente** nos painéis do OpenRouter, Geoapify e Firebase.
3. **Validação Pré-Build**: Antes de disparar uma build com `eas build --platform android --profile production`, confira se todas as variáveis necessárias estão listadas com `eas env:list --environment production`.
