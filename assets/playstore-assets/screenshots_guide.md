# 📱 Guia e Especificações de Screenshots — Google Play Store (DateApp)

Este documento detalha as especificações técnicas, boas práticas de ASO (App Store Optimization), dimensões exigidas pelo Google Play Console e a narrativa visual estruturada para as capturas de tela do **DateApp**.

---

## 🎯 1. Requisitos Técnicos do Google Play Console

| Parâmetro | Especificação Google Play | Implementação DateApp |
| :--- | :--- | :--- |
| **Quantidade Mínima** | 2 capturas de tela por formato | 6 capturas verticais estruturadas |
| **Quantidade Máxima** | 8 capturas por tipo de dispositivo | 6 telas otimizadas para Phone |
| **Formato de Arquivo** | JPEG ou PNG de 24/32 bits sem alfa | PNG 24-bit de alta definição |
| **Dimensões Mínimas** | Mínimo 320 px no lado menor | 1080 x 2400 px (Proporção 20:9 moderna) |
| **Dimensões Máximas** | Máximo 3840 px no lado maior | 1080 x 2400 px |
| **Proporções Aceitas** | 16:9, 9:16, 2:1, 18:9, 19.5:9, 20:9 | 20:9 (Formato padrão de smartphones Android modernos) |
| **Tamanho Máximo** | Até 8 MB por arquivo | ~400 KB - 800 KB por imagem |

---

## 🎨 2. Estrutura e Narrativa Visual dos Screenshots

As capturas de tela foram criadas seguindo o padrão de **Framed Screenshots com Marketing Header (Headline + Tag de Benefício)**, que aumentam a taxa de conversão (CVR) em até **35%** em comparação com capturas de tela brutas.

### 🖼️ Sequência Estratégica das Imagens (`playstore-assets/screenshots/`):

```
playstore-assets/screenshots/
├── screenshot_01_home.png              # [01] Abertura & Gancho Principal
├── screenshot_02_filtros.png           # [02] Personalização de Orçamento & Estilo
├── screenshot_03_filtros_avancados.png  # [03] Filtros de Vibe, Distância e Conforto
├── screenshot_04_resultado.png         # [04] Prova de Valor: Lugares Reais com IA
├── screenshot_05_planos.png            # [05] Planos & Flexibilidade
└── screenshot_06_perfil.png            # [06] Segurança, Histórico & Privacidade
```

---

## 📋 3. Detalhamento de Cada Screenshot

### Screenshot 01: Abertura & Gancho
- **Arquivo:** `screenshot_01_home.png`
- **Tag:** `INTELIGÊNCIA ARTIFICIAL`
- **Headline Principal:** *Crie o Date Perfeito*
- **Subtítulo:** *Roteiros sob medida para o seu momento*
- **Objetivo ASO:** Capturar a atenção do usuário nos primeiros 3 segundos da busca, comunicando a proposta de valor essencial.

### Screenshot 02: Personalização de Orçamento & Estilo
- **Arquivo:** `screenshot_02_filtros.png`
- **Tag:** `TOTALMENTE PERSONALIZADO`
- **Headline Principal:** *Filtre por Orçamento & Estilo*
- **Subtítulo:** *De bares descontraídos a jantares sofisticados*
- **Objetivo ASO:** Mostrar a versatilidade do app para qualquer bolso ($, $$, $$$) e ocasiões variadas (gastronomia, cultura, ar livre, aventura).

### Screenshot 03: Vibe & Detalhes Especiais
- **Arquivo:** `screenshot_03_filtros_avancados.png`
- **Tag:** `DETALHES QUE IMPORTAM`
- **Headline Principal:** *Vibe, Distância & Conforto*
- **Subtítulo:** *Escolha o clima ideal, acessibilidade e estacionamento*
- **Objetivo ASO:** Destacar a granularidade inteligente (clima íntimo, animado ou tranquilo, estacionamento e acessibilidade).

### Screenshot 04: Entrega de Recomendações
- **Arquivo:** `screenshot_04_resultado.png`
- **Tag:** `LUGARES REAIS & VERIFICADOS`
- **Headline Principal:** *Recomendações Detalhadas*
- **Subtítulo:** *Preços médios, avaliações e detalhes exclusivos*
- **Objetivo ASO:** Gerar confiança mostrando cards ricos com endereços reais, descrição detalhada e botão de rota direta.

### Screenshot 05: Planos e Benefícios
- **Arquivo:** `screenshot_05_planos.png`
- **Tag:** `PLANOS ACESSÍVEIS`
- **Headline Principal:** *Experiência Completa & Sem Limites*
- **Subtítulo:** *Mais roteiros e recursos premium para o casal*
- **Objetivo ASO:** Transparência de monetização e opções para usuários gratuitos e assinantes.

### Screenshot 06: Perfil & Confiança
- **Arquivo:** `screenshot_06_perfil.png`
- **Tag:** `SUA CONTA SEGURA`
- **Headline Principal:** *Histórico & Preferências*
- **Subtítulo:** *Acesse seus dados e salve seus roteiros favoritos*
- **Objetivo ASO:** Transmitir segurança, conformidade com LGPD e facilidade de login com Google.

---

## 🛠️ 4. Como Regenerar os Screenshots

Para atualizar os layouts ou aplicar novos títulos/telas:
```bash
python3 playstore-assets/generate_assets.py
```
O script lê as telas originais em `assets/screenshots/` e recompõe os frames em 1080x2400 px automaticamente.
