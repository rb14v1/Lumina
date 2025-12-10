import os
import django

# ---------------- CONFIGURATION ----------------
# Load Django project settings (same as your import script)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings')
django.setup()

# ---------------- IMPORT MODELS ----------------
from api.models import Prompt, PromptVersion, Vote, Bookmark, CopiedPromptFeedback

def delete_all_prompts():
    try:
        print("⚠️ Starting deletion of ALL prompt-related data...")

        # Delete dependent tables first
        print("🧹 Deleting Feedback...")
        CopiedPromptFeedback.objects.all().delete()

        print("🧹 Deleting Versions...")
        PromptVersion.objects.all().delete()

        print("🧹 Deleting Votes...")
        Vote.objects.all().delete()

        print("🧹 Deleting Bookmarks...")
        Bookmark.objects.all().delete()

        # Finally delete prompts
        print("🧹 Deleting Prompts...")
        Prompt.objects.all().delete()

        print("✅ All prompts and related data removed successfully!")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")

if __name__ == '__main__':
    delete_all_prompts()
