import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env from .env file if present
load_dotenv()

def verify_gemini_connection():
    api_key = os.getenv("GOOGLE_API_KEY")
    
    print("----------------------------------------------------------------")
    print("🔍 VERIFYING REAL GEMINI API CONNECTION (GCP/AI Studio)")
    print("----------------------------------------------------------------")

    if not api_key:
        print("❌ CRITICAL ERROR: GOOGLE_API_KEY environment variable is missing.")
        print("Please export GOOGLE_API_KEY='your_key_here' and try again.")
        return

    # Mask key for display
    masked_key = f"{api_key[:8]}...{api_key[-4:]}"
    print(f"🔑 API Key Found: {masked_key}")

    try:
        print("\n⏳ Initializing Gemini 1.5 Pro client...")
        genai.configure(api_key=api_key)
        
        # Using the latest 1.5 Pro model
        # Core verification model
        model = genai.GenerativeModel('gemini-3-pro-preview')

        print("📡 Sending test prompt to Google Cloud...")
        prompt = "Explain in one short sentence why you are ready to be an autonomous agent."
        
        response = model.generate_content(prompt)
        
        print("\n✅ CONNECTION SUCCESSFUL!")
        print("----------------------------------------------------------------")
        print("🤖 MODEL RESPONSE:")
        print(f"\"{response.text.strip()}\"")
        print("----------------------------------------------------------------")
        print("Model Used: gemini-1.5-pro-latest")
        print("Test Result: PASSED")

    except Exception as e:
        print("\n❌ CONNECTION FAILED")
        print(f"Error details: {str(e)}")

if __name__ == "__main__":
    verify_gemini_connection()
