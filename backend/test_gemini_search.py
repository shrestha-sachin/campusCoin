import os
import google.generativeai as genai

api_key = os.environ.get("GEMINI_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

try:
    response = model.generate_content("What is the current time in New York?", tools="google_search_retrieval")
    print("Success with string")
except Exception as e:
    print("Error with string:", e)
