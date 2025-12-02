#!/usr/bin/env python3
"""
Generate extension icons for DOM Flood
Creates simple PNG icons in different sizes
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️  PIL/Pillow not available. Creating placeholder files instead.")
    print("Install Pillow with: pip3 install Pillow")
    print("Or use the HTML generator: open icons/generate-icons.html in your browser")

import os

SIZES = [16, 48, 128]
ICONS_DIR = "icons"

def create_icon_with_pil(size):
    """Create icon using PIL"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background circle with gradient effect (approximated with solid color)
    draw.ellipse([2, 2, size-2, size-2], fill='#3498db', outline='#2980b9', width=max(1, size//40))

    # Water waves (simple approximation)
    wave_y = int(size * 0.65)
    wave_points = [
        (int(size * 0.15), wave_y),
        (int(size * 0.35), int(size * 0.60)),
        (int(size * 0.5), wave_y),
        (int(size * 0.65), int(size * 0.70)),
        (int(size * 0.85), wave_y),
        (int(size * 0.85), size),
        (int(size * 0.15), size),
    ]
    draw.polygon(wave_points, fill='#5dade2')

    # Water drop
    if size >= 48:
        drop_points = [
            (size//2, int(size * 0.2)),
            (int(size * 0.43), int(size * 0.36)),
            (int(size * 0.43), int(size * 0.42)),
            (size//2, int(size * 0.52)),
            (int(size * 0.57), int(size * 0.42)),
            (int(size * 0.57), int(size * 0.36)),
        ]
        draw.polygon(drop_points, fill='white')

    return img

def create_placeholder_icon(size):
    """Create a simple colored square as placeholder"""
    img = Image.new('RGB', (size, size), '#3498db')
    draw = ImageDraw.Draw(img)

    # Simple wave pattern
    draw.rectangle([0, int(size*0.6), size, size], fill='#2980b9')

    # White dot in center
    center = size // 2
    dot_size = max(2, size // 8)
    draw.ellipse([center-dot_size, center-dot_size, center+dot_size, center+dot_size], fill='white')

    return img

def create_text_placeholder(size, filename):
    """Create a text file as placeholder"""
    with open(filename, 'w') as f:
        f.write(f"Placeholder for {size}x{size} icon\n")
        f.write("Please generate real icons using:\n")
        f.write("1. Run: pip3 install Pillow && python3 generate_icons.py\n")
        f.write("2. Or open: icons/generate-icons.html in your browser\n")

def main():
    os.makedirs(ICONS_DIR, exist_ok=True)

    for size in SIZES:
        filename = os.path.join(ICONS_DIR, f"icon{size}.png")

        if PIL_AVAILABLE:
            try:
                img = create_icon_with_pil(size)
                img.save(filename, 'PNG')
                print(f"✅ Created {filename}")
            except Exception as e:
                print(f"❌ Error creating {filename}: {e}")
                # Fallback to text placeholder
                create_text_placeholder(size, filename.replace('.png', '.txt'))
        else:
            # Create text placeholder
            create_text_placeholder(size, filename.replace('.png', '.txt'))
            print(f"📝 Created placeholder: {filename.replace('.png', '.txt')}")

    if PIL_AVAILABLE:
        print("\n🎉 All icons generated successfully!")
    else:
        print("\n⚠️  Placeholders created. Install Pillow to generate real PNG icons.")
        print("Run: pip3 install Pillow && python3 generate_icons.py")

if __name__ == '__main__':
    main()
