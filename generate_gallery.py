import os
import re
import unicodedata

PHOTO_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}

START_MARKER = '<!-- AUTO-GENERATED-GALLERY:START -->'
END_MARKER = '<!-- AUTO-GENERATED-GALLERY:END -->'

def natural_sort_key(s):
    """Splits string by digits so numbers are compared numerically."""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def folder_to_title(folder_name):
    """
    Derives display title from folder name:
    - Strips leading numbers/separators (e.g. '01-', '03-')
    - Replaces dashes/underscores with spaces
    - Capitalizes the first letter
    Examples:
        '01-nabídka'   -> 'Nabídka'
        '03-více-slov' -> 'Více slov'
    """
    clean = re.sub(r'^\d+[\s._-]+', '', folder_name).strip()
    words = re.sub(r'[-_]+', ' ', clean).strip()
    if words:
        return words[0].upper() + words[1:]
    return folder_name

def filename_to_alt(filename, album_title=None, album_name=None):
    """
    Derives a clean human-readable alt description from a photo filename:
    - Strips leading numbers/separators
    - Replaces dashes/underscores with spaces
    - Capitalizes the first letter
    """
    base = os.path.splitext(filename)[0]
    clean = re.sub(r'^\d+[\s._-]+', '', base).strip()
    if not clean:
        clean = base

    words = re.sub(r'[-_]+', ' ', clean).strip()

    if album_name and album_title:
        clean_album_name = re.sub(r'^\d+[\s._-]+', '', album_name).strip()
        norm_album = strip_accents(clean_album_name)
        norm_words = strip_accents(words)
        match = re.match(rf'^{re.escape(norm_album)}\s*(\d+)$', norm_words, re.IGNORECASE)
        if match:
            return f"{album_title} {match.group(1)}"

    if words:
        return words[0].upper() + words[1:]
    return album_title or 'Fotografie'

def photo_count_label(n):
    if n == 1:
        return f"{n} fotografie"
    if 2 <= n <= 4:
        return f"{n} fotografie"
    return f"{n} fotografií"

def build_gallery_html(gallery_dir=os.path.join('photos', 'gallery')):
    if not os.path.isdir(gallery_dir):
        return ""

    articles = []
    # Sort albums naturally (e.g. '01-nabídka', '02-rekonstrukce')
    for entry in sorted(os.listdir(gallery_dir), key=natural_sort_key):
        album_path = os.path.join(gallery_dir, entry)
        if not os.path.isdir(album_path):
            continue

        title = folder_to_title(entry)

        # Find photo files and sort them naturally
        files = []
        for f in sorted(os.listdir(album_path), key=natural_sort_key):
            ext = os.path.splitext(f)[1].lower()
            if ext in PHOTO_EXTENSIONS and os.path.isfile(os.path.join(album_path, f)):
                files.append(f)

        if not files:
            continue

        cover_src = f"photos/gallery/{entry}/{files[0]}"
        badge_text = photo_count_label(len(files))

        photo_imgs = []
        for f in files:
            src = f"photos/gallery/{entry}/{f}"
            alt = filename_to_alt(f, album_title=title, album_name=entry)
            photo_imgs.append(f'                                <img src="{src}" alt="{alt}">')

        photo_imgs_html = "\n".join(photo_imgs)

        article = f"""                        <!-- Album: {title} -->
                        <article class="gallery-album" data-album="{entry}" tabindex="0" role="button"
                            aria-label="Otevřít galerii: {title}">
                            <div class="gallery-album__media">
                                <img src="{cover_src}" alt="{title}" class="gallery-album__bg" loading="lazy">
                            </div>
                            <div class="gallery-album__overlay"></div>
                            <div class="gallery-album__content">
                                <h2 class="gallery-album__title">{title}</h2>
                                <span class="gallery-album__badge">{badge_text}</span>
                            </div>

                            <!-- Fotografie pro lightbox -->
                            <div class="gallery-album__items" hidden>
{photo_imgs_html}
                            </div>
                        </article>"""
        articles.append(article)

    return "\n\n".join(articles)

def update_galerie_html(html_file='galerie.html'):
    if not os.path.isfile(html_file):
        print(f"File not found: {html_file}")
        return False

    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    gallery_html = build_gallery_html()

    # If markers already exist, replace between them
    if START_MARKER in content and END_MARKER in content:
        pattern = re.compile(rf'{re.escape(START_MARKER)}.*?{re.escape(END_MARKER)}', re.DOTALL)
        replacement = f"{START_MARKER}\n{gallery_html}\n                        {END_MARKER}"
        new_content = pattern.sub(replacement, content)
    else:
        # Fallback: look for <div class="gallery-albums"...>...</div>
        pattern = re.compile(r'(<div[^>]*class="[^"]*gallery-albums[^"]*"[^>]*>).*?(</div>)', re.DOTALL)
        replacement = rf'\1\n                        {START_MARKER}\n{gallery_html}\n                        {END_MARKER}\n                    \2'
        new_content = pattern.sub(replacement, content)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Updated {html_file} with gallery albums directly in HTML.")
    return True

if __name__ == '__main__':
    update_galerie_html()
