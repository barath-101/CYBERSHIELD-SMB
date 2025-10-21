import base64
import io
import re
import numpy as np
from PIL import Image
import cv2
import pytesseract
from urllib.parse import urlparse


class ImageFeatureExtractor:
    """Extract features from images for ML model"""
    
    def __init__(self):
        self.suspicious_keywords = [
            'http', 'www', 'aadhar', 'aadhaar', 'pan', 'upi', 'credit', 'debit',
            'card', 'cvv', 'otp', 'password', 'ssn', 'account', 'bank', 'payment',
            'verify', 'urgent', 'suspended', 'locked', 'click here'
        ]
        
    def extract_features(self, thumbnail_base64=None, src_url=None, page_url=None, mime=None, metadata=None):
        """Extract 16 features from image"""
        features = {}
        
        # Initialize with default values
        features['file_size'] = 0
        features['width'] = 0
        features['height'] = 0
        features['color_entropy'] = 0
        features['mean_pixel_value'] = 0
        features['num_text_regions'] = 0
        features['has_links'] = 0
        features['metadata_depth'] = 0
        features['suspicious_strings_score'] = 0
        features['suspicious_js_count'] = 0
        features['aspect_ratio'] = 1.0
        features['brightness'] = 128
        features['contrast'] = 0
        features['edge_density'] = 0
        features['color_variance'] = 0
        features['text_area_ratio'] = 0
        
        try:
            # Extract from thumbnail if available
            if thumbnail_base64:
                img_data = base64.b64decode(thumbnail_base64.split(',')[-1] if ',' in thumbnail_base64 else thumbnail_base64)
                img = Image.open(io.BytesIO(img_data))
                
                features['file_size'] = len(img_data)
                features['width'] = img.width
                features['height'] = img.height
                features['aspect_ratio'] = img.width / img.height if img.height > 0 else 1.0
                
                # Convert to numpy array for analysis
                img_array = np.array(img)
                
                # Color entropy
                if len(img_array.shape) == 3:
                    features['color_entropy'] = self._calculate_entropy(img_array)
                    features['mean_pixel_value'] = np.mean(img_array)
                    features['brightness'] = np.mean(img_array)
                    features['color_variance'] = np.var(img_array)
                else:
                    features['mean_pixel_value'] = np.mean(img_array)
                    features['brightness'] = np.mean(img_array)
                
                # Edge detection for contrast
                gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY) if len(img_array.shape) == 3 else img_array
                edges = cv2.Canny(gray, 100, 200)
                features['edge_density'] = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
                features['contrast'] = np.std(gray)
                
                # OCR for text detection
                try:
                    text = pytesseract.image_to_string(img)
                    features['num_text_regions'] = len([t for t in text.split('\n') if t.strip()])
                    features['text_area_ratio'] = len(text.strip()) / (img.width * img.height) if text.strip() else 0
                    
                    # Check for suspicious strings in OCR text
                    features['suspicious_strings_score'] = self._calculate_suspicious_score(text)
                    
                    # Check for URLs in text
                    if any(keyword in text.lower() for keyword in ['http', 'www', '.com', '.net']):
                        features['has_links'] = 1
                except Exception as ocr_error:
                    print(f"OCR error: {ocr_error}")
            
            # URL analysis
            if src_url:
                parsed = urlparse(src_url)
                # Check for suspicious patterns in URL
                if any(keyword in src_url.lower() for keyword in self.suspicious_keywords):
                    features['suspicious_strings_score'] = min(features['suspicious_strings_score'] + 0.3, 1.0)
            
            # Metadata depth
            if metadata and isinstance(metadata, dict):
                features['metadata_depth'] = self._calculate_dict_depth(metadata)
                
        except Exception as e:
            print(f"Feature extraction error: {e}")
        
        return features
    
    def _calculate_entropy(self, img_array):
        """Calculate color entropy"""
        try:
            histogram, _ = np.histogram(img_array.flatten(), bins=256, range=(0, 256))
            histogram = histogram[histogram > 0]
            prob = histogram / histogram.sum()
            entropy = -np.sum(prob * np.log2(prob))
            return entropy / 8.0  # Normalize to 0-1
        except:
            return 0
    
    def _calculate_suspicious_score(self, text):
        """Calculate score based on suspicious keywords"""
        if not text:
            return 0
        
        text_lower = text.lower()
        matches = sum(1 for keyword in self.suspicious_keywords if keyword in text_lower)
        return min(matches / 5.0, 1.0)  # Normalize to 0-1
    
    def _calculate_dict_depth(self, d, depth=0):
        """Calculate depth of nested dictionary"""
        if not isinstance(d, dict):
            return depth
        if not d:
            return depth + 1
        return max(self._calculate_dict_depth(v, depth + 1) for v in d.values())


class PopupFeatureExtractor:
    """Extract features from popup/modal data for ML model"""
    
    def __init__(self):
        self.phishing_keywords = [
            'urgent', 'verify', 'suspended', 'locked', 'account', 'payment',
            'credit card', 'ssn', 'social security', 'aadhar', 'pan', 'otp',
            'click here', 'act now', 'limited time', 'expire', 'confirm'
        ]
        
        self.sensitive_fields = [
            'password', 'credit_card', 'cvv', 'ssn', 'pin', 'otp',
            'card_number', 'account_number', 'routing', 'aadhar', 'pan'
        ]
    
    def extract_features(self, page_url, raw_text, field_labels):
        """Extract features from popup data"""
        features = {}
        
        # Text analysis
        text_lower = raw_text.lower() if raw_text else ''
        
        features['text_length'] = len(raw_text) if raw_text else 0
        features['has_urgency'] = int(any(keyword in text_lower for keyword in ['urgent', 'now', 'immediately', 'expire']))
        features['has_payment_keywords'] = int(any(keyword in text_lower for keyword in ['payment', 'pay', 'credit', 'debit', 'bank']))
        features['has_verification_request'] = int(any(keyword in text_lower for keyword in ['verify', 'confirm', 'validate']))
        features['phishing_keyword_count'] = sum(1 for keyword in self.phishing_keywords if keyword in text_lower)
        
        # Field analysis
        field_labels_lower = [f.lower() for f in (field_labels or [])]
        features['num_fields'] = len(field_labels or [])
        features['has_password_field'] = int('password' in field_labels_lower)
        features['has_payment_field'] = int(any(f in field_labels_lower for f in ['cvv', 'credit_card', 'card_number']))
        features['has_ssn_field'] = int(any(f in field_labels_lower for f in ['ssn', 'social_security', 'aadhar', 'pan']))
        features['sensitive_field_count'] = sum(1 for f in field_labels_lower if any(sf in f for sf in self.sensitive_fields))
        
        # URL analysis
        parsed_url = urlparse(page_url) if page_url else None
        features['domain_suspicious'] = 0
        if parsed_url:
            domain = parsed_url.netloc.lower()
            # Check for suspicious patterns
            if any(keyword in domain for keyword in ['verify', 'secure', 'account', 'update', 'login']):
                features['domain_suspicious'] = 1
        
        features['has_subdomain'] = int(parsed_url.netloc.count('.') > 1 if parsed_url else False)
        
        # Additional features
        features['capitalization_ratio'] = sum(1 for c in raw_text if c.isupper()) / len(raw_text) if raw_text else 0
        features['exclamation_count'] = raw_text.count('!') if raw_text else 0
        features['question_count'] = raw_text.count('?') if raw_text else 0
        
        return features


def extract_text_from_image(image_data):
    """Extract text from image using OCR"""
    try:
        img = Image.open(io.BytesIO(image_data))
        # Preprocess for better OCR
        img_array = np.array(img.convert('L'))  # Convert to grayscale
        _, img_binary = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        text = pytesseract.image_to_string(Image.fromarray(img_binary))
        return text.strip()
    except Exception as e:
        print(f"OCR extraction error: {e}")
        return ""
