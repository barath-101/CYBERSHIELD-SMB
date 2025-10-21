import os
import numpy as np
import joblib
from utils.feature_extraction import ImageFeatureExtractor, PopupFeatureExtractor, extract_text_from_image
from utils.steganography import SteganographyDetector
import base64


class ThreatDetector:
    """Main threat detection class using trained models"""
    
    def __init__(self, image_model_path='models/image_model.pkl', 
                 scaler_path='models/scaler.pkl'):
        self.image_model = None
        self.scaler = None
        self.image_feature_extractor = ImageFeatureExtractor()
        self.popup_feature_extractor = PopupFeatureExtractor()
        self.steg_detector = SteganographyDetector()
        
        # Load models if they exist
        if os.path.exists(image_model_path) and os.path.exists(scaler_path):
            self.image_model = joblib.load(image_model_path)
            self.scaler = joblib.load(scaler_path)
            print("Models loaded successfully")
        else:
            print("Warning: Models not found. Using heuristic-based detection.")
    
    def detect_image_threat(self, data, context):
        """Detect threats in images"""
        thumbnail_base64 = data.get('thumbnail_base64')
        src_url = data.get('src_url')
        page_url = data.get('page_url')
        mime = data.get('mime')
        metadata = data.get('metadata', {})
        
        # Extract features
        features = self.image_feature_extractor.extract_features(
            thumbnail_base64, src_url, page_url, mime, metadata
        )
        
        # OCR text extraction
        extracted_text = ""
        if thumbnail_base64:
            try:
                img_data = base64.b64decode(thumbnail_base64.split(',')[-1] if ',' in thumbnail_base64 else thumbnail_base64)
                extracted_text = extract_text_from_image(img_data)
            except Exception as e:
                print(f"Text extraction error: {e}")
        
        # Steganography detection
        steg_result = self.steg_detector.detect(thumbnail_base64)
        
        # Prepare feature vector
        feature_vector = [
            features['file_size'],
            features['width'],
            features['height'],
            features['color_entropy'],
            features['mean_pixel_value'],
            features['num_text_regions'],
            features['has_links'],
            features['metadata_depth'],
            features['suspicious_strings_score'],
            features['suspicious_js_count'],
            features['aspect_ratio'],
            features['brightness'],
            features['contrast'],
            features['edge_density'],
            features['color_variance'],
            features['text_area_ratio'],
        ]
        
        # Model prediction
        if self.image_model and self.scaler:
            try:
                X = np.array(feature_vector).reshape(1, -1)
                X_scaled = self.scaler.transform(X)
                prediction = self.image_model.predict(X_scaled)[0]
                anomaly_score = self.image_model.score_samples(X_scaled)[0]
                
                # Convert prediction: -1 (anomaly) -> malicious, 1 (normal) -> safe
                is_malicious = prediction == -1
                
                # Calculate confidence based on anomaly score
                # Lower score = more anomalous = higher confidence in malicious verdict
                confidence = 1.0 / (1.0 + np.exp(anomaly_score * 2))  # Sigmoid transformation
                
            except Exception as e:
                print(f"Model prediction error: {e}")
                is_malicious = False
                confidence = 0.5
        else:
            # Heuristic-based detection
            is_malicious, confidence = self._heuristic_image_detection(features, extracted_text, steg_result)
        
        # Determine verdict and action
        verdict, severity, action = self._determine_verdict(is_malicious, confidence, context)
        
        # Collect reason codes
        reason_codes = self._get_image_reason_codes(features, extracted_text, steg_result, is_malicious)
        
        return {
            'verdict': verdict,
            'severity': severity,
            'confidence': float(confidence),
            'extracted_text': extracted_text,
            'suspect_regions': [],  # Would be populated with actual region detection
            'reason_codes': reason_codes,
            'action': action,
            'steganography_detected': steg_result['detected'],
        }
    
    def detect_popup_threat(self, data, context):
        """Detect threats in popups/modals"""
        page_url = data.get('page_url')
        raw_text = data.get('raw_text', '')
        field_labels = data.get('field_labels', [])
        
        # Extract features
        features = self.popup_feature_extractor.extract_features(page_url, raw_text, field_labels)
        
        # Heuristic-based popup detection (logistic regression could be trained similarly)
        is_malicious, confidence = self._heuristic_popup_detection(features)
        
        # Determine verdict and action
        verdict, severity, action = self._determine_verdict(is_malicious, confidence, context)
        
        # Collect reason codes
        reason_codes = self._get_popup_reason_codes(features, is_malicious)
        
        return {
            'verdict': verdict,
            'severity': severity,
            'confidence': float(confidence),
            'extracted_text': raw_text,
            'suspect_regions': [],
            'reason_codes': reason_codes,
            'action': action,
        }
    
    def _heuristic_image_detection(self, features, text, steg_result):
        """Heuristic-based image threat detection"""
        score = 0
        max_score = 10
        
        # Suspicious strings in OCR text
        if features['suspicious_strings_score'] > 0.5:
            score += 3
        
        # Contains links
        if features['has_links']:
            score += 2
        
        # Many text regions (could be phishing)
        if features['num_text_regions'] > 10:
            score += 2
        
        # Suspicious JS
        if features['suspicious_js_count'] > 2:
            score += 2
        
        # Steganography detected
        if steg_result['detected']:
            score += 3
        
        confidence = min(score / max_score, 1.0)
        is_malicious = score > 5
        
        return is_malicious, confidence
    
    def _heuristic_popup_detection(self, features):
        """Heuristic-based popup threat detection"""
        score = 0
        max_score = 10
        
        # Urgency indicators
        if features['has_urgency']:
            score += 2
        
        # Payment keywords
        if features['has_payment_keywords']:
            score += 2
        
        # Verification requests
        if features['has_verification_request']:
            score += 1
        
        # Sensitive fields
        if features['sensitive_field_count'] > 0:
            score += 3
        
        # Many phishing keywords
        if features['phishing_keyword_count'] > 3:
            score += 3
        
        # Suspicious domain
        if features['domain_suspicious']:
            score += 2
        
        confidence = min(score / max_score, 1.0)
        is_malicious = score > 5
        
        return is_malicious, confidence
    
    def _determine_verdict(self, is_malicious, confidence, context):
        """Determine final verdict, severity, and action based on confidence and policy"""
        policy = context.get('policy', {})
        threshold = policy.get('threshold', 0.7)
        auto_quarantine = policy.get('auto_quarantine', False)
        
        if is_malicious and confidence >= threshold:
            verdict = 'malicious'
            severity = int(confidence * 10)
            action = 'quarantine' if auto_quarantine else 'alert'
        elif is_malicious and confidence >= 0.5:
            verdict = 'suspicious'
            severity = int(confidence * 10)
            action = 'alert'
        else:
            verdict = 'safe'
            severity = 1
            action = 'allow'
        
        return verdict, severity, action
    
    def _get_image_reason_codes(self, features, text, steg_result, is_malicious):
        """Get reason codes for image detection"""
        codes = []
        
        if is_malicious:
            if features['suspicious_strings_score'] > 0.5:
                codes.append('suspicious_text_content')
            if features['has_links']:
                codes.append('embedded_links')
            if features['suspicious_js_count'] > 0:
                codes.append('suspicious_js')
            if steg_result['detected']:
                codes.append('steganography_detected')
            if features['num_text_regions'] > 10:
                codes.append('excessive_text_regions')
        
        return codes
    
    def _get_popup_reason_codes(self, features, is_malicious):
        """Get reason codes for popup detection"""
        codes = []
        
        if is_malicious:
            if features['has_urgency']:
                codes.append('urgency_indicators')
            if features['has_payment_keywords']:
                codes.append('payment_request')
            if features['has_verification_request']:
                codes.append('verification_request')
            if features['sensitive_field_count'] > 0:
                codes.append('sensitive_data_request')
            if features['phishing_keyword_count'] > 3:
                codes.append('phishing_pattern')
            if features['domain_suspicious']:
                codes.append('suspicious_domain')
        
        return codes
