import os
import django
import pandas as pd

# ---------------- CONFIGURATION ----------------
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings')
django.setup()

from api.models import Prompt
from django.contrib.auth import get_user_model

EXCEL_FILE = 'prompts.xlsx'

def run_import_and_approve():
    try:
        print("⏳ Reading Excel file...")
        try:
            df = pd.read_excel(EXCEL_FILE)
            df.columns = df.columns.str.strip() 
        except FileNotFoundError:
            print(f"❌ Error: Could not find '{EXCEL_FILE}'")
            return

        User = get_user_model()
        default_user = User.objects.filter(is_superuser=True).first()

        if not default_user:
            try:
                default_user = User.objects.get(pk=1)
            except User.DoesNotExist:
                print("❌ No user found! Create a superuser.")
                return
        
        print(f"👤 Assigning prompts to user: {default_user.username}")

        new_prompts = []
        count = 0

        print("🚀 Starting import...")

        for index, row in df.iterrows():

            prompt = Prompt(
                title=row.get('title'),
                prompt_text=row.get('prompt_text'),
                output_format=row.get('output_format'),
                category=row.get('category'),
                task_type=row.get('task_type'),
                user=default_user,
                status='approved',
            )

            new_prompts.append(prompt)
            count += 1

        if new_prompts:
            print(f"💾 Saving {count} prompts...")
            Prompt.objects.bulk_create(new_prompts)
            print(f"✅ Imported & approved {count} prompts successfully!")
        else:
            print("⚠️ No prompts found in Excel.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")

if __name__ == '__main__':
    run_import_and_approve()
