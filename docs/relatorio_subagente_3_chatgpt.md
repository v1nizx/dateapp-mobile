# 📋 Relatório de Auditoria Técnica: Google Sign-In (SHA-1/SHA-256), Testes Estáticos e Estabilidade

> **Data:** 21 de Agosto de 2026  
> **Subagente:** Subagente 3 (Abordagem ChatGPT - SHA-1 Google Sign-In & Testes Finais)  
> **Projeto:** DateApp Mobile (`com.dateapp.mobile`) — React Native / Expo SDK 54  

---

## 🎯 1. Sumário Executivo

Este relatório apresenta a auditoria aprofundada da infraestrutura de autenticação Google Sign-In, verificação de tipagem estática (TypeScript), análise de estabilidade em runtime e guia completo de configuração de impressões digitais de certificados (SHA-1 e SHA-256) nos consoles do **Firebase** e **Google Cloud Platform**.

### 🌟 Principais Realizações e Status:
- ✅ **Auditoria de Tipos (TypeScript):** `npx tsc --noEmit` executado com **0 erros** após exclusão correta de diretórios de templates no `tsconfig.json` e tipagem estrita de `Auth` no `src/config/firebase.ts`.
- ✅ **Auditoria do Google Sign-In:** Mapeamento completo do fluxo OAuth (`expo-auth-session` + `firebase/auth` + `google-services.json`).
- ✅ **Guia de SHA-1/SHA-256:** Instruções e comandos prontos para os 3 ambientes essenciais (Debug Local, EAS Build, Google Play Store).
- ✅ **Script Automatizado:** Criação de `scripts/get-sha-fingerprints.sh` para extração ágil de hashes.

---

## 🔐 2. Análise da Implementação do Google Sign-In

### 2.1. Arquitetura Atual no Código

O projeto implementa autenticação OAuth 2.0 com Google integrada ao Firebase Authentication:

```
[ Usuário clica em 'Entrar com Google' ]
                     │
                     ▼
       [ expo-auth-session / Google ]
         • Abre navegador / Custom Tab nativa
         • Autentica conta Google
         • Retorna id_token JWT
                     │
                     ▼
          [ GoogleAuthProvider ]
         • GoogleAuthProvider.credential(id_token)
                     │
                     ▼
      [ signInWithCredential(auth, cred) ]
         • Firebase valida assinatura com Google
         • Cria/recupera sessão do usuário
         • Dispara onAuthStateChanged (AuthContext)
                     │
                     ▼
             [ Navega para Home ]
```

### 2.2. Componentes e Arquivos Analisados

| Arquivo | Função / Configuração | Status |
| :--- | :--- | :--- |
| `src/screens/LoginScreen.tsx` | Utiliza `Google.useIdTokenAuthRequest` com `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`. Trata id_token via `signInWithCredential`. | ✅ Implementado com loading e banners de erro amigáveis |
| `src/config/firebase.ts` | Inicialização única com persistência local via `AsyncStorage` (`getReactNativePersistence`). | ✅ Corrigido e estritamente tipado (`Auth`) |
| `app.config.js` | `package: 'com.dateapp.mobile'`, `googleServicesFile: './google-services.json'`. | ✅ Vinculado corretamente |
| `google-services.json` | Contém `mobilesdk_app_id`, `oauth_client` tipo 1 (Android) com hash `92454fee40e080c5f14b3e5b2fd60d4a4f1142eb`, e tipo 3 (Web client). | ✅ Configurado |

### 2.3. Diferença entre as Abordagens (Expo Auth Session vs Google Signin Nativo)

- **Abordagem Atual (`expo-auth-session`):**
  - **Vantagens:** Funciona de forma consistente em Expo Go e builds EAS sem necessidade de compilar código nativo extra ou bridges C++; utiliza fluxo seguro PKCE/OpenID Connect.
  - **Requisito Obrigatório:** O Web Client ID (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`) gerado no Google Cloud / Firebase **deve ser o mesmo** fornecido para o backend do Firebase Auth.
- **Abordagem com `@react-native-google-signin/google-signin` (instalado no `package.json`):**
  - Utiliza o diálogo nativo do Google Play Services no Android (One Tap Sign-in).
  - Requer compilação com Development Client (`npx expo run:android` ou EAS Build) e registro rigoroso do SHA-1 de cada keystore.

---

## 🛠️ 3. Guia Definitivo: Extração e Cadastro de SHA-1 e SHA-256

Para que o Google Sign-In funcione sem o erro `DEVELOPER_ERROR` (código 10) ou falhas de validação de token no Android, **todos os 3 certificados** devem ser cadastrados.

```
                  ┌──────────────────────────────────────────────┐
                  │          Consoles do Google / Firebase        │
                  │   1. Firebase Console (Configurações App)    │
                  │   2. Google Cloud Console (OAuth 2.0 Clients)│
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
      [ 1. Debug Local ]       [ 2. EAS Build (Expo) ]   [ 3. Google Play Store ]
        ~/.android/debug.keystore   eas credentials        Play App Signing Key
```

---

### 3.1. Keystore de Desenvolvimento / Debug Local

Usado ao rodar o aplicativo conectado via USB ou emulador Android local (`npx expo run:android`).

#### Passo a Passo:
1. Execute no terminal:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
2. *(Caso a keystore ainda não exista)*, crie uma executando:
   ```bash
   mkdir -p ~/.android
   keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
   ```
3. Localize as linhas:
   - **SHA1:** `XX:XX:XX:XX:XX:XX:...`
   - **SHA256:** `YY:YY:YY:YY:YY:YY:...`

---

### 3.2. Keystore do EAS Build (Expo Application Services)

Usado quando você compila via `eas build --platform android --profile preview` ou `production`.

#### Opção A — Via EAS CLI:
Execute:
```bash
npx eas-cli credentials -p android
```
1. Selecione o ambiente (`production` ou `preview`).
2. Selecione **Keystore: Manage everything related to your Android Keystore**.
3. Escolha **View Android Keystore**.
4. Copie os valores exibidos em **SHA-1 Fingerprint** e **SHA-256 Fingerprint**.

#### Opção B — Via Dashboard Web da Expo:
1. Acesse [https://expo.dev](https://expo.dev).
2. Navegue até o seu projeto **date-app-mobile** → **Credentials** → **Android**.
3. Copie o **SHA-1** e **SHA-256** da Application Signing Keystore.

---

### 3.3. App Signing Key do Google Play Console (Produção)

Quando você publica um `.aab` (Android App Bundle) na Google Play Store, o Google Play assina o APK final distribuído aos usuários com sua própria chave interna (**Google Play App Signing**).

#### Passo a Passo:
1. Acesse o [Google Play Console](https://play.google.com/console).
2. Selecione o app **DateApp Mobile**.
3. No menu lateral esquerdo, vá em:
   **Versão** (ou Configuração) ➔ **Integridade do app** (App Integrity).
4. Na aba **Assinatura de apps do Google Play** (Play App Signing), localize o bloco:
   - **Certificado da chave de assinatura do app** (*App signing key certificate*).
5. Copie os campos:
   - **Impressão digital do certificado SHA-1**
   - **Impressão digital do certificado SHA-256**

> ⚠️ **ATENÇÃO CRÍTICA:** Não confunda a "Chave de upload" (*Upload key certificate*) com a "Chave de assinatura do app" (*App signing key certificate*). É a **Chave de assinatura do app** que assina os binários baixados pelos usuários finais da loja!

---

### 3.4. Onde Cadastrar no Firebase e Google Cloud

#### No Firebase Console:
1. Acesse [Firebase Console](https://console.firebase.google.com) ➔ Projeto `dateapp-mobile`.
2. Clique no ícone de engrenagem ⚙️ ➔ **Configurações do projeto** (Project Settings).
3. Na aba **Geral**, role até a seção **Seus aplicativos** e selecione o app Android (`com.dateapp.mobile`).
4. Clique em **Adicionar impressão digital** (*Add fingerprint*).
5. Cole cada um dos hashes:
   - SHA-1 do Debug Local
   - SHA-1 do EAS Build
   - SHA-1 do Google Play App Signing
   - *(Recomendado)* SHA-256 de cada um.
6. **IMPORTANTE:** Após salvar todas as impressões digitais, clique no botão **Fazer download de google-services.json** e substitua o arquivo `./google-services.json` na raiz do projeto!

#### No Google Cloud Console:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/apis/credentials) com o projeto `dateapp-mobile` selecionado.
2. Na lista **IDs do cliente OAuth 2.0**, você verá o tipo Web e o tipo Android.
3. Garanta que o Client ID Android esteja vinculado ao pacote `com.dateapp.mobile` e ao SHA-1 correspondente.
4. Garanta que a **Tela de consentimento OAuth** (*OAuth consent screen*) esteja com status "Em produção" ou que os e-mails dos testadores estejam na lista de usuários de teste.

---

## 🧪 4. Auditoria de Código e Testes Estáticos

### 4.1. Verificação TypeScript (`npx tsc --noEmit`)

Executamos a checagem completa do compilador TypeScript:

```bash
$ npx tsc --noEmit
# Exit code: 0 (Sucesso absoluto)
```

#### Correções Realizadas durante a Auditoria:
1. **`tsconfig.json`:**
   - Adicionado `"plugins"` à lista de exclusão do `tsconfig.json` para evitar que arquivos de exemplo de ferramentas externas interfiram na compilação do bundle do aplicativo móvel.
2. **`src/config/firebase.ts`:**
   - Tipagem explícita da variável `auth: Auth` importada de `firebase/auth`.
   - Tratamento de importação de `getReactNativePersistence` compatível com o ecossistema React Native / Expo SDK 54.

---

### 4.2. Auditoria de Runtime e Prevenção de Falhas (Crash Analysis)

| Área / Módulo | Verificação Realizada | Mitigação / Resiliência |
| :--- | :--- | :--- |
| **Persistência de Sessão** | `initializeAuth` com `AsyncStorage` | Protegido com bloco `try/catch` para recuperar `getAuth(app)` em cenários de Fast Refresh / Hot Reloading sem crashar o app. |
| **AdMob Banner** | `src/components/AdBanner.tsx` | Importação dinâmica (`require`) protegida por `try/catch`. Não quebra no Expo Go nem em dispositivos sem Google Mobile Ads SDK. |
| **Geolocalização** | `src/services/placeService.ts` | Tratamento de permissão negada com coordenadas padrão de fallback (São Luís / MA) e detecção robusta de timeouts. |
| **OpenRouter / IA** | `src/services/placeService.ts` | Validação e sanitização de JSON retornado pela IA com âncoras geográficas para prevenir alucinações de locais inexistentes. |
| **Navegação e Rotas** | `src/navigation/RootNavigator.tsx` | Todas as rotas tipadas em `RootStackParamList` (`Welcome`, `Login`, `Register`, `Home`, `Planos`, `Perfil`). |

---

## 📋 5. Checklist de Verificação Pré-Deploy

- [x] TypeScript passando com 0 erros (`npx tsc --noEmit`).
- [x] Arquivo `google-services.json` presente e mapeado no `app.config.js`.
- [x] Package name consistente (`com.dateapp.mobile`) em todas as configurações.
- [x] Script `scripts/get-sha-fingerprints.sh` disponível e executável.
- [ ] Cadastrar SHA-1 do EAS Build no Firebase Console.
- [ ] Cadastrar SHA-1 do Google Play Console (quando disponível no upload inicial).
- [ ] Baixar a versão mais recente do `google-services.json` após cadastrar todos os SHA-1.
- [ ] Configurar as variáveis no EAS com `./scripts/setup-eas-secrets.sh` ou `eas env:create`.

---

## 🚀 6. Conclusão

O projeto **DateApp Mobile** encontra-se em estado técnico maduro, com código TypeScript limpo, livre de erros de compilação e com fluxo de autenticação pronto para builds de homologação (preview) e produção na Google Play Store.

