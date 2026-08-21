#!/usr/bin/env bash
# ==============================================================================
# Script de Configuração de EAS Secrets e Environment Variables
# Date App Mobile (Expo SDK 54 / EAS CLI)
# ==============================================================================
# Este script auxilia na criação segura de segredos e variáveis no Expo Application
# Services (EAS) sem expor chaves no código-fonte ou no eas.json.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}    DateApp Mobile - Configuração de EAS Secrets   ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Verificar se EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}[!] EAS CLI não encontrado globalmente. Usando npx eas-cli...${NC}"
    EAS_CMD="npx eas-cli"
else
    EAS_CMD="eas"
fi

ENV_FILE=".env"

# Permitir passagem de arquivo .env customizado
if [ -n "$1" ]; then
    ENV_FILE="$1"
fi

echo -e "${GREEN}[+] Utilizando arquivo de referência:${NC} $ENV_FILE"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}[!] Arquivo $ENV_FILE não encontrado.${NC}"
    echo -e "Você pode criar os segredos manualmente ou criar um arquivo .env baseado no .env.example."
    echo -e "Exemplo: cp .env.example .env\n"
fi

echo -e "${BLUE}Escolha o método de envio:${NC}"
echo "1) EAS Environment Variables (Recomendado EAS moderno - eas env:create)"
echo "2) EAS Secrets (Legado - eas secret:create)"
echo "3) Apenas exibir os comandos para copiar e colar"
echo "4) Sair"
read -p "Opção [1-4]: " OPCAO

create_eas_secret() {
    local name="$1"
    local value="$2"
    local scope="${3:-project}"
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}[SKIP] Variável $name está vazia. Pulando...${NC}"
        return
    fi

    echo -e "${GREEN}[+] Criando EAS Secret:${NC} $name"
    $EAS_CMD secret:create --scope "$scope" --name "$name" --value "$value" --type string --non-interactive || {
        echo -e "${YELLOW}[!] Secret $name já existe ou houve erro ao atualizar.${NC}"
    }
}

create_eas_env() {
    local name="$1"
    local value="$2"
    local environment="${3:-production}"
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}[SKIP] Variável $name está vazia. Pulando...${NC}"
        return
    fi

    echo -e "${GREEN}[+] Criando EAS Environment Variable ($environment):${NC} $name"
    $EAS_CMD env:create "$environment" --name "$name" --value "$value" --visibility secret --force --non-interactive --scope project || {
        echo -e "${YELLOW}[!] Falha ao criar/atualizar a variável $name no ambiente $environment.${NC}"
    }
}

# Lista padrão de variáveis críticas do DateApp
VARS=(
    "EXPO_PUBLIC_OPENROUTER_API_KEY"
    "EXPO_PUBLIC_GEOAPIFY_KEY"
    "EXPO_PUBLIC_FIREBASE_API_KEY"
    "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "EXPO_PUBLIC_FIREBASE_PROJECT_ID"
    "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "EXPO_PUBLIC_FIREBASE_APP_ID"
    "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID"
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
    "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
    "EXPO_PUBLIC_ADMOB_ANDROID_APP_ID"
    "EXPO_PUBLIC_ADMOB_IOS_APP_ID"
    "EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID"
    "EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID"
)

case "$OPCAO" in
    1)
        echo -e "\n${BLUE}Qual ambiente deseja configurar?${NC}"
        echo "a) production"
        echo "b) preview"
        echo "c) development"
        echo "d) todos (production, preview e development)"
        read -p "Opção [a/b/c/d]: " ENV_OPT

        ENV_LIST=()
        case "$ENV_OPT" in
            a) ENV_LIST=("production") ;;
            b) ENV_LIST=("preview") ;;
            c) ENV_LIST=("development") ;;
            d) ENV_LIST=("production" "preview" "development") ;;
            *) echo "Opção inválida"; exit 1 ;;
        esac

        if [ -f "$ENV_FILE" ]; then
            for env_target in "${ENV_LIST[@]}"; do
                echo -e "\n${BLUE}=== Configurando ambiente: $env_target ===${NC}"
                for var in "${VARS[@]}"; do
                    val=$(grep -E "^${var}=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
                    if [ -n "$val" ]; then
                        create_eas_env "$var" "$val" "$env_target"
                    fi
                done
            done
        else
            echo -e "${RED}[X] Arquivo $ENV_FILE não encontrado para leitura automática.${NC}"
        fi
        ;;
    2)
        if [ -f "$ENV_FILE" ]; then
            for var in "${VARS[@]}"; do
                val=$(grep -E "^${var}=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
                if [ -n "$val" ]; then
                    create_eas_secret "$var" "$val" "project"
                fi
            done
        else
            echo -e "${RED}[X] Arquivo $ENV_FILE não encontrado para leitura automática.${NC}"
        fi
        ;;
    3)
        echo -e "\n${BLUE}================ Comandos Manuais (EAS CLI) ================${NC}\n"
        echo -e "${GREEN}# --- EAS Environment Variables (SDK 50+ / Recomendado) ---${NC}"
        for var in "${VARS[@]}"; do
            echo "eas env:create production --name $var --value \"<SEU_VALOR>\" --visibility secret --force"
            echo "eas env:create preview --name $var --value \"<SEU_VALOR>\" --visibility secret --force"
            echo "eas env:create development --name $var --value \"<SEU_VALOR>\" --visibility secret --force"
        done
        echo -e "\n${GREEN}# --- EAS Secrets (Global do Projeto) ---${NC}"
        for var in "${VARS[@]}"; do
            echo "eas secret:create --scope project --name $var --value \"<SEU_VALOR>\" --type string"
        done
        ;;
    4)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo "Opção inválida."
        exit 1
        ;;
esac

echo -e "\n${GREEN}✔ Concluído!${NC}"
