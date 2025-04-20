"""
Modello di dynamic pricing basato su scikit-learn
Utilizza dati storici sui prezzi per suggerire variazioni percentuali
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/dynamic_pricing_model.joblib')

def train_model(data_path=None):
    """
    Addestra il modello di dynamic pricing utilizzando dati storici
    
    Args:
        data_path: Percorso del file CSV con i dati storici (opzionale)
    
    Returns:
        Il modello addestrato
    """
    # Se non vengono forniti dati reali, genera dati di esempio
    if data_path is None or not os.path.exists(data_path):
        print("Generazione di dati sintetici per l'addestramento del modello di dynamic pricing")
        
        # Numero di esempi
        n_samples = 1000
        
        # Caratteristiche che influenzano il prezzo
        np.random.seed(42)
        location_score = np.random.uniform(1, 10, n_samples)  # Punteggio posizione (1-10)
        square_meters = np.random.uniform(20, 150, n_samples)  # Metri quadrati
        room_count = np.random.randint(1, 5, n_samples)  # Numero di stanze
        has_balcony = np.random.randint(0, 2, n_samples)  # Presenza balcone (0/1)
        floor = np.random.randint(0, 10, n_samples)  # Piano
        building_age = np.random.uniform(0, 50, n_samples)  # Età edificio
        demand_score = np.random.uniform(1, 10, n_samples)  # Punteggio domanda
        season = np.random.randint(1, 5, n_samples)  # Stagione (1-4)
        
        # Calcolo del prezzo base (simulato con formula)
        base_price = (
            300 + 
            location_score * 50 + 
            square_meters * 8 + 
            room_count * 100 +
            has_balcony * 50 - 
            building_age * 5 +
            floor * 10 +
            demand_score * 30
        )
        
        # Aggiunta di variazione stagionale
        seasonal_factor = np.ones(n_samples)
        seasonal_factor[season == 1] *= 1.1  # Estate
        seasonal_factor[season == 2] *= 0.9  # Autunno
        seasonal_factor[season == 3] *= 0.8  # Inverno
        seasonal_factor[season == 4] *= 1.0  # Primavera
        
        # Applicazione fattore stagionale
        base_price *= seasonal_factor
        
        # Aggiunta rumore casuale
        price = base_price + np.random.normal(0, base_price * 0.05, n_samples)
        
        # Calcolo della variazione ottimale di prezzo rispetto alla stagione e domanda
        optimal_price_change = (
            (demand_score - 5) * 0.02 +  # Più domanda = aumento prezzo
            (season == 1) * 0.05 +       # Estate = +5%
            (season == 2) * (-0.03) +    # Autunno = -3%
            (season == 3) * (-0.07) +    # Inverno = -7%
            (season == 4) * 0.02         # Primavera = +2%
        )
        
        # Conversione in percentuale
        optimal_price_change = optimal_price_change * 100
        
        # Creazione del DataFrame
        data = pd.DataFrame({
            'location_score': location_score,
            'square_meters': square_meters,
            'room_count': room_count,
            'has_balcony': has_balcony,
            'floor': floor,
            'building_age': building_age,
            'demand_score': demand_score,
            'season': season,
            'current_price': price,
            'optimal_price_change': optimal_price_change
        })
    else:
        # Carica dati reali
        data = pd.read_csv(data_path)
    
    # Separa caratteristiche e target
    X = data.drop('optimal_price_change', axis=1)
    y = data['optimal_price_change']
    
    # Divisione train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardizzazione
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Addestramento del modello
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Valutazione
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Dynamic Pricing Model: R² train score: {train_score:.4f}, test score: {test_score:.4f}")
    
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
    Carica il modello di dynamic pricing
    
    Returns:
        Il modello e gli strumenti associati
    """
    # Se il modello non esiste, addestralo
    if not os.path.exists(MODEL_PATH):
        return train_model()
    
    # Carica il modello esistente
    return joblib.load(MODEL_PATH)

def predict_price_change(property_data):
    """
    Predice la variazione percentuale ottimale di prezzo per una proprietà
    
    Args:
        property_data: Dizionario con i dati della proprietà
    
    Returns:
        Variazione percentuale consigliata del prezzo
    """
    # Carica il modello
    model_data = load_model()
    model = model_data['model']
    scaler = model_data['scaler']
    features = model_data['features']
    
    # Crea DataFrame dalla proprietà
    property_df = pd.DataFrame([property_data])
    
    # Assicurati che tutte le feature necessarie siano presenti
    for feature in features:
        if feature not in property_df.columns:
            property_df[feature] = 0
    
    # Seleziona le feature nel giusto ordine
    property_df = property_df[features]
    
    # Standardizza
    property_scaled = scaler.transform(property_df)
    
    # Predizione
    price_change = model.predict(property_scaled)[0]
    
    return {
        'recommended_price_change_percentage': round(price_change, 2),
        'confidence': 0.85  # Simulazione della confidenza
    }

if __name__ == "__main__":
    # Test di addestramento e predizione
    model_data = train_model()
    
    # Test con una proprietà di esempio
    test_property = {
        'location_score': 7.5,
        'square_meters': 85,
        'room_count': 3,
        'has_balcony': 1,
        'floor': 3,
        'building_age': 15,
        'demand_score': 8,
        'season': 1,  # Estate
        'current_price': 850
    }
    
    result = predict_price_change(test_property)
    print(f"Variazione di prezzo consigliata: {result['recommended_price_change_percentage']}%")
    print(f"Confidenza: {result['confidence']}")