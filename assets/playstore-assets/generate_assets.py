#!/usr/bin/env python3
"""
DateApp - Google Play Store Asset Generator
Generates:
1. icon-512x512.png (512x512px High-Res Icon for Play Console)
2. feature-graphic-1024x500.png (1024x500px Feature Graphic)
3. feature-graphic-1024x500.svg (Vector source for Feature Graphic)
4. Play Store Screenshot mockups with marketing headlines
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, '..'))
ASSETS_DIR = os.path.join(PROJECT_ROOT, 'assets')
OUTPUT_DIR = BASE_DIR

# Fonts lookup
def get_font(name_hint="Ubuntu-B", size=32):
    font_paths = [
        f"/usr/share/fonts/truetype/ubuntu/{name_hint}.ttf",
        f"/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
        f"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        f"/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def generate_playstore_icon():
    print("[1/4] Generating Play Store Icon (512x512px)...")
    src_icon_path = os.path.join(ASSETS_DIR, 'icon.png')
    if not os.path.exists(src_icon_path):
        print(f"Error: {src_icon_path} not found.")
        return False
    
    icon_src = Image.open(src_icon_path).convert('RGBA')
    # Resample using LANCZOS
    resample_filter = getattr(Image, 'Resampling', Image).LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS
    icon_512 = icon_src.resize((512, 512), resample=resample_filter)
    
    out_path = os.path.join(OUTPUT_DIR, 'icon-512x512.png')
    icon_512.save(out_path, format='PNG', optimize=True)
    file_size_kb = os.path.getsize(out_path) / 1024
    print(f"  ✓ Saved {out_path} ({icon_512.size[0]}x{icon_512.size[1]}px, {file_size_kb:.1f} KB)")
    return True

def generate_feature_graphic_png():
    print("[2/4] Generating Feature Graphic PNG (1024x500px)...")
    width, height = 1024, 500
    fg = Image.new('RGBA', (width, height), (26, 8, 22, 255))
    draw = ImageDraw.Draw(fg)

    # 1. Background gradient (diagonal rich burgundy/magenta glow)
    for y in range(height):
        for x in range(width):
            nx = x / width
            ny = y / height
            r = int(24 + 40 * nx)
            g = int(6 + 10 * nx)
            b = int(22 + 25 * ny)
            draw.point((x, y), fill=(r, g, b, 255))

    # 2. Glowing atmospheric orbs
    glow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([width - 420, -50, width + 150, height + 50], fill=(255, 77, 148, 90))
    gdraw.ellipse([200, height - 180, 750, height + 200], fill=(185, 7, 96, 75))
    gdraw.ellipse([-100, -100, 350, 350], fill=(245, 220, 232, 35))
    glow = glow.filter(ImageFilter.GaussianBlur(65))
    fg = Image.alpha_composite(fg, glow)

    # 3. Floating Card / Mockup on the right
    card_w, card_h = 320, 380
    card_x, card_y = 640, 60
    
    # Shadow for floating card
    card_shadow = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    cs_draw = ImageDraw.Draw(card_shadow)
    cs_draw.rounded_rectangle([card_x, card_y + 15, card_x + card_w, card_y + card_h + 15], radius=28, fill=(0, 0, 0, 160))
    card_shadow = card_shadow.filter(ImageFilter.GaussianBlur(30))
    fg = Image.alpha_composite(fg, card_shadow)

    # Floating Card Body (Glassmorphism dark card with border)
    card_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    cl_draw = ImageDraw.Draw(card_layer)
    cl_draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=28, fill=(35, 18, 30, 230), outline=(255, 77, 148, 120), width=2)
    
    # Inside Floating Card: App Icon + Mini Preview Info
    src_icon_path = os.path.join(ASSETS_DIR, 'icon.png')
    if os.path.exists(src_icon_path):
        resample_filter = getattr(Image, 'Resampling', Image).LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS
        icon_src = Image.open(src_icon_path).convert('RGBA')
        mini_icon = icon_src.resize((84, 84), resample=resample_filter)
        
        mask = Image.new('L', (84, 84), 0)
        mdraw = ImageDraw.Draw(mask)
        mdraw.rounded_rectangle([0, 0, 84, 84], radius=20, fill=255)
        card_layer.paste(mini_icon, (card_x + 24, card_y + 24), mask)

    f_card_title = get_font("Ubuntu-B", 22)
    f_card_sub = get_font("Ubuntu-R", 14)
    f_badge = get_font("Ubuntu-B", 13)

    cl_draw.text((card_x + 120, card_y + 32), "DateApp", fill=(255, 255, 255, 255), font=f_card_title)
    cl_draw.text((card_x + 120, card_y + 62), "Roteiros com IA", fill=(255, 177, 199, 255), font=f_card_sub)

    # Mini recommendations pill inside card
    cl_draw.rounded_rectangle([card_x + 24, card_y + 130, card_x + card_w - 24, card_y + 185], radius=14, fill=(55, 25, 45, 220), outline=(185, 7, 96, 140), width=1)
    cl_draw.text((card_x + 36, card_y + 146), "Jantar Romântico a 2", fill=(255, 255, 255, 240), font=f_badge)

    cl_draw.rounded_rectangle([card_x + 24, card_y + 200, card_x + card_w - 24, card_y + 255], radius=14, fill=(55, 25, 45, 220), outline=(185, 7, 96, 140), width=1)
    cl_draw.text((card_x + 36, card_y + 216), "Pôr do Sol & Drinks", fill=(255, 255, 255, 240), font=f_badge)

    # Action button inside card
    cl_draw.rounded_rectangle([card_x + 24, card_y + 280, card_x + card_w - 24, card_y + 345], radius=16, fill=(185, 7, 96, 240))
    cl_draw.text((card_x + 44, card_y + 302), "Encontrar Meu Date", fill=(255, 255, 255, 255), font=f_badge)

    fg = Image.alpha_composite(fg, card_layer)
    draw = ImageDraw.Draw(fg)

    # 4. Left side Typography & Branding
    f_tag = get_font("Ubuntu-B", 15)
    f_title_main = get_font("Ubuntu-B", 50)
    f_subtitle = get_font("Ubuntu-M", 20)
    f_feature = get_font("Ubuntu-B", 15)

    # Pill Tag: "ROTEIROS COM IA"
    draw.rounded_rectangle([60, 55, 280, 92], radius=18, fill=(185, 7, 96, 200), outline=(255, 77, 148, 220), width=1)
    draw.text((80, 64), "ROTEIROS COM IA", fill=(255, 255, 255, 255), font=f_tag)

    # Main Headline
    draw.text((60, 115), "DateApp", fill=(255, 255, 255, 255), font=f_title_main)
    draw.text((60, 180), "Encontros inesquecíveis,\npersonalizados para você.", fill=(245, 220, 232, 255), font=f_subtitle)

    # 3 Feature Pills at Bottom Left
    features = [
        "Filtros por Orçamento & Vibe",
        "Sugestões Reais com IA",
        "Mapas & Rotas Diretas"
    ]
    pill_y = 310
    for feat in features:
        draw.rounded_rectangle([60, pill_y, 480, pill_y + 40], radius=12, fill=(45, 18, 38, 190), outline=(255, 77, 148, 80), width=1)
        draw.ellipse([78, pill_y + 14, 90, pill_y + 26], fill=(255, 77, 148, 255))
        draw.text((104, pill_y + 10), feat, fill=(255, 240, 245, 240), font=f_feature)
        pill_y += 52

    out_path = os.path.join(OUTPUT_DIR, 'feature-graphic-1024x500.png')
    fg_rgb = fg.convert('RGB')
    fg_rgb.save(out_path, format='PNG', optimize=True)
    file_size_kb = os.path.getsize(out_path) / 1024
    print(f"  ✓ Saved {out_path} ({fg_rgb.size[0]}x{fg_rgb.size[1]}px, {file_size_kb:.1f} KB)")
    return True

def generate_feature_graphic_svg():
    print("[3/4] Generating Feature Graphic SVG (1024x500px)...")
    svg_content = """<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="500" viewBox="0 0 1024 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#190616"/>
      <stop offset="50%" stop-color="#3d0a28"/>
      <stop offset="100%" stop-color="#6e063b"/>
    </linearGradient>
    
    <radialGradient id="glowPink" cx="80%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#ff4d94" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#ff4d94" stop-opacity="0"/>
    </radialGradient>
    
    <radialGradient id="glowBerry" cx="20%" cy="80%" r="50%">
      <stop offset="0%" stop-color="#b90760" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#b90760" stop-opacity="0"/>
    </radialGradient>

    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b90760"/>
      <stop offset="100%" stop-color="#ff4d94"/>
    </linearGradient>

    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="500" fill="url(#bgGrad)"/>
  <rect width="1024" height="500" fill="url(#glowPink)"/>
  <rect width="1024" height="500" fill="url(#glowBerry)"/>

  <!-- Left Side: Branding & Value Proposition -->
  <rect x="64" y="56" width="220" height="36" rx="18" fill="#b90760" fill-opacity="0.7" stroke="#ff4d94" stroke-width="1.5"/>
  <text x="174" y="80" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', 'Segoe UI', sans-serif" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="1">ROTEIROS COM IA</text>

  <text x="64" y="160" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', 'Segoe UI', sans-serif" font-size="56" font-weight="800">DateApp</text>
  <text x="64" y="210" fill="#ffb1c7" font-family="'Be Vietnam Pro', 'Ubuntu', 'Segoe UI', sans-serif" font-size="22" font-weight="500">Encontros inesquecíveis criados por IA</text>
  <text x="64" y="240" fill="#f5dce8" font-family="'Be Vietnam Pro', 'Ubuntu', 'Segoe UI', sans-serif" font-size="16" font-weight="400">Descubra restaurantes, passeios e momentos únicos a dois.</text>

  <!-- Feature Highlights -->
  <rect x="64" y="280" width="420" height="42" rx="12" fill="#2d1024" fill-opacity="0.8" stroke="#ff4d94" stroke-opacity="0.4" stroke-width="1"/>
  <circle cx="88" cy="301" r="6" fill="#ff4d94"/>
  <text x="108" y="307" fill="#ffffff" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="15" font-weight="600">Filtros por Orçamento ($, $$, $$$) &amp; Clima</text>

  <rect x="64" y="334" width="420" height="42" rx="12" fill="#2d1024" fill-opacity="0.8" stroke="#ff4d94" stroke-opacity="0.4" stroke-width="1"/>
  <circle cx="88" cy="355" r="6" fill="#ff4d94"/>
  <text x="108" y="361" fill="#ffffff" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="15" font-weight="600">Recomendações Reais &amp; Verificadas</text>

  <rect x="64" y="388" width="420" height="42" rx="12" fill="#2d1024" fill-opacity="0.8" stroke="#ff4d94" stroke-opacity="0.4" stroke-width="1"/>
  <circle cx="88" cy="409" r="6" fill="#ff4d94"/>
  <text x="108" y="415" fill="#ffffff" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="15" font-weight="600">Integração Direta com Google Maps</text>

  <!-- Right Side: Floating App UI Card -->
  <g filter="url(#cardShadow)">
    <rect x="580" y="55" width="380" height="390" rx="28" fill="#230d1f" fill-opacity="0.92" stroke="#ff4d94" stroke-width="2" stroke-opacity="0.6"/>
    
    <!-- Card Header -->
    <rect x="610" y="85" width="64" height="64" rx="16" fill="url(#btnGrad)"/>
    <path d="M642 124 C642 124 624 112 624 100 C624 93.37 629.37 88 636 88 C639.86 88 641.34 89.8 642 91 C642.66 89.8 644.14 88 648 88 C654.63 88 660 93.37 660 100 C660 112 642 124 642 124 Z" fill="#ffffff"/>
    
    <text x="690" y="112" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', sans-serif" font-size="22" font-weight="700">DateApp</text>
    <text x="690" y="136" fill="#ffb1c7" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="14">Seu assistente de dates com IA</text>

    <!-- Experience Result Item 1 -->
    <rect x="610" y="170" width="320" height="64" rx="16" fill="#3b1734" stroke="#8c7077" stroke-width="0.8"/>
    <text x="630" y="196" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', sans-serif" font-size="15" font-weight="700">Rooftop Lounge &amp; Vinhos</text>
    <text x="630" y="218" fill="#e0bec6" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="12">Vibe Íntima • Vista Panorâmica • $$$</text>

    <!-- Experience Result Item 2 -->
    <rect x="610" y="246" width="320" height="64" rx="16" fill="#3b1734" stroke="#8c7077" stroke-width="0.8"/>
    <text x="630" y="272" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', sans-serif" font-size="15" font-weight="700">Café Cultural &amp; Bistrô</text>
    <text x="630" y="294" fill="#e0bec6" font-family="'Be Vietnam Pro', 'Ubuntu', sans-serif" font-size="12">Música ao Vivo • Aconchegante • $$</text>

    <!-- Action Button -->
    <rect x="610" y="330" width="320" height="52" rx="16" fill="url(#btnGrad)"/>
    <text x="770" y="362" fill="#ffffff" font-family="'Plus Jakarta Sans', 'Ubuntu', sans-serif" font-size="15" font-weight="700" text-anchor="middle">Gerar Novo Roteiro ✨</text>
  </g>
</svg>
"""
    out_path = os.path.join(OUTPUT_DIR, 'feature-graphic-1024x500.svg')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    file_size_kb = os.path.getsize(out_path) / 1024
    print(f"  ✓ Saved {out_path} ({file_size_kb:.1f} KB)")
    return True

def process_playstore_screenshots():
    print("[4/4] Processing Play Store Screenshot Framed Mockups...")
    screenshots_src_dir = os.path.join(ASSETS_DIR, 'screenshots')
    if not os.path.exists(screenshots_src_dir):
        print(f"Error: {screenshots_src_dir} not found.")
        return False
    
    screens_meta = [
        {
            "src": "home_page.jpeg",
            "out": "screenshot_01_home.png",
            "tag": "INTELIGÊNCIA ARTIFICIAL",
            "title": "Crie o Date Perfeito",
            "sub": "Roteiros sob medida para o seu momento"
        },
        {
            "src": "filtros.jpeg",
            "out": "screenshot_02_filtros.png",
            "tag": "TOTALMENTE PERSONALIZADO",
            "title": "Filtre por Orçamento & Estilo",
            "sub": "De bares descontraídos a jantares sofisticados"
        },
        {
            "src": "filtros_avançados.jpeg",
            "out": "screenshot_03_filtros_avancados.png",
            "tag": "DETALHES QUE IMPORTAM",
            "title": "Vibe, Distância & Conforto",
            "sub": "Escolha o clima ideal, acessibilidade e estacionamento"
        },
        {
            "src": "home_page2.jpeg",
            "out": "screenshot_04_resultado.png",
            "tag": "LUGARES REAIS & VERIFICADOS",
            "title": "Recomendações Detalhadas",
            "sub": "Preços médios, avaliações e detalhes exclusivos"
        },
        {
            "src": "plano.jpeg",
            "out": "screenshot_05_planos.png",
            "tag": "PLANOS ACESSÍVEIS",
            "title": "Experiência Completa & Sem Limites",
            "sub": "Mais roteiros e recursos premium para o casal"
        },
        {
            "src": "conta.jpeg",
            "out": "screenshot_06_perfil.png",
            "tag": "SUA CONTA SEGURA",
            "title": "Histórico & Preferências",
            "sub": "Acesse seus dados e salve seus roteiros favoritos"
        },
    ]

    target_w, target_h = 1080, 2400
    resample_filter = getattr(Image, 'Resampling', Image).LANCZOS if hasattr(Image, 'Resampling') else Image.LANCZOS

    f_tag = get_font("Ubuntu-B", 34)
    f_title = get_font("Ubuntu-B", 60)
    f_sub = get_font("Ubuntu-M", 38)

    screenshots_out_dir = os.path.join(OUTPUT_DIR, 'screenshots')
    os.makedirs(screenshots_out_dir, exist_ok=True)

    for item in screens_meta:
        src_p = os.path.join(screenshots_src_dir, item['src'])
        if not os.path.exists(src_p):
            continue
        
        canvas = Image.new('RGBA', (target_w, target_h), (251, 249, 248, 255))
        cdraw = ImageDraw.Draw(canvas)

        for y in range(650):
            factor = y / 650
            r = int(185 + (255 - 185) * factor)
            g = int(7 + (77 - 7) * factor)
            b = int(96 + (148 - 96) * factor)
            cdraw.line([(0, y), (target_w, y)], fill=(r, g, b, 255))

        tag_text = item['tag']
        cdraw.rounded_rectangle([70, 90, 70 + len(tag_text)*22 + 40, 160], radius=35, fill=(255, 255, 255, 45), outline=(255, 255, 255, 120), width=2)
        cdraw.text((90, 106), tag_text, fill=(255, 255, 255, 255), font=f_tag)

        cdraw.text((70, 190), item['title'], fill=(255, 255, 255, 255), font=f_title)
        cdraw.text((70, 275), item['sub'], fill=(255, 235, 242, 255), font=f_sub)

        app_img = Image.open(src_p).convert('RGBA')
        
        phone_w = 880
        phone_h = int(app_img.size[1] * (phone_w / app_img.size[0]))
        if phone_h > 1850:
            phone_h = 1850
            phone_w = int(app_img.size[0] * (phone_h / app_img.size[1]))

        app_resized = app_img.resize((phone_w, phone_h), resample=resample_filter)

        mask = Image.new('L', (phone_w, phone_h), 0)
        mdraw = ImageDraw.Draw(mask)
        mdraw.rounded_rectangle([0, 0, phone_w, phone_h], radius=48, fill=255)

        px = (target_w - phone_w) // 2
        py = 420
        pshadow = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        psdraw = ImageDraw.Draw(pshadow)
        psdraw.rounded_rectangle([px - 10, py + 15, px + phone_w + 10, py + phone_h + 20], radius=54, fill=(0, 0, 0, 90))
        pshadow = pshadow.filter(ImageFilter.GaussianBlur(35))
        canvas = Image.alpha_composite(canvas, pshadow)

        canvas.paste(app_resized, (px, py), mask)

        cdraw = ImageDraw.Draw(canvas)
        cdraw.rounded_rectangle([px, py, px + phone_w, py + phone_h], radius=48, outline=(255, 255, 255, 200), width=6)

        out_p = os.path.join(screenshots_out_dir, item['out'])
        canvas_rgb = canvas.convert('RGB')
        canvas_rgb.save(out_p, format='PNG', optimize=True)
        print(f"  ✓ Processed screenshot: {item['out']} ({target_w}x{target_h}px)")

    return True

if __name__ == '__main__':
    print("=== DateApp Play Store Assets Generator ===")
    generate_playstore_icon()
    generate_feature_graphic_png()
    generate_feature_graphic_svg()
    process_playstore_screenshots()
    print("=== All Play Store assets generated successfully! ===")
