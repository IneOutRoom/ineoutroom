#!/bin/bash
echo "Esecuzione test di integrazione..."
npx jest --config jest.integration.config.js "$@"