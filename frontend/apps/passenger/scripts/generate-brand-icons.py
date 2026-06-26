#!/usr/bin/env python3
"""
Generate passenger web icons from public/images/SharingGO.png (GO crop).

Run from frontend/apps/passenger:
  python scripts/generate-brand-icons.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "images" / "SharingGO.png"
OUT_DIR = ROOT / "public"

# DESIGN.md primary green — crop targets pixels close to brand GO
GREEN_MIN = (20, 160, 80)
GREEN_MAX = (80, 255, 140)


def find_go_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    rgb = img.convert("RGB")
    w, h = rgb.size
    xs: list[int] = []
    ys: list[int] = []

    for y in range(h):
        for x in range(w):
            r, g, b = rgb.getpixel((x, y))
            if GREEN_MIN[0] <= r <= GREEN_MAX[0] and GREEN_MIN[1] <= g <= GREEN_MAX[1] and GREEN_MIN[2] <= b <= GREEN_MAX[2]:
                xs.append(x)
                ys.append(y)

    if not xs:
        # Fallback: right third of wordmark
        return (int(w * 0.68), 0, w, h)

    pad_x = int((max(xs) - min(xs)) * 0.12) + 8
    pad_y = int((max(ys) - min(ys)) * 0.18) + 6
    left = max(0, min(xs) - pad_x)
    top = max(0, min(ys) - pad_y)
    right = min(w, max(xs) + pad_x)
    bottom = min(h, max(ys) + pad_y)
    return (left, top, right, bottom)


def to_square(img: Image.Image, fill: tuple[int, int, int] = (0, 0, 0)) -> Image.Image:
    w, h = img.size
    side = max(w, h)
    canvas = Image.new("RGB", (side, side), fill)
    offset = ((side - w) // 2, (side - h) // 2)
    canvas.paste(img, offset)
    return canvas


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source logo: {SOURCE}")

    src = Image.open(SOURCE).convert("RGB")
    bbox = find_go_bbox(src)
    cropped = src.crop(bbox)
    square = to_square(cropped)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    sizes: dict[str, int] = {
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }

    for name, size in sizes.items():
        out = square.resize((size, size), Image.Resampling.LANCZOS)
        out.save(OUT_DIR / name, optimize=True)
        print(f"Wrote {OUT_DIR / name} ({size}x{size})")

    # favicon.ico: 16 + 32
    ico_images = [
        square.resize((16, 16), Image.Resampling.LANCZOS),
        square.resize((32, 32), Image.Resampling.LANCZOS),
    ]
    ico_path = OUT_DIR / "favicon.ico"
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=ico_images[1:],
    )
    print(f"Wrote {ico_path}")


if __name__ == "__main__":
    main()
