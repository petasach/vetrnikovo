import os
import json
import re

PHOTO_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}

def filename_to_alt(filename, album_title=None, album_name=None):
    """
    Derives a human-readable alt description from a photo filename.
    Examples:
        'nabidka-1.jpeg' -> 'Nabídka 1' (if album_title is 'Nabídka')
        'jahodovy-vetrnik-s-mandlemi.jpg' -> 'Jahodovy vetrnik s mandlemi'
        'rekonstrukce-kuchyne.jpg' -> 'Rekonstrukce kuchyne'
    """
    base = os.path.splitext(filename)[0]
    # Replace dashes and underscores with spaces
    words = re.sub(r'[-_]+', ' ', base).strip()

    # If filename is like 'nabidka 1' and album_title is 'Nabídka', use 'Nabídka 1'
    if album_name and album_title:
        pattern = re.compile(rf'^{re.escape(album_name)}\s*(\d+)$', re.IGNORECASE)
        match = pattern.match(words)
        if match:
            return f"{album_title} {match.group(1)}"

    # Capitalize first letter
    if words:
        return words[0].upper() + words[1:]
    return album_title or 'Fotografie'

def build_gallery(gallery_dir=os.path.join('photos', 'gallery'), output_file=os.path.join('photos', 'gallery.json')):
    """
    Scans every subfolder in photos/gallery/ and generates photos/gallery.json.
    """
    if not os.path.isdir(gallery_dir):
        print(f"Directory not found: {gallery_dir}")
        return []

    albums = []
    for entry in sorted(os.listdir(gallery_dir)):
        album_path = os.path.join(gallery_dir, entry)
        if not os.path.isdir(album_path):
            continue

        meta_file = os.path.join(album_path, 'album.json')
        meta = {}
        if os.path.isfile(meta_file):
            try:
                with open(meta_file, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
            except Exception:
                pass

        album_title = meta.get('title', entry.capitalize())

        # Find photo files
        files = []
        for f in sorted(os.listdir(album_path)):
            ext = os.path.splitext(f)[1].lower()
            if ext in PHOTO_EXTENSIONS and os.path.isfile(os.path.join(album_path, f)):
                files.append(f)

        if not files:
            continue

        photos_meta = meta.get('photos', {})
        photos_list = []
        for f in files:
            src = f"photos/gallery/{entry}/{f}"
            alt = photos_meta.get(f) or filename_to_alt(f, album_title=album_title, album_name=entry)
            photos_list.append({
                'src': src,
                'alt': alt
            })

        albums.append({
            'name': entry,
            'title': album_title,
            'cover': photos_list[0]['src'],
            'count': len(photos_list),
            'photos': photos_list
        })

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(albums, f, ensure_ascii=False, indent=2)

    print(f"Gallery built: {len(albums)} albums from {gallery_dir} written to {output_file}")
    return albums

if __name__ == '__main__':
    build_gallery()
