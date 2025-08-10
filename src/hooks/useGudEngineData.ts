import { useState, useCallback, useEffect } from 'react';

export interface SwapData {
  timestamp: number;
  destTokenAmount: number; // Uniswap V4 actual amount
  gudEngineAmount: number; // GUD Engine expected amount
  difference: number;
  srcToken: string;
  destToken: string;
  senderAddress: string;
}

export const useGudEngineData = () => {
  const [swapHistory, setSwapHistory] = useState<SwapData[]>([]);

  // Listen for real swap data from uniV4_indexer.js
  useEffect(() => {
    const handleSwapData = (event: CustomEvent) => {
      console.log('🎯 GUD Engine: Received swap data event:', event.detail);
      const swapData = event.detail;
      addSwapData(swapData);
    };

    console.log('🎯 GUD Engine: Setting up event listener for gudSwapData');
    
    // Add event listener for custom events from the indexer
    window.addEventListener('gudSwapData', handleSwapData as EventListener);

    return () => {
      console.log('🎯 GUD Engine: Removing event listener');
      window.removeEventListener('gudSwapData', handleSwapData as EventListener);
    };
  }, []);

  // Function to add real swap data from console logs
  const addSwapData = useCallback((data: Omit<SwapData, 'timestamp'>) => {
    console.log('🎯 GUD Engine: Adding swap data:', data);
    
    const newData: SwapData = {
      ...data,
      timestamp: Date.now(),
    };
    
    setSwapHistory(prev => {
      const updated = [...prev, newData];
      console.log('🎯 GUD Engine: Updated swap history, total entries:', updated.length);
      // Keep only last 100 data points for performance
      return updated.slice(-100);
    });
  }, []);

  // Function to manually add console data (for immediate testing)
  const addConsoleData = useCallback(() => {
    console.log('🎯 GUD Engine: Adding console data for immediate testing');
    
    // Sample data based on typical console output - replace with your actual values
    const consoleData: Omit<SwapData, 'timestamp'>[] = [
      {
        destTokenAmount: 42389,
        gudEngineAmount: 42458 ,
        difference: 69,
        srcToken: "0x...",
        destToken: "0x...",
        senderAddress: "0x...",
      },
      {
        destTokenAmount: 42311,
        gudEngineAmount:42390 ,
        difference: 79,
        srcToken: "0x...",
        destToken: "0x...",
        senderAddress: "0x...",
      },
      {
        destTokenAmount: 21095,
        gudEngineAmount: 21217,
        difference: 122,
        srcToken: "0x...",
        destToken: "0x...",
        senderAddress: "0x...",
      }
    ];

    // Add each data point with staggered timestamps
    consoleData.forEach((data, index) => {
      const timestamp = Date.now() - (consoleData.length - index) * 60000; // 1 minute apart
      const newData: SwapData = {
        ...data,
        timestamp,
      };
      
      setSwapHistory(prev => {
        const updated = [...prev, newData];
        console.log(`🎯 GUD Engine: Added console data ${index + 1}, total entries:`, updated.length);
        return updated.slice(-100);
      });
    });
  }, []);

  // Get data for charts
  const getChartData = useCallback(() => {
    const chartData = swapHistory.map((data, index) => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      destAmount: data.destTokenAmount,
      gudAmount: data.gudEngineAmount,
      difference: data.difference,
      index,
    }));
    console.log('🎯 GUD Engine: Chart data:', chartData);
    return chartData;
  }, [swapHistory]);

  // Get latest metrics
  const getLatestMetrics = useCallback(() => {
    if (swapHistory.length === 0) {
      console.log('🎯 GUD Engine: No swap history yet');
      return null;
    }
    
    const latest = swapHistory[swapHistory.length - 1];
    const avgDifference = swapHistory.reduce((sum, data) => sum + data.difference, 0) / swapHistory.length;
    
    const metrics = {
      latestDestAmount: latest.destTokenAmount,
      latestGudAmount: latest.gudEngineAmount,
      latestDifference: latest.difference,
      avgDifference,
      totalSwaps: swapHistory.length,
    };
    
    console.log('🎯 GUD Engine: Latest metrics:', metrics);
    return metrics;
  }, [swapHistory]);

  return {
    swapHistory,
    addSwapData,
    addConsoleData, // New function to add console data
    getChartData,
    getLatestMetrics,
  };
}; 