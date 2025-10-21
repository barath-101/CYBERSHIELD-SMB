#!/usr/bin/env python3
"""
Retraining script for CyberShield AI models
Uses labeled feedback data to improve model accuracy
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib


def load_feedback_data(feedback_file='data/feedback.csv'):
    """Load labeled feedback data"""
    if not os.path.exists(feedback_file):
        print(f"No feedback file found at {feedback_file}")
        return None
    
    df = pd.read_csv(feedback_file)
    print(f"Loaded {len(df)} feedback samples")
    return df


def retrain_model(feedback_df, existing_model_path='models/image_model.pkl', 
                  scaler_path='models/scaler.pkl'):
    """Retrain model with feedback data"""
    
    # Load existing model and scaler
    if os.path.exists(existing_model_path) and os.path.exists(scaler_path):
        model = joblib.load(existing_model_path)
        scaler = joblib.load(scaler_path)
        print("Loaded existing model and scaler")
    else:
        print("No existing model found, creating new one")
        model = None
        scaler = StandardScaler()
    
    # Prepare feedback data
    # Assuming feedback_df has feature columns and a 'label' column
    # label: 0 = safe, 1 = malicious
    
    feature_columns = [col for col in feedback_df.columns if col not in ['label', 'event_id', 'timestamp']]
    X = feedback_df[feature_columns]
    y = feedback_df['label']
    
    # Scale features
    X_scaled = scaler.fit_transform(X)
    
    # Train new model on feedback data
    # Use only the labeled malicious samples to adjust contamination
    n_malicious = sum(y == 1)
    n_total = len(y)
    contamination = max(0.01, min(0.5, n_malicious / n_total))
    
    print(f"\nRetraining with contamination={contamination:.3f}")
    
    new_model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100,
        max_samples='auto',
        n_jobs=-1
    )
    
    new_model.fit(X_scaled)
    
    # Save updated model
    joblib.dump(new_model, existing_model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nModel retrained and saved to {existing_model_path}")
    print(f"Scaler saved to {scaler_path}")
    
    return new_model, scaler


def main():
    print("=" * 60)
    print("CyberShield AI Model Retraining")
    print("=" * 60)
    
    # Load feedback data
    feedback_df = load_feedback_data()
    
    if feedback_df is None or len(feedback_df) == 0:
        print("\nNo feedback data available for retraining")
        return
    
    # Retrain model
    retrain_model(feedback_df)
    
    print("\n" + "=" * 60)
    print("Retraining complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
