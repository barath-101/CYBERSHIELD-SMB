from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
from inference import ThreatDetector
from config import config

app = FastAPI(
    title="CyberShield AI Service",
    description="AI-powered threat detection for images and popups",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize threat detector
detector = ThreatDetector(
    image_model_path=config.IMAGE_MODEL_PATH,
    scaler_path=config.SCALER_PATH
)


# Request models
class ImageData(BaseModel):
    thumbnail_base64: Optional[str] = None
    src_url: Optional[str] = None
    page_url: str
    mime: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class PopupData(BaseModel):
    page_url: str
    raw_text: str
    field_labels: Optional[List[str]] = []


class InferRequest(BaseModel):
    type: str  # 'image' or 'popup'
    data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = {}


class InferResponse(BaseModel):
    verdict: str
    severity: int
    confidence: float
    extracted_text: str
    suspect_regions: List[Any]
    reason_codes: List[str]
    action: str


@app.get("/")
async def root():
    return {
        "service": "CyberShield AI Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": detector.image_model is not None
    }


@app.post("/infer", response_model=InferResponse)
async def infer(request: InferRequest):
    """
    Main inference endpoint for threat detection
    
    Args:
        request: InferRequest containing type ('image' or 'popup'), data, and context
    
    Returns:
        InferResponse with verdict, severity, confidence, and action
    """
    try:
        if request.type == 'image':
            result = detector.detect_image_threat(request.data, request.context)
        elif request.type == 'popup':
            result = detector.detect_popup_threat(request.data, request.context)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid type: {request.type}")
        
        return InferResponse(**result)
        
    except Exception as e:
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")


@app.post("/infer/image")
async def infer_image(data: ImageData, context: Optional[Dict[str, Any]] = None):
    """Convenience endpoint for image inference"""
    try:
        result = detector.detect_image_threat(data.dict(), context or {})
        return result
    except Exception as e:
        print(f"Image inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Image inference failed: {str(e)}")


@app.post("/infer/popup")
async def infer_popup(data: PopupData, context: Optional[Dict[str, Any]] = None):
    """Convenience endpoint for popup inference"""
    try:
        result = detector.detect_popup_threat(data.dict(), context or {})
        return result
    except Exception as e:
        print(f"Popup inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Popup inference failed: {str(e)}")


if __name__ == "__main__":
    print("=" * 60)
    print("Starting CyberShield AI Service")
    print(f"Host: {config.HOST}")
    print(f"Port: {config.PORT}")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host=config.HOST,
        port=config.PORT,
        log_level="info"
    )
