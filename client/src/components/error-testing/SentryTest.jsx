// SentryTest.jsx - Componente per testare l'integrazione Sentry
import React, { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '../ui/button';
import { PerformanceTest } from './PerformanceTest';

export function SentryTest() {
  const [errorResults, setErrorResults] = useState([]);

  // Test diversi tipi di errori per verificare l'integrazione Sentry
  const testUndefinedFunction = () => {
    try {
      // Genera un errore chiamando una funzione non definita
      // eslint-disable-next-line no-undef
      myUndefinedFunction();
    } catch (error) {
      // Cattura l'errore e lo invia a Sentry
      Sentry.captureException(error);
      addErrorResult('myUndefinedFunction', error.message);
    }
  };

  const testReferenceError = () => {
    try {
      // Genera un errore di riferimento a una variabile non definita
      // eslint-disable-next-line no-undef
      console.log(myUndefinedVariable);
    } catch (error) {
      Sentry.captureException(error);
      addErrorResult('ReferenceError', error.message);
    }
  };

  const testTypeError = () => {
    try {
      // Genera un errore di tipo chiamando un metodo su null
      const obj = null;
      obj.method();
    } catch (error) {
      Sentry.captureException(error);
      addErrorResult('TypeError', error.message);
    }
  };

  const testCustomError = () => {
    try {
      throw new Error('Questo è un errore personalizzato per il test di Sentry');
    } catch (error) {
      Sentry.captureException(error);
      addErrorResult('CustomError', error.message);
    }
  };

  const testApiError = async () => {
    try {
      const response = await fetch('/api/test-error');
      const data = await response.json();
      
      addErrorResult('API Error', `Test API: ${data.message}. Errore: ${data.error}`);
    } catch (error) {
      addErrorResult('API Error', `Errore di rete: ${error.message}`);
    }
  };
  
  // Funzione per aggiungere un risultato di test alla lista
  const addErrorResult = (type, message) => {
    setErrorResults(prev => [
      { id: Date.now(), type, message, timestamp: new Date().toISOString() },
      ...prev.slice(0, 4) // Mantieni solo gli ultimi 5 risultati
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">Test Sentry Error Monitoring</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={testUndefinedFunction}
            className="border-orange-300 hover:bg-orange-100 hover:text-orange-700"
          >
            Test Undefined Function
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={testReferenceError}
            className="border-red-300 hover:bg-red-100 hover:text-red-700"
          >
            Test Reference Error
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={testTypeError}
            className="border-purple-300 hover:bg-purple-100 hover:text-purple-700"
          >
            Test Type Error
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={testCustomError}
            className="border-blue-300 hover:bg-blue-100 hover:text-blue-700"
          >
            Test Custom Error
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={testApiError}
            className="border-green-300 hover:bg-green-100 hover:text-green-700"
          >
            Test API Error
          </Button>
        </div>
        
        {errorResults.length > 0 && (
          <div className="border rounded p-2 bg-gray-50 max-h-64 overflow-auto">
            <h3 className="text-sm font-medium mb-2">Results:</h3>
            <ul className="space-y-2">
              {errorResults.map(result => (
                <li key={result.id} className="text-xs border-l-2 border-orange-400 pl-2 py-1">
                  <span className="font-semibold">{result.type}:</span> {result.message}
                  <div className="text-[10px] text-gray-500 mt-1">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="border rounded-md p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4">Test API Performance</h2>
        <PerformanceTest />
      </div>
    </div>
  );
}