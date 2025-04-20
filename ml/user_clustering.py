"""
Modello di clustering degli utenti basato su k-means
Utilizza vettori di embedding dalle interazioni degli utenti per segmentarli
"""

import os
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/user_clustering_model.joblib')

# Numero di cluster
N_CLUSTERS = 5

# Nomi descrittivi dei cluster
CLUSTER_DESCRIPTIONS = {
    0: "Proprietari attivi",
    1: "Cercatori occasionali",
    2: "Utenti premium",
    3: "Nuovi iscritti",
    4: "Utenti inattivi"
}

# Caratteristiche specifiche di ciascun cluster
CLUSTER_FEATURES = {
    0: ["Pubblica regolarmente annunci", "Risponde velocemente ai messaggi", "Usa spesso la piattaforma"],
    1: ["Cerca proprietà occasionalmente", "Visualizza molti dettagli", "Invia pochi messaggi"],
    2: ["Sottoscrizione premium", "Alto tasso di completamento delle transazioni", "Alto engagement con la piattaforma"],
    3: ["Account recenti", "In fase di esplorazione", "Profilo incompleto"],
    4: ["Login poco frequenti", "Sessioni brevi", "Nessuna transazione recente"]
}

def train_model(data_path=None):
    """
    Addestra il modello di clustering degli utenti
    
    Args:
        data_path: Percorso del file CSV con i dati degli utenti (opzionale)
    
    Returns:
        Il modello addestrato
    """
    # Se non vengono forniti dati reali, genera dati di esempio
    if data_path is None or not os.path.exists(data_path):
        print("Generazione di dati sintetici per l'addestramento del modello di clustering")
        
        # Numero di esempi
        n_samples = 1000
        
        # Caratteristiche degli utenti
        np.random.seed(42)
        
        # Attività di visualizzazione
        properties_viewed_monthly = np.random.exponential(20, n_samples)
        avg_view_duration_sec = np.random.normal(120, 40, n_samples)
        search_count_monthly = np.random.exponential(15, n_samples)
        
        # Attività di messaggistica
        msg_sent_monthly = np.random.exponential(10, n_samples)
        msg_response_rate = np.random.beta(2, 2, n_samples)
        avg_response_time_hrs = np.random.exponential(5, n_samples)
        
        # Attività di pubblicazione
        properties_listed = np.random.exponential(2, n_samples)
        listing_completeness = np.random.beta(5, 2, n_samples)
        listing_updates_monthly = np.random.exponential(3, n_samples)
        
        # Profilo e account
        login_frequency_weekly = np.random.exponential(3, n_samples)
        session_duration_min = np.random.gamma(3, 5, n_samples)
        completed_profile = np.random.beta(2, 1, n_samples)
        
        # Comportamento di acquisto
        subscription_tier = np.random.choice([0, 1, 2], n_samples, p=[0.7, 0.2, 0.1])  # Free, Standard, Premium
        days_since_registration = np.random.exponential(180, n_samples)
        
        # Conversione a intero per alcune feature
        properties_viewed_monthly = properties_viewed_monthly.astype(int)
        search_count_monthly = search_count_monthly.astype(int)
        msg_sent_monthly = msg_sent_monthly.astype(int)
        properties_listed = properties_listed.astype(int)
        listing_updates_monthly = listing_updates_monthly.astype(int)
        login_frequency_weekly = login_frequency_weekly.astype(int)
        days_since_registration = days_since_registration.astype(int)
        
        # Creazione del DataFrame
        data = pd.DataFrame({
            'properties_viewed_monthly': properties_viewed_monthly,
            'avg_view_duration_sec': avg_view_duration_sec,
            'search_count_monthly': search_count_monthly,
            'msg_sent_monthly': msg_sent_monthly,
            'msg_response_rate': msg_response_rate,
            'avg_response_time_hrs': avg_response_time_hrs,
            'properties_listed': properties_listed,
            'listing_completeness': listing_completeness,
            'listing_updates_monthly': listing_updates_monthly,
            'login_frequency_weekly': login_frequency_weekly,
            'session_duration_min': session_duration_min,
            'completed_profile': completed_profile,
            'subscription_tier': subscription_tier,
            'days_since_registration': days_since_registration
        })
    else:
        # Carica dati reali
        data = pd.read_csv(data_path)
    
    # Standardizzazione dei dati
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Riduzione dimensionalità (opzionale)
    pca = PCA(n_components=5)
    data_pca = pca.fit_transform(data_scaled)
    
    # Clustering
    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(data_pca)
    
    # Visualizzazione della distribuzione dei cluster
    cluster_counts = np.bincount(clusters, minlength=N_CLUSTERS)
    for i in range(N_CLUSTERS):
        print(f"Cluster {i} ({CLUSTER_DESCRIPTIONS[i]}): {cluster_counts[i]} utenti ({cluster_counts[i]/n_samples*100:.1f}%)")
    
    # Calcolo dei centroidi originali per interpretazione
    cluster_centers_scaled = kmeans.cluster_centers_
    # Trasforma i centroidi PCA in caratteristiche originali (approssimazione)
    cluster_centers_original = scaler.inverse_transform(pca.inverse_transform(cluster_centers_scaled))
    
    # Creazione dataframe con i centroidi
    centers_df = pd.DataFrame(cluster_centers_original, columns=data.columns)
    
    # Salva il modello e gli strumenti associati
    model_data = {
        'kmeans': kmeans,
        'scaler': scaler,
        'pca': pca,
        'features': list(data.columns),
        'cluster_descriptions': CLUSTER_DESCRIPTIONS,
        'cluster_features': CLUSTER_FEATURES,
        'centers': centers_df
    }
    
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model_data, MODEL_PATH)
    
    return model_data

def load_model():
    """
    Carica il modello di clustering degli utenti
    
    Returns:
        Il modello e gli strumenti associati
    """
    # Se il modello non esiste, addestralo
    if not os.path.exists(MODEL_PATH):
        return train_model()
    
    # Carica il modello esistente
    return joblib.load(MODEL_PATH)

def predict_user_cluster(user_data):
    """
    Predice il cluster di appartenenza di un utente
    
    Args:
        user_data: Dizionario con i dati dell'utente
    
    Returns:
        Informazioni sul cluster dell'utente
    """
    # Carica il modello
    model_data = load_model()
    kmeans = model_data['kmeans']
    scaler = model_data['scaler']
    pca = model_data['pca']
    features = model_data['features']
    cluster_descriptions = model_data['cluster_descriptions']
    cluster_features = model_data['cluster_features']
    centers = model_data['centers']
    
    # Crea DataFrame dall'utente
    user_df = pd.DataFrame([user_data])
    
    # Assicurati che tutte le feature necessarie siano presenti
    for feature in features:
        if feature not in user_df.columns:
            user_df[feature] = 0
    
    # Seleziona le feature nel giusto ordine
    user_df = user_df[features]
    
    # Standardizza
    user_scaled = scaler.transform(user_df)
    
    # Riduzione dimensionalità
    user_pca = pca.transform(user_scaled)
    
    # Predizione del cluster
    cluster_id = kmeans.predict(user_pca)[0]
    
    # Calcolo distanza dai centroidi per determinare la "forza" dell'appartenenza
    distances = np.sqrt(((user_pca - kmeans.cluster_centers_) ** 2).sum(axis=1))
    normalized_distances = distances / distances.sum()
    belongingness = 1 - (normalized_distances / normalized_distances.max())
    
    # Determina le caratteristiche distintive dell'utente rispetto al centroide
    user_features = []
    centroid = centers.iloc[cluster_id]
    
    # Confronta valori utente con centroidi
    for feature in features:
        user_value = user_df[feature].values[0]
        center_value = centroid[feature]
        
        # Se il valore dell'utente è significativamente diverso dal centroide
        if abs(user_value - center_value) > 0.5 * center_value:
            # Determina se è più alto o più basso
            direction = "alto" if user_value > center_value else "basso"
            user_features.append(f"{feature.replace('_', ' ')}: {direction}")
    
    # Limita a max 3 caratteristiche
    user_features = user_features[:3]
    
    return {
        'cluster_id': int(cluster_id),
        'cluster_name': cluster_descriptions[cluster_id],
        'confidence': float(belongingness[cluster_id]),
        'cluster_features': cluster_features[cluster_id],
        'user_distinctive_features': user_features,
        'cluster_distribution': {
            str(i): float(belongingness[i]) for i in range(N_CLUSTERS)
        }
    }

if __name__ == "__main__":
    # Test di addestramento e predizione
    model_data = train_model()
    
    # Test con un utente di esempio per ogni tipo di segmento
    
    # Utente proprietario attivo
    proprietario_attivo = {
        'properties_viewed_monthly': 15,
        'avg_view_duration_sec': 100,
        'search_count_monthly': 10,
        'msg_sent_monthly': 25,
        'msg_response_rate': 0.9,
        'avg_response_time_hrs': 2,
        'properties_listed': 5,
        'listing_completeness': 0.95,
        'listing_updates_monthly': 8,
        'login_frequency_weekly': 5,
        'session_duration_min': 25,
        'completed_profile': 0.9,
        'subscription_tier': 1,
        'days_since_registration': 180
    }
    
    # Utente cercatore occasionale
    cercatore_occasionale = {
        'properties_viewed_monthly': 30,
        'avg_view_duration_sec': 150,
        'search_count_monthly': 25,
        'msg_sent_monthly': 5,
        'msg_response_rate': 0.5,
        'avg_response_time_hrs': 12,
        'properties_listed': 0,
        'listing_completeness': 0,
        'listing_updates_monthly': 0,
        'login_frequency_weekly': 2,
        'session_duration_min': 15,
        'completed_profile': 0.7,
        'subscription_tier': 0,
        'days_since_registration': 120
    }
    
    # Utente premium
    utente_premium = {
        'properties_viewed_monthly': 50,
        'avg_view_duration_sec': 180,
        'search_count_monthly': 40,
        'msg_sent_monthly': 30,
        'msg_response_rate': 0.8,
        'avg_response_time_hrs': 3,
        'properties_listed': 3,
        'listing_completeness': 1.0,
        'listing_updates_monthly': 5,
        'login_frequency_weekly': 6,
        'session_duration_min': 30,
        'completed_profile': 1.0,
        'subscription_tier': 2,
        'days_since_registration': 300
    }
    
    result1 = predict_user_cluster(proprietario_attivo)
    result2 = predict_user_cluster(cercatore_occasionale)
    result3 = predict_user_cluster(utente_premium)
    
    print(f"Cluster utente 1: {result1['cluster_name']} (id: {result1['cluster_id']}, confidenza: {result1['confidence']:.2f})")
    print(f"Cluster utente 2: {result2['cluster_name']} (id: {result2['cluster_id']}, confidenza: {result2['confidence']:.2f})")
    print(f"Cluster utente 3: {result3['cluster_name']} (id: {result3['cluster_id']}, confidenza: {result3['confidence']:.2f})")