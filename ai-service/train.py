#!/usr/bin/env python3
"""
Training script for CyberShield AI models
Generates synthetic data and trains IsolationForest model
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure models directory exists
os.makedirs('models', exist_ok=True)


def generate_synthetic_image_data(n_safe=1000, n_malicious=50):
    """Generate synthetic image feature data"""
    print(f"Generating {n_safe} safe and {n_malicious} malicious samples...")
    
    # Safe image features (normal patterns)
    safe_data = {
        'file_size': np.random.normal(50000, 20000, n_safe).clip(1000, 500000),
        'width': np.random.normal(800, 200, n_safe).clip(100, 4000),
        'height': np.random.normal(600, 150, n_safe).clip(100, 3000),
        'color_entropy': np.random.normal(0.6, 0.1, n_safe).clip(0, 1),
        'mean_pixel_value': np.random.normal(128, 30, n_safe).clip(0, 255),
        'num_text_regions': np.random.poisson(2, n_safe).clip(0, 20),
        'has_links': np.random.binomial(1, 0.1, n_safe),
        'metadata_depth': np.random.randint(1, 4, n_safe),
        'suspicious_strings_score': np.random.beta(2, 8, n_safe).clip(0, 1),
        'suspicious_js_count': np.random.poisson(0.5, n_safe).clip(0, 5),
        'aspect_ratio': np.random.normal(1.33, 0.3, n_safe).clip(0.5, 3),
        'brightness': np.random.normal(128, 30, n_safe).clip(0, 255),
        'contrast': np.random.normal(50, 15, n_safe).clip(10, 100),
        'edge_density': np.random.beta(3, 7, n_safe).clip(0, 1),
        'color_variance': np.random.normal(2000, 500, n_safe).clip(100, 10000),
        'text_area_ratio': np.random.beta(2, 10, n_safe).clip(0, 1),
    }
    
    # Malicious image features (anomalous patterns)
    malicious_data = {
        'file_size': np.random.normal(150000, 50000, n_malicious).clip(10000, 1000000),
        'width': np.random.normal(1200, 400, n_malicious).clip(500, 5000),
        'height': np.random.normal(900, 300, n_malicious).clip(400, 4000),
        'color_entropy': np.random.normal(0.8, 0.1, n_malicious).clip(0, 1),
        'mean_pixel_value': np.random.normal(140, 40, n_malicious).clip(0, 255),
        'num_text_regions': np.random.poisson(8, n_malicious).clip(3, 30),
        'has_links': np.random.binomial(1, 0.7, n_malicious),
        'metadata_depth': np.random.randint(3, 8, n_malicious),
        'suspicious_strings_score': np.random.beta(8, 2, n_malicious).clip(0, 1),
        'suspicious_js_count': np.random.poisson(3, n_malicious).clip(1, 20),
        'aspect_ratio': np.random.normal(1.33, 0.5, n_malicious).clip(0.3, 5),
        'brightness': np.random.normal(140, 40, n_malicious).clip(0, 255),
        'contrast': np.random.normal(70, 25, n_malicious).clip(20, 150),
        'edge_density': np.random.beta(6, 4, n_malicious).clip(0, 1),
        'color_variance': np.random.normal(3500, 1000, n_malicious).clip(500, 15000),
        'text_area_ratio': np.random.beta(5, 5, n_malicious).clip(0, 1),
    }
    
    # Combine data
    safe_df = pd.DataFrame(safe_data)
    safe_df['label'] = 0  # Safe
    
    malicious_df = pd.DataFrame(malicious_data)
    malicious_df['label'] = 1  # Malicious
    
    df = pd.concat([safe_df, malicious_df], ignore_index=True)
    
    return df


def train_isolation_forest(X_train, contamination=0.05):
    """Train IsolationForest model"""
    print(f"\nTraining IsolationForest with contamination={contamination}...")
    
    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
        max_samples='auto',
        n_jobs=-1
    )
    
    model.fit(X_train)
    
    return model


def evaluate_model(model, scaler, X_test, y_test):
    """Evaluate model performance"""
    print("\nEvaluating model...")
    
    # Transform test data
    X_test_scaled = scaler.transform(X_test)
    
    # Predict (-1 for anomaly/malicious, 1 for normal/safe)
    predictions = model.predict(X_test_scaled)
    
    # Convert predictions: -1 (anomaly) -> 1 (malicious), 1 (normal) -> 0 (safe)
    y_pred = (predictions == -1).astype(int)
    
    # Calculate metrics
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Malicious']))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\nConfusion Matrix:")
    print(cm)
    
    # Plot confusion matrix
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Safe', 'Malicious'],
                yticklabels=['Safe', 'Malicious'])
    plt.title('Confusion Matrix - Image Threat Detection')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('models/confusion_matrix.png', dpi=150)
    print("\nConfusion matrix saved to models/confusion_matrix.png")
    
    return y_pred


def main():
    print("=" * 60)
    print("CyberShield AI Model Training")
    print("=" * 60)
    
    # Generate synthetic data
    df = generate_synthetic_image_data(n_safe=1000, n_malicious=50)
    
    print(f"\nDataset shape: {df.shape}")
    print(f"Safe samples: {sum(df['label'] == 0)}")
    print(f"Malicious samples: {sum(df['label'] == 1)}")
    
    # Separate features and labels
    X = df.drop('label', axis=1)
    y = df['label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Scale features
    print("\nScaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train model
    model = train_isolation_forest(X_train_scaled, contamination=0.05)
    
    # Evaluate
    evaluate_model(model, scaler, X_test, y_test)
    
    # Save model and scaler
    print("\nSaving model and scaler...")
    joblib.dump(model, 'models/image_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("\nModel saved to models/image_model.pkl")
    print("Scaler saved to models/scaler.pkl")
    print("\n" + "=" * 60)
    print("Training complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
