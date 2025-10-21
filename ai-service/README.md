# CyberShield AI Service

AI-powered threat detection microservice using machine learning for image and popup analysis.

## Features

- **Image Threat Detection**: Analyzes images using IsolationForest for anomaly detection
- **OCR Text Extraction**: Extracts text from images using Tesseract
- **Steganography Detection**: Detects hidden data using LSB and statistical analysis
- **Popup/Modal Analysis**: Detects phishing attempts in popup dialogs
- **Explainable Results**: Provides reason codes for each detection

## Setup

### Prerequisites

- Python 3.11+
- Tesseract OCR

### Installation

1. Install system dependencies:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# macOS
brew install tesseract
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Train the model:
```bash
python train.py
```

This will generate:
- `models/image_model.pkl` - Trained IsolationForest model
- `models/scaler.pkl` - Feature scaler
- `models/confusion_matrix.png` - Model evaluation visualization

## Running the Service

### Development
```bash
python app.py
```

### Production
```bash
uvicorn app:app --host 0.0.0.0 --port 5000
```

### Docker
```bash
docker build -t cybershield-ai .
docker run -p 5000:5000 cybershield-ai
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Inference (Main Endpoint)
```bash
POST /infer
Content-Type: application/json

{
  "type": "image",
  "data": {
    "thumbnail_base64": "data:image/png;base64,...",
    "src_url": "https://example.com/image.jpg",
    "page_url": "https://example.com",
    "mime": "image/jpeg",
    "metadata": {}
  },
  "context": {
    "companyId": 1,
    "agentId": 123,
    "policy": {
      "threshold": 0.7,
      "auto_quarantine": true
    }
  }
}
```

Response:
```json
{
  "verdict": "malicious",
  "severity": 8,
  "confidence": 0.92,
  "extracted_text": "Enter your credit card details",
  "suspect_regions": [],
  "reason_codes": ["suspicious_text_content", "embedded_links"],
  "action": "quarantine"
}
```

### Image-Specific Endpoint
```bash
POST /infer/image
```

### Popup-Specific Endpoint
```bash
POST /infer/popup
Content-Type: application/json

{
  "page_url": "https://example.com",
  "raw_text": "URGENT: Verify your account now!",
  "field_labels": ["password", "credit_card", "cvv"]
}
```

## Model Details

### Feature Extraction (16 features)

**Image Features:**
- `file_size`: Image file size in bytes
- `width`, `height`: Image dimensions
- `color_entropy`: Perceptual color complexity
- `mean_pixel_value`: Average brightness
- `num_text_regions`: Number of detected text areas (OCR)
- `has_links`: Presence of URLs in text
- `metadata_depth`: Complexity of image metadata
- `suspicious_strings_score`: Score based on suspicious keywords
- `suspicious_js_count`: Count of JavaScript patterns
- `aspect_ratio`: Width/height ratio
- `brightness`: Overall brightness
- `contrast`: Standard deviation of pixel values
- `edge_density`: Proportion of edge pixels
- `color_variance`: Variance in color distribution
- `text_area_ratio`: Text coverage relative to image size

**Popup Features:**
- Text length and urgency indicators
- Payment and verification keywords
- Field types (password, credit card, SSN, etc.)
- Domain analysis
- Capitalization and punctuation patterns

### Model Architecture

- **Algorithm**: IsolationForest (unsupervised anomaly detection)
- **Preprocessing**: StandardScaler for feature normalization
- **Contamination**: 0.05 (5% expected anomalies)
- **Estimators**: 100 trees

### Training

The model is trained on synthetic data that simulates:
- **Safe images**: Normal website images, logos, photos
- **Malicious images**: Phishing content, suspicious text, embedded scripts

Run `python train.py` to train with synthetic data or `python retrain.py` to improve the model with real feedback data.

## Retraining with Feedback

1. Collect feedback data in `data/feedback.csv`:
```csv
file_size,width,height,...,label
50000,800,600,...,0
150000,1200,900,...,1
```

2. Run retraining:
```bash
python retrain.py
```

## Testing

```bash
pytest tests/
```

## Performance

- **Latency**: < 5 seconds per request
- **Throughput**: ~20 requests/second
- **Accuracy**: ~90% on synthetic test data

## Reason Codes

- `suspicious_text_content`: OCR text contains suspicious keywords
- `embedded_links`: Image contains URLs
- `suspicious_js`: JavaScript patterns detected
- `steganography_detected`: Hidden data detected
- `excessive_text_regions`: Too many text areas
- `urgency_indicators`: Urgent language in popup
- `payment_request`: Requests payment information
- `verification_request`: Requests verification
- `sensitive_data_request`: Requests sensitive data (SSN, credit card)
- `phishing_pattern`: Known phishing patterns
- `suspicious_domain`: Domain appears suspicious

## Limitations

- OCR accuracy depends on image quality
- Steganography detection is heuristic-based
- Model requires retraining with real-world data for production use
- No GPU acceleration (CPU-only)

## Future Improvements

- Deep learning models (CNN for image classification)
- GPU support for faster inference
- Advanced steganography detection
- Multi-language OCR support
- Real-time model updates
