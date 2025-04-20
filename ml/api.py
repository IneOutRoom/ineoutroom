"""
API Flask per i modelli di machine learning
Espone endpoint per:
- Dynamic pricing
- Predictive churn
- User clustering
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import json

# Import dei moduli ML
import dynamic_pricing
import predictive_churn
import user_clustering

app = Flask(__name__)
CORS(app)  # Abilita CORS per consentire richieste dal frontend

@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint per controllare lo stato dell'API
    """
    return jsonify({
        'status': 'online',
        'models': {
            'dynamic_pricing': True,
            'predictive_churn': True,
            'user_clustering': True
        }
    })

@app.route('/dynamic-pricing', methods=['POST'])
def price_suggestion():
    """
    Endpoint per il dynamic pricing
    Richiede un JSON con i dati della proprietà
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Chiama il modello di dynamic pricing
        result = dynamic_pricing.predict_price_change(data)
        
        return jsonify(result)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/churn', methods=['POST'])
def churn_prediction():
    """
    Endpoint per la previsione di churn
    Richiede un JSON con i dati dell'utente
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Chiama il modello di churn prediction
        result = predictive_churn.predict_churn_risk(data)
        
        return jsonify(result)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/cluster', methods=['POST'])
def user_segment():
    """
    Endpoint per il clustering degli utenti
    Richiede un JSON con i dati dell'utente
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Chiama il modello di clustering
        result = user_clustering.predict_user_cluster(data)
        
        return jsonify(result)
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# Per addestramento manuale dei modelli
@app.route('/train', methods=['POST'])
def train_models():
    """
    Endpoint per addestrare manualmente i modelli
    """
    try:
        data = request.json or {}
        models_to_train = data.get('models', ['dynamic_pricing', 'predictive_churn', 'user_clustering'])
        
        results = {}
        
        if 'dynamic_pricing' in models_to_train:
            print("Addestramento modello dynamic pricing...")
            dynamic_pricing.train_model()
            results['dynamic_pricing'] = 'trained'
        
        if 'predictive_churn' in models_to_train:
            print("Addestramento modello predictive churn...")
            predictive_churn.train_model()
            results['predictive_churn'] = 'trained'
        
        if 'user_clustering' in models_to_train:
            print("Addestramento modello user clustering...")
            user_clustering.train_model()
            results['user_clustering'] = 'trained'
        
        return jsonify({
            'status': 'success',
            'results': results
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Assicurati che i modelli siano pronti
    print("Inizializzazione modelli...")
    dynamic_pricing.load_model()
    predictive_churn.load_model()
    user_clustering.load_model()
    print("Modelli inizializzati!")
    
    # Avvia l'API
    app.run(host='0.0.0.0', port=5001, debug=True)