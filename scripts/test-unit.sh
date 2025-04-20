#!/bin/bash
echo "Esecuzione test unitari..."
npx jest --config jest.unit.config.js "$@"