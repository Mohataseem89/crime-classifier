import React, { useState, useRef } from 'react';
import { Upload, Play, Download, FileText, BarChart3, Settings, AlertCircle, CheckCircle, Loader } from 'lucide-react';

// Keep the same component name as you defined
const ClassifierGUI = () => {
  const [trainingData, setTrainingData] = useState(null);
  const [testData, setTestData] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [results, setResults] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('training');
  const [classificationInput, setClassificationInput] = useState('');
  const [classificationResult, setClassificationResult] = useState(null);

  const trainingFileRef = useRef();
  const testFileRef = useRef();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const handleFileUpload = (file, setData, dataType) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',');

        if (!headers.includes('NARRATIVE') || !headers.includes('classification')) {
          addLog(`Error: ${dataType} file must contain 'NARRATIVE' and 'classification' columns`, 'error');
          return;
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            headers.forEach((header, index) => {
              row[header.trim()] = values[index]?.trim() || '';
            });
            data.push(row);
          }
        }

        setData(data);
        addLog(`${dataType} data loaded: ${data.length} records`, 'success');
      } catch (error) {
        addLog(`Error loading ${dataType} data: ${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const simulateTraining = async () => {
    if (!trainingData) {
      addLog('Please upload training data first', 'error');
      return;
    }

    setIsTraining(true);
    addLog('Starting model training...', 'info');

    const steps = [
      'Preprocessing text data...',
      'Tokenizing narratives...',
      'Extracting features...',
      'Training Linear SVC model...',
      'Training Maximum Entropy model...',
      'Validating models...'
    ];

    for (let i = 0; i < steps.length; i++) {
      addLog(steps[i], 'info');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setModelTrained(true);
    setIsTraining(false);
    addLog('Models trained successfully!', 'success');
  };

  const simulateTesting = async () => {
    if (!modelTrained) {
      addLog('Please train the models first', 'error');
      return;
    }

    if (!testData) {
      addLog('Please upload test data first', 'error');
      return;
    }

    setIsTesting(true);
    addLog('Starting classification testing...', 'info');

    const mockResults = testData.map((item, index) => {
      const classifications = ['THEFT', 'ASSAULT', 'VANDALISM', 'BURGLARY', 'FRAUD'];
      const actual = item.classification || classifications[Math.floor(Math.random() * classifications.length)];
      const maxent = classifications[Math.floor(Math.random() * classifications.length)];
      const svc = classifications[Math.floor(Math.random() * classifications.length)];

      return {
        id: index + 1,
        narrative: item.NARRATIVE?.substring(0, 100) + '...',
        actual,
        maxent,
        svc,
        maxentCorrect: actual === maxent,
        svcCorrect: actual === svc
      };
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    setResults(mockResults);

    const maxentAccuracy = (mockResults.filter(r => r.maxentCorrect).length / mockResults.length * 100).toFixed(1);
    const svcAccuracy = (mockResults.filter(r => r.svcCorrect).length / mockResults.length * 100).toFixed(1);

    setAccuracy({ maxent: maxentAccuracy, svc: svcAccuracy });
    setIsTesting(false);
    addLog(`Testing completed. MaxEnt: ${maxentAccuracy}% | SVC: ${svcAccuracy}%`, 'success');
  };

  const classifyText = async () => {
    if (!modelTrained) {
      addLog('Please train the models first', 'error');
      return;
    }

    if (!classificationInput.trim()) {
      addLog('Please enter text to classify', 'error');
      return;
    }

    addLog('Classifying text...', 'info');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const classifications = ['THEFT', 'ASSAULT', 'VANDALISM', 'BURGLARY', 'FRAUD'];
    const result = {
      maxent: classifications[Math.floor(Math.random() * classifications.length)],
      svc: classifications[Math.floor(Math.random() * classifications.length)],
      confidence: {
        maxent: (Math.random() * 0.3 + 0.7).toFixed(3),
        svc: (Math.random() * 0.3 + 0.7).toFixed(3)
      }
    };

    setClassificationResult(result);
    addLog('Text classified successfully', 'success');
  };

  const exportResults = () => {
    if (results.length === 0) {
      addLog('No results to export', 'error');
      return;
    }

    const csv = [
      'ID,Narrative,Actual,MaxEnt,SVC,MaxEnt_Correct,SVC_Correct',
      ...results.map(r =>
        `${r.id},"${r.narrative}",${r.actual},${r.maxent},${r.svc},${r.maxentCorrect},${r.svcCorrect}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'classification_results.csv';
    a.click();
    URL.revokeObjectURL(url);

    addLog('Results exported successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6" />
               Classification System
            </h1>
            <p className="text-blue-100 mt-1">Advanced text classification using machine learning</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'training', label: 'Model Training', icon: Settings },
                { id: 'testing', label: 'Batch Testing', icon: BarChart3 },
                { id: 'classify', label: 'Single Classification', icon: Play },
                { id: 'logs', label: 'System Logs', icon: AlertCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Training Tab */}
            {activeTab === 'training' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Training Data Upload */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Training Data
                    </h3>
                    <input
                      ref={trainingFileRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e.target.files[0], setTrainingData, 'Training')}
                      className="hidden"
                    />
                    <button
                      onClick={() => trainingFileRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload CSV file</p>
                        <p className="text-xs text-gray-500 mt-1">Must contain NARRATIVE and classification columns</p>
                      </div>
                    </button>
                    {trainingData && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {trainingData.length} records loaded
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Model Training */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Model Training
                    </h3>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>• Linear SVC with TF-IDF</p>
                        <p>• Maximum Entropy Classifier</p>
                        <p>• Snowball Stemmer preprocessing</p>
                        <p>• Bigram feature extraction</p>
                      </div>
                      <button
                        onClick={simulateTraining}
                        disabled={isTraining || !trainingData}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isTraining ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Training Models...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Train Models
                          </>
                        )}
                      </button>
                      {modelTrained && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Models trained successfully
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Testing Tab */}
            {activeTab === 'testing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Test Data
                    </h3>
                    <input
                      ref={testFileRef}
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e.target.files[0], setTestData, 'Test')}
                      className="hidden"
                    />
                    <button
                      onClick={() => testFileRef.current?.click()}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Upload test CSV</p>
                      </div>
                    </button>
                    {testData && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {testData.length} records loaded
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Run Tests
                    </h3>
                    <button
                      onClick={simulateTesting}
                      disabled={isTesting || !modelTrained || !testData}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isTesting ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Start Testing
                        </>
                      )}
                    </button>
                  </div>

                  {accuracy && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Accuracy
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">MaxEnt:</span>
                          <span className="font-semibold text-blue-600">{accuracy.maxent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Linear SVC:</span>
                          <span className="font-semibold text-green-600">{accuracy.svc}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {results.length > 0 && (
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-lg font-semibold">Classification Results</h3>
                      <button
                        onClick={exportResults}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export CSV
                      </button>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Narrative</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Actual</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">MaxEnt</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Linear SVC</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {results.slice(0, 10).map(result => (
                            <tr key={result.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{result.id}</td>
                              <td className="px-4 py-2 text-sm max-w-xs truncate">{result.narrative}</td>
                              <td className="px-4 py-2 text-sm font-medium">{result.actual}</td>
                              <td className={`px-4 py-2 text-sm ${result.maxentCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {result.maxent} {result.maxentCorrect ? '✓' : '✗'}
                              </td>
                              <td className={`px-4 py-2 text-sm ${result.svcCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {result.svc} {result.svcCorrect ? '✓' : '✗'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {results.length > 10 && (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Showing first 10 of {results.length} results
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Single Classification Tab */}
            {activeTab === 'classify' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Classify Individual Text</h3>
                  <textarea
                    value={classificationInput}
                    onChange={(e) => setClassificationInput(e.target.value)}
                    placeholder="Enter incident narrative to classify..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={classifyText}
                    disabled={!modelTrained || !classificationInput.trim()}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Classify Text
                  </button>
                </div>

                {classificationResult && (
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Classification Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800">Maximum Entropy</h4>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{classificationResult.maxent}</p>
                        <p className="text-sm text-blue-600">Confidence: {classificationResult.confidence.maxent}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800">Linear SVC</h4>
                        <p className="text-2xl font-bold text-green-600 mt-2">{classificationResult.svc}</p>
                        <p className="text-sm text-green-600">Confidence: {classificationResult.confidence.svc}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Logs
                </h3>
                <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p>No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-500">[{log.timestamp}]</span>
                        <span className={`ml-2 ${
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'success' ? 'text-green-400' :
                          'text-blue-400'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed the App function to use the correct component name
function App() {
  return (
    <div className="App">
      <ClassifierGUI />
    </div>
  );
}

export default App;
