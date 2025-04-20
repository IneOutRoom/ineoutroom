#!/bin/bash
echo "Esecuzione test con report di copertura..."
npx jest --config jest.unit.config.js --coverage
echo "Il report di copertura è disponibile nella cartella coverage/"