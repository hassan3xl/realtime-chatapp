import google.generativeai as genai
from ..core.config import settings

class GeminiBot:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None

    def generate_response(self, history):
        if not self.model:
            return "AI feature is currently disabled (API key missing)."
        
        try:
            # Format history for Gemini
            chat = self.model.start_chat(history=[]) # Could pass history here if formatted correctly
            # For now, let's just use the latest message or simplified history
            prompt = "\n".join([f"{h['role']}: {h['message']}" for h in history])
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"
