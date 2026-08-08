import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setCapturedImage(null);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
    setSelectedFile(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile && !capturedImage) {
      alert("Please upload a resume file OR scan using camera!");
      return;
    }
    if (!jobDescription) {
      alert("Please enter job description!");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('jobDescription', jobDescription);
      
      if (selectedFile) {
        formData.append('resume', selectedFile);
      } else if (capturedImage) {
        formData.append('resume', capturedImage);
      }

      const response = await fetch('http://localhost:5000/api/screen-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">AI Resume Screener</h1>
          <p className="text-gray-600 mt-2">Upload or Scan resume and evaluate candidate match score</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">1. Select Resume Source</label>
              
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,image/*"
                className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
              />

              <div className="flex items-center gap-2 my-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-semibold uppercase">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {!showCamera ? (
                <button 
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  📷 Open Camera Scanner
                </button>
              ) : (
                <div className="space-y-2">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={capturePhoto}
                      className="flex-1 bg-green-600 text-white text-xs font-semibold py-2 rounded-md hover:bg-green-700"
                    >
                      Capture Photo
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCamera(false)}
                      className="bg-gray-400 text-white text-xs font-semibold px-3 py-2 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="mt-3 p-2 border rounded-lg bg-emerald-50 flex items-center justify-between">
                  <span className="text-xs text-emerald-800 font-medium">✓ Resume Scanned via Camera</span>
                  <img src={capturedImage} alt="Scanned Resume" className="w-10 h-10 object-cover rounded border" />
                </div>
              )}
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">2. Job Description</label>
                <textarea 
                  rows="4"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste Job Description here..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200"
              >
                {loading ? "Analyzing via Backend..." : "Analyze Resume"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Analysis Result</h2>
            
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Match Score:</span>
                  <span className="text-2xl font-bold text-green-600">{result.score}%</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Matching Skills:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.matchingSkills.map((skill, index) => (
                      <span key={index} className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Missing Skills:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.missingSkills.map((skill, index) => (
                      <span key={index} className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Summary:</p>
                  <p className="text-sm text-gray-700 mt-1">{result.summary}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 my-auto">
                Upload or scan resume and submit to view match results from backend.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}