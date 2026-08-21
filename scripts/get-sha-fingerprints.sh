#!/usr/bin/env bash
# ==============================================================================
# Script de Extração de Impressões Digitais SHA-1 e SHA-256 (DateApp Mobile)
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}   DateApp Mobile - Extrator de SHA-1 / SHA-256       ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo ""

# 1. Checagem do Keystore de Debug Local
DEBUG_KEYSTORE="$HOME/.android/debug.keystore"
echo -e "${YELLOW}🔍 1. Verificando Keystore Local de Debug (${DEBUG_KEYSTORE})...${NC}"

if [ -f "$DEBUG_KEYSTORE" ]; then
    echo -e "${GREEN}✅ Keystore local encontrada! Extraindo certificados...${NC}"
    echo ""
    keytool -list -v -keystore "$DEBUG_KEYSTORE" -alias androiddebugkey -storepass android -keypass android | grep -E "SHA1|SHA256|MD5" || true
    echo ""
else
    echo -e "${YELLOW}⚠️ Keystore de debug local não encontrada em ${DEBUG_KEYSTORE}.${NC}"
    echo -e "   Para gerar uma keystore de debug padrão local, você pode rodar:"
    echo -e "   mkdir -p ~/.android && keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname \"CN=Android Debug,O=Android,C=US\""
    echo ""
fi

# 2. Instruções para EAS Build (Expo Application Services)
echo -e "${YELLOW}☁️ 2. Impressões Digitais do EAS Build (Keystore Remota)...${NC}"
echo -e "Para obter as credenciais e hashes SHA-1 / SHA-256 do EAS:"
echo -e "   ${CYAN}npx eas-cli credentials -p android${NC}"
echo -e "Ou acesse o painel web:"
echo -e "   ${CYAN}https://expo.dev/accounts/[sua-conta]/projects/date-app-mobile/credentials${NC}"
echo ""

# 3. Instruções para Google Play Console
echo -e "${YELLOW}📱 3. Impressões Digitais do Google Play Console (Produção)...${NC}"
echo -e "Quando o Google Play App Signing estiver ativo:"
echo -e "   1. Acesse: ${CYAN}https://play.google.com/console${NC}"
echo -e "   2. Selecione o app: DateApp Mobile"
echo -e "   3. Vá em: ${CYAN}Configuração -> Integridade do app -> Assinatura de apps do Google Play${NC}"
echo -e "   4. Copie o ${GREEN}SHA-1${NC} e o ${GREEN}SHA-256${NC} da 'Chave de assinatura do app'."
echo ""

# 4. Hash atual configurado no google-services.json
if [ -f "./google-services.json" ]; then
    echo -e "${YELLOW}📄 4. Hash atualmente registrado em google-services.json:${NC}"
    grep -o '"certificate_hash": "[^"]*"' ./google-services.json || true
    echo ""
fi

echo -e "${GREEN}✨ Finalizado! Cadastre todos os hashes SHA-1 e SHA-256 no Firebase Console e Google Cloud Console.${NC}"
