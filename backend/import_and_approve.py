import os
import django
import pandas as pd

# ---------------- CONFIGURATION ----------------
# 1. Project Settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'prompt_library.settings') 
django.setup()

# 2. Imports
from api.models import Prompt  
from django.contrib.auth import get_user_model

# 3. Excel File Name
EXCEL_FILE = 'prompts.xlsx'

def run_import_and_approve():
    try:
        print("⏳ Reading Excel file...")
        try:
            df = pd.read_excel(EXCEL_FILE)
            df.columns = df.columns.str.strip() # Clean headers
        except FileNotFoundError:
            print(f"❌ Error: Could not find '{EXCEL_FILE}' in this folder.")
            return

        # Get User
        User = get_user_model()
        # Prioritize Superuser, fallback to ID 1
        default_user = User.objects.filter(is_superuser=True).first()
        if not default_user:
            try:
                default_user = User.objects.get(pk=1)
            except User.DoesNotExist:
                print("❌ Error: No users found in database! Create a superuser first.")
                return
        
        print(f"👤 Assigning prompts to user: {default_user.username}")

        # --- PREPARE CATEGORY MAPPING ---
        category_map = {
            'Software': 'engineering', 
            'Engineering': 'engineering',
            'Marketing': 'marketing',
            'Sales': 'sales',
            'Design': 'design',
            'Product Management': 'product_management',
            'Human Resources': 'hr',
            'Finance': 'finance',
            'Support': 'support',
            'Communications': 'content_comms',
            'Learning & Development': 'learning',
        }

        # --- IMPORT LOOP ---
        count = 0
        new_prompts = []
        
        print("🚀 Starting import...")
        
        for index, row in df.iterrows():
            raw_dept = str(row['Department']).strip()
            db_category = category_map.get(raw_dept, raw_dept.lower())

            # Create Prompt Object (but don't save to DB one-by-one for speed)
            # We set status='approved' DIRECTLY here! No need for a second step.
            prompt = Prompt(
                title=row['Title'],
                prompt_text=row['Prompts'], 
                category=db_category,
                user=default_user,
                status='approved',  # <--- SETTING TO APPROVED INSTANTLY
                vote=0,
                like_count=0,
                dislike_count=0,
                copy_count=0
            )
            new_prompts.append(prompt)
            count += 1

        # --- BULK CREATE (Much Faster) ---
        if new_prompts:
            print(f"💾 Saving {count} prompts to database...")
            Prompt.objects.bulk_create(new_prompts)
            print(f"✅ BOOM! Successfully imported and approved {count} prompts.")
        else:
            print("⚠️ No prompts found in Excel to import.")

    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")

if __name__ == '__main__':
    run_import_and_approve()