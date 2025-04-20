#!/bin/bash
echo "Esecuzione di tutti i test..."
echo "=============================="
echo "Test unitari:"
./scripts/test-unit.sh
TEST_UNIT_STATUS=$?

echo "=============================="
echo "Test di integrazione:"
./scripts/test-integration.sh
TEST_INTEGRATION_STATUS=$?

if [ $TEST_UNIT_STATUS -eq 0 ] && [ $TEST_INTEGRATION_STATUS -eq 0 ]; then
  echo "=============================="
  echo "✅ Tutti i test sono passati con successo!"
  exit 0
else
  echo "=============================="
  echo "❌ Alcuni test sono falliti."
  exit 1
fi