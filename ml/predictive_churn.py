"""
Modello di predictive churn basato su XGBoost
Utilizza dati di engagement degli utenti per prevedere il rischio di abbandono
"""

import os
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, accuracy_score
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/churn_model.joblib')

def train_model(data_path=None):
    """
    Addestra il modello di previsione churn utilizzando dati storici
    
    Args:
        data_path: Percorso del file CSV con i dati storici (opzionale)
    
    Returns:
        Il modello addestrato
    """
    # Se non vengono forniti dati reali, genera dati di esempio
    if data_path is None or not os.path.exists(data_path):
        print("Generazione di dati sintetici per l'addestramento del modello di churn prediction")
        
        # Numero di esempi
        n_samples = 1000
        
        # Caratteristiche di engagement
        np.random.seed(42)
        days_since_last_login = np.random.exponential(20, n_samples)
        days_active_last_month = np.random.randint(0, 31, n_samples)
        total_properties_viewed = np.random.exponential(30, n_samples)
        messages_sent = np.random.exponential(10, n_samples)
        properties_listed = np.random.exponential(3, n_samples)
        subscription_months = np.random.exponential(6, n_samples)
        
        # Conversione a intero per alcune feature
        days_since_last_login = days_since_last_login.astype(int)
        total_properties_viewed = total_properties_viewed.astype(int)
        messages_sent = messages_sent.astype(int)
        properties_listed = properties_listed.astype(int)
        subscription_months = subscription_months.astype(int)
        
        # Creazione di variabili derivate
        avg_daily_activity = total_properties_viewed / np.maximum(1, days_active_last_month)
        
        # Calcolo della probabilità di churn in base a questi fattori
        churn_prob = (
            0.1 +  # Probabilità base
            days_since_last_login * 0.01 +  # Più giorni senza login = più churn
            (30 - days_active_last_month) * 0.01 +  # Meno giorni attivi = più churn
            np.exp(-total_properties_viewed / 20) * 0.2 +  # Meno proprietà viste = più churn
            np.exp(-messages_sent / 10) * 0.2 +  # Meno messaggi = più churn
            np.exp(-properties_listed / 2) * 0.2 +  # Meno annunci = più churn
            np.exp(-subscription_months / 6) * 0.3  # Abbonamento più recente = più churn
        )
        
        # Normalizzazione tra 0 e 1
        churn_prob = np.clip(churn_prob, 0, 1)
        
        # Etichetta binaria (1 = churn, 0 = non churn)
        churn = (np.random.random(n_samples) < churn_prob).astype(int)
        
        # Creazione del DataFrame
        data = pd.DataFrame({
            'days_since_last_login': days_since_last_login,
            'days_active_last_month': days_active_last_month,
            'total_properties_viewed': total_properties_viewed,
            'avg_daily_activity': avg_daily_activity,
            'messages_sent': messages_sent,
            'properties_listed': properties_listed,
            'subscription_months': subscription_months,
            'churn': churn
        })
    else:
        # Carica dati reali
        data = pd.read_csv(data_path)
    
    # Separa caratteristiche e target
    X = data.drop('churn', axis=1)
    y = data['churn']
    
    # Divisione train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardizzazione
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Addestramento del modello
    model = xgb.XGBClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=4,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    model.fit(X_train_scaled, y_train)
    
    # Valutazione
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    y_pred = (y_pred_proba > 0.5).astype(int)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Churn Model: AUC score: {auc:.4f}, Accuracy: {accuracy:.4f}")
    
    # Salva il modello e lo scaler
    model_data = {
        'model': model,
        'scaler': scaler,
        'features': list(X.columns)
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model_data, MODEL_PATH)
    
    return model_data

def load_model():
    """
    Carica il modello di previsione churn
    
    Returns:
        Il modello e gli strumenti associati
    """
    # Se il modello non esiste, addestralo
    if not os.path.exists(MODEL_PATH):
        return train_model()
    
    # Carica il modello esistente
    return joblib.load(MODEL_PATH)

def predict_churn_risk(user_data):
    """
    Predice il rischio di abbandono per un utente
    
    Args:
        user_data: Dizionario con i dati di engagement dell'utente
    
    Returns:
        Probabilità di churn e fattori di rischio
    """
    # Carica il modello
    model_data = load_model()
    model = model_data['model']
    scaler = model_data['scaler']
    features = model_data['features']
    
    # Crea DataFrame dall'utente
    user_df = pd.DataFrame([user_data])
    
    # Calcola eventuali variabili derivate mancanti
    if 'avg_daily_activity' not in user_df.columns and 'total_properties_viewed' in user_df.columns and 'days_active_last_month' in user_df.columns:
        user_df['avg_daily_activity'] = user_df['total_properties_viewed'] / np.maximum(1, user_df['days_active_last_month'])
    
    # Assicurati che tutte le feature necessarie siano presenti
    for feature in features:
        if feature not in user_df.columns:
            user_df[feature] = 0
    
    # Seleziona le feature nel giusto ordine
    user_df = user_df[features]
    
    # Standardizza
    user_scaled = scaler.transform(user_df)
    
    # Predizione
    churn_probability = model.predict_proba(user_scaled)[0, 1]
    
    # Identificazione dei fattori di rischio
    risk_factors = []
    
    if user_data.get('days_since_last_login', 0) > 14:
        risk_factors.append({
            'factor': 'inattività',
            'message': 'L\'utente non accede da più di 2 settimane',
            'importance': 'alta'
        })
    
    if user_data.get('days_active_last_month', 0) < 5:
        risk_factors.append({
            'factor': 'basso engagement',
            'message': 'L\'utente è stato attivo meno di 5 giorni nell\'ultimo mese',
            'importance': 'alta'
        })
    
    if user_data.get('messages_sent', 0) < 3:
        risk_factors.append({
            'factor': 'poca comunicazione',
            'message': 'L\'utente ha inviato pochi messaggi',
            'importance': 'media'
        })
    
    if user_data.get('properties_listed', 0) == 0:
        risk_factors.append({
            'factor': 'nessun annuncio',
            'message': 'L\'utente non ha pubblicato alcun annuncio',
            'importance': 'media'
        })
    
    if user_data.get('subscription_months', 0) < 2:
        risk_factors.append({
            'factor': 'abbonamento recente',
            'message': 'L\'utente ha un abbonamento da meno di 2 mesi',
            'importance': 'bassa'
        })
    
    # Determinare il livello di rischio
    risk_level = 'basso'
    if churn_probability > 0.7:
        risk_level = 'alto'
    elif churn_probability > 0.4:
        risk_level = 'medio'
    
    return {
        'churn_probability': round(float(churn_probability), 2),
        'risk_level': risk_level,
        'risk_factors': risk_factors
    }

if __name__ == "__main__":
    # Test di addestramento e predizione
    model_data = train_model()
    
    # Test con un utente di esempio ad alto rischio
    high_risk_user = {
        'days_since_last_login': 25,
        'days_active_last_month': 2,
        'total_properties_viewed': 5,
        'messages_sent': 0,
        'properties_listed': 0,
        'subscription_months': 1
    }
    
    # Test con un utente di esempio a basso rischio
    low_risk_user = {
        'days_since_last_login': 2,
        'days_active_last_month': 25,
        'total_properties_viewed': 50,
        'messages_sent': 15,
        'properties_listed': 3,
        'subscription_months': 8
    }
    
    high_risk_result = predict_churn_risk(high_risk_user)
    low_risk_result = predict_churn_risk(low_risk_user)
    
    print(f"Utente ad alto rischio - Probabilità di churn: {high_risk_result['churn_probability']}, Livello: {high_risk_result['risk_level']}")
    print(f"Utente a basso rischio - Probabilità di churn: {low_risk_result['churn_probability']}, Livello: {low_risk_result['risk_level']}")