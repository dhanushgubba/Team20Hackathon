import React from 'react';

export const ConfusionMatrix = ({ metrics, modelName }) => {
  const total = metrics.truePositives + metrics.trueNegatives + metrics.falsePositives + metrics.falseNegatives;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{modelName} - Confusion Matrix</h3>
        <p className="text-sm text-gray-600">Model performance metrics and classification results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Classification Matrix</h4>
          <div className="relative">
            <div className="grid grid-cols-3 gap-2">
              {/* Header row */}
              <div></div>
              <div className="text-center font-medium text-gray-700 py-2">Predicted Fraud</div>
              <div className="text-center font-medium text-gray-700 py-2">Predicted Normal</div>

              {/* Actual Fraud row */}
              <div className="font-medium text-gray-700 py-2 text-right pr-4">Actual Fraud</div>
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-800">{metrics.truePositives}</div>
                <div className="text-xs text-red-600">True Positives</div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{metrics.falseNegatives}</div>
                <div className="text-xs text-red-600">False Negatives</div>
              </div>

              {/* Actual Normal row */}
              <div className="font-medium text-gray-700 py-2 text-right pr-4">Actual Normal</div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{metrics.falsePositives}</div>
                <div className="text-xs text-green-600">False Positives</div>
              </div>
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-800">{metrics.trueNegatives}</div>
                <div className="text-xs text-green-600">True Negatives</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Performance Metrics</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Accuracy</span>
              <span className="text-lg font-semibold text-blue-600">{(metrics.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Precision</span>
              <span className="text-lg font-semibold text-green-600">{(metrics.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Recall (Sensitivity)</span>
              <span className="text-lg font-semibold text-amber-600">{(metrics.recall * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">F1-Score</span>
              <span className="text-lg font-semibold text-purple-600">{(metrics.f1Score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">AUC</span>
              <span className="text-lg font-semibold text-red-600">{(metrics.auc * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Total Transactions:</strong> {total.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
