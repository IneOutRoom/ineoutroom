"""
Script per avviare il servizio ML
"""

import os
import sys
import subprocess
import time

def start_ml_service():
    """
    Avvia il servizio ML
    """
    print("Avvio del servizio ML...")
    
    # Cambia la directory corrente nella directory dello script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Verifica che i modelli siano pronti
    print("Inizializzazione modelli...")
    
    # Importa i moduli e precarica i modelli
    import dynamic_pricing
    import predictive_churn
    import user_clustering
    
    dynamic_pricing.load_model()
    predictive_churn.load_model()
    user_clustering.load_model()
    
    print("Modelli inizializzati!")
    
    # Avvia l'API Flask
    print("Avvio dell'API Flask sulla porta 5001...")
    
    try:
        # Avvia l'API e reindirizza l'output
        from api import app
        app.run(host='0.0.0.0', port=5001)
    except Exception as e:
        print(f"Errore nell'avvio dell'API Flask: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_ml_service()