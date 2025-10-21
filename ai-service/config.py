import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '0.0.0.0')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # Model paths
    MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
    IMAGE_MODEL_PATH = os.path.join(MODEL_DIR, 'image_model.pkl')
    POPUP_MODEL_PATH = os.path.join(MODEL_DIR, 'popup_model.pkl')
    SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
    
    # OCR settings
    TESSERACT_CMD = os.getenv('TESSERACT_CMD', 'tesseract')
    
    # Model settings
    CONTAMINATION = float(os.getenv('CONTAMINATION', 0.05))
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.7))

config = Config()
