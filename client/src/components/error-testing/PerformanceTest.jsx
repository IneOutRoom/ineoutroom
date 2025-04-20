// PerformanceTest.jsx - Componente per test di performance API
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Activity, BarChart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

export function PerformanceTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTestPerformance = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const response = await fetch('/api/test-latency');
      const data = await response.json();
      const end = performance.now();
      
      const clientLatency = Math.round(end - start);
      
      setTestResults({
        success: data.success,
        serverLatency: data.latency,
        clientLatency,
        timestamp: data.timestamp || new Date().toISOString()
      });
      
      toast({
        title: "Test di performance completato",
        description: `Latenza server: ${data.latency}ms, Latenza client: ${clientLatency}ms`,
      });
    } catch (error) {
      toast({
        title: "Errore test performance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart className="h-5 w-5 text-blue-500" />
          Test Performance API
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 mb-4">
          Verifica i tempi di risposta dell'API con delay artificiale di 100ms
        </p>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleTestPerformance}
          disabled={loading}
          className="w-full border-blue-300 hover:bg-blue-100 hover:text-blue-700"
        >
          <Activity className="mr-2 h-4 w-4 text-blue-600" />
          {loading ? 'Test in corso...' : 'Esegui test di performance'}
        </Button>
      </CardContent>
      
      {testResults && (
        <CardFooter className="pt-0">
          <div className="w-full text-xs p-2 bg-blue-100 rounded">
            <div className="flex justify-between gap-2 mb-1">
              <span className="font-medium">Server latency:</span>
              <Badge variant="outline" className="bg-white border-blue-300">
                {testResults.serverLatency}ms
              </Badge>
            </div>
            <div className="flex justify-between gap-2 mb-1">
              <span className="font-medium">Client latency:</span>
              <Badge variant="outline" className="bg-white border-blue-300">
                {testResults.clientLatency}ms
              </Badge>
            </div>
            <div className="flex justify-between gap-2">
              <span className="font-medium">Timestamp:</span>
              <span className="text-[10px] text-gray-600">
                {new Date(testResults.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}