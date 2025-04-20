#!/bin/bash

# Script per avviare il servizio ML
echo "Avvio del servizio di Machine Learning..."
cd "$(dirname "$0")"
python3 ml/start_ml_service.py