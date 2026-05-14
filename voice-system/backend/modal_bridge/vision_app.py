import modal
import base64
import io
from PIL import Image

# Define the Modal App
app = modal.App("alterego-intelligence")

# Container image with dependencies
image = modal.Image.debian_slim().pip_install(
    "openai",
    "Pillow",
    "python-dotenv"
)

@app.function(
    image=image,
    secrets=[modal.Secret.from_name("openai-api-key")],
    timeout=60
)
def analyze_screen_remote(image_b64: str, prompt: str):
    """
    Analyzes a base64 encoded screen capture using GPT-4o-Vision on Modal.
    """
    from openai import OpenAI
    import os

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    
    logger_msg = f"🛰️ Modal: Analyzing screen for prompt: {prompt[:50]}..."
    print(logger_msg)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"},
                        },
                    ],
                }
            ],
            max_tokens=500,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Modal Vision Error: {str(e)}"

@app.function(image=image)
def ping():
    return "Pong from Modal Cloud"
