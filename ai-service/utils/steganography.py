import base64
import io
import numpy as np
from PIL import Image


class SteganographyDetector:
    """Detect potential steganography in images using statistical analysis"""
    
    def __init__(self):
        self.lsb_threshold = 0.5  # Entropy threshold for LSB detection
    
    def detect(self, thumbnail_base64):
        """Detect potential steganography in image"""
        try:
            if not thumbnail_base64:
                return {
                    'detected': False,
                    'confidence': 0.0,
                    'method': None,
                    'details': {}
                }
            
            # Decode image
            img_data = base64.b64decode(thumbnail_base64.split(',')[-1] if ',' in thumbnail_base64 else thumbnail_base64)
            img = Image.open(io.BytesIO(img_data))
            img_array = np.array(img)
            
            # Run detection methods
            lsb_result = self._detect_lsb(img_array)
            statistical_result = self._statistical_analysis(img_array)
            
            # Combine results
            detected = lsb_result['suspicious'] or statistical_result['suspicious']
            confidence = max(lsb_result['confidence'], statistical_result['confidence'])
            
            return {
                'detected': detected,
                'confidence': confidence,
                'method': 'lsb' if lsb_result['suspicious'] else 'statistical' if statistical_result['suspicious'] else None,
                'details': {
                    'lsb_entropy': lsb_result['entropy'],
                    'statistical_anomaly': statistical_result['anomaly_score'],
                }
            }
            
        except Exception as e:
            print(f"Steganography detection error: {e}")
            return {
                'detected': False,
                'confidence': 0.0,
                'method': None,
                'details': {}
            }
    
    def _detect_lsb(self, img_array):
        """Detect LSB (Least Significant Bit) steganography"""
        try:
            # Extract LSBs from each color channel
            if len(img_array.shape) == 3:
                lsb_data = img_array[:, :, :] & 1  # Get LSBs
            else:
                lsb_data = img_array & 1
            
            # Calculate entropy of LSBs
            lsb_flat = lsb_data.flatten()
            unique, counts = np.unique(lsb_flat, return_counts=True)
            prob = counts / counts.sum()
            entropy = -np.sum(prob * np.log2(prob + 1e-10))
            
            # High entropy in LSBs suggests potential steganography
            # Random data should have entropy close to 1 (for binary)
            suspicious = entropy > self.lsb_threshold
            confidence = min(entropy, 1.0)
            
            return {
                'suspicious': suspicious,
                'entropy': float(entropy),
                'confidence': float(confidence)
            }
            
        except Exception as e:
            print(f"LSB detection error: {e}")
            return {'suspicious': False, 'entropy': 0, 'confidence': 0}
    
    def _statistical_analysis(self, img_array):
        """Perform statistical analysis for steganography detection"""
        try:
            # Check for unusual patterns in pixel values
            if len(img_array.shape) == 3:
                # RGB image
                flat = img_array.reshape(-1, img_array.shape[2])
                
                # Check correlation between channels
                correlations = []
                for i in range(img_array.shape[2]):
                    for j in range(i + 1, img_array.shape[2]):
                        corr = np.corrcoef(flat[:, i], flat[:, j])[0, 1]
                        correlations.append(abs(corr))
                
                avg_correlation = np.mean(correlations) if correlations else 0
                
                # Low correlation between channels can indicate hidden data
                suspicious = avg_correlation < 0.7
                anomaly_score = 1.0 - avg_correlation
                
            else:
                # Grayscale image
                # Check for unusual distribution
                hist, _ = np.histogram(img_array.flatten(), bins=256, range=(0, 256))
                hist_normalized = hist / hist.sum()
                
                # Calculate chi-square statistic
                expected = np.ones_like(hist_normalized) / 256
                chi_square = np.sum((hist_normalized - expected) ** 2 / (expected + 1e-10))
                
                # Normalized chi-square
                anomaly_score = min(chi_square / 100, 1.0)
                suspicious = chi_square < 50  # Unusually uniform distribution
            
            return {
                'suspicious': suspicious,
                'anomaly_score': float(anomaly_score),
                'confidence': float(anomaly_score) if suspicious else 0.0
            }
            
        except Exception as e:
            print(f"Statistical analysis error: {e}")
            return {'suspicious': False, 'anomaly_score': 0, 'confidence': 0}
