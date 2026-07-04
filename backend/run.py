import uvicorn
import os
from app.main import app

if __name__ == "__main__":
    # Electron will pass a dynamically assigned port via environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="127.0.0.1", port=port)
