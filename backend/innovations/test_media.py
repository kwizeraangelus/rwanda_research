# test_media.py
import os
from django.conf import settings

def list_media_files():
    media_path = settings.MEDIA_ROOT
    print(f"Media root: {media_path}")
    
    if os.path.exists(media_path):
        print("Files in media folder:")
        for root, dirs, files in os.walk(media_path):
            for file in files:
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, media_path)
                print(f"  - {relative_path}")
    else:
        print("Media folder does not exist!")

if __name__ == "__main__":
    import django
    django.setup()
    list_media_files()