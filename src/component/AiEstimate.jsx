// src/components/AiEstimate.jsx
import React, { useState, useEffect } from 'react';
import { getSmartPrediction } from '../services/aiPredictor';

const AiEstimate = ({ historyData, userPosition }) => {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    if (userPosition > 0 && historyData.length > 0) {
      getSmartPrediction(historyData, userPosition).then(setPrediction);
    }
  }, [userPosition, historyData]);

  return (
    <div className="p-4 border border-blue-500 rounded-xl bg-slate-900/50">
      <h4 className="text-blue-400 text-xs font-bold uppercase tracking-tighter">AI Prediction</h4>
      <div className="text-2xl font-black">
        {prediction ? `~${prediction.predictedMinutes} min` : "Calculating..."}
      </div>
    </div>
  );
};

export default AiEstimate;