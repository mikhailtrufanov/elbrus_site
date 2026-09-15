from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "pics" / "products"
MAX_SIZE = (1200, 900)
WEBP_QUALITY = 78

PAGES = {
    "index.html": "home",
    "Elbrus_production.html": "production",
}

SLUGS = {
    "Минтай": "mintay",
    "Треска": "treska",
    "Камбала": "kambala",
    "Навага": "navaga",
    "Сельдь олюторская": "seld-olutorskaya",
    "Лососевые": "lososevye",
    "Горбуша": "gorbusha",
    "Кета": "keta",
    "Нерка": "nerka",
    "Голец": "golets",
    "Икра": "ikra",
    "Печень": "pechen",
}

ARTICLE_RE = re.compile(
    r'<article\s+class="prod"[^>]*>.*?</article>',
    re.DOTALL,
)
IMAGE_RE = re.compile(
    r'(?P<prefix><img\b[^>]*?\bsrc=")'
    r'data:image/(?P<format>[a-zA-Z0-9.+-]+);base64,'
    r'(?P<data>[^"]+)'
    r'(?P<suffix>")',
    re.DOTALL,
)
NAME_RE = re.compile(r'<h3>\s*(?P<name>[^<]+?)\s*</h3>', re.DOTALL)


def save_webp(encoded: str, target: Path) -> tuple[int, int, int]:
    source = base64.b64decode(encoded)
    with Image.open(io.BytesIO(source)) as opened:
        image = ImageOps.exif_transpose(opened)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        width, height = image.size
        temporary = target.with_suffix(".webp.tmp")
        image.save(
            temporary,
            format="WEBP",
            quality=WEBP_QUALITY,
            method=4,
        )
        temporary.replace(target)
    return width, height, target.stat().st_size


def process_page(path: Path, prefix: str) -> tuple[int, int]:
    html = path.read_bytes().decode("utf-8")
    converted = 0
    output_bytes = 0

    def replace_article(match: re.Match[str]) -> str:
        nonlocal converted, output_bytes
        article = match.group(0)
        image_match = IMAGE_RE.search(article)
        if image_match is None:
            return article

        name_match = NAME_RE.search(article)
        if name_match is None:
            raise RuntimeError(f"Не найдено название карточки в {path.name}")

        name = " ".join(name_match.group("name").split())
        slug = SLUGS.get(name)
        if slug is None:
            raise RuntimeError(f"Нет имени файла для карточки «{name}»")

        filename = f"{prefix}-{slug}.webp"
        target = OUTPUT_DIR / filename
        _width, _height, size = save_webp(image_match.group("data"), target)
        output_bytes += size
        converted += 1

        replacement = (
            f'{image_match.group("prefix")}pics/products/{filename}'
            f'{image_match.group("suffix")}'
        )
        return IMAGE_RE.sub(replacement, article, count=1)

    updated = ARTICLE_RE.sub(replace_article, html)
    if converted:
        path.write_bytes(updated.encode("utf-8"))
    return converted, output_bytes


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    total_images = 0
    total_bytes = 0

    for filename, prefix in PAGES.items():
        path = ROOT / filename
        count, size = process_page(path, prefix)
        total_images += count
        total_bytes += size
        print(f"{filename}: преобразовано изображений — {count}")

    if total_images == 0:
        print("Base64-фотографии карточек не найдены: возможно, оптимизация уже выполнена.")
        return

    print(f"Готово: {total_images} WebP, общий размер {total_bytes / 1024 / 1024:.2f} МБ")


if __name__ == "__main__":
    main()
