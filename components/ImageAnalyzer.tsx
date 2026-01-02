import React, { useState } from 'react';
import { Upload, X, Search, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeImage } from '../services/geminiService';
import { AnalysisState } from '../types';

export const ImageAnalyzer: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    image: null,
    imagePreview: null,
    prompt: '',
    result: '',
    isLoading: false,
    error: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setState(prev => ({ 
        ...prev, 
        image: file, 
        imagePreview: previewUrl, 
        result: '', 
        error: null 
      }));
    }
  };

  const clearImage = () => {
    if (state.imagePreview) {
        URL.revokeObjectURL(state.imagePreview);
    }
    setState({
      image: null,
      imagePreview: null,
      prompt: '',
      result: '',
      isLoading: false,
      error: null
    });
  };

  const handleAnalyze = async () => {
    if (!state.image) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, result: '' }));

    try {
      const result = await analyzeImage(state.image, state.prompt);
      setState(prev => ({ ...prev, result }));
    } catch (error) {
      setState(prev => ({ ...prev, error: "Failed to analyze image. Please try again." }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Visual Analysis</h2>
        <p className="text-slate-400">Upload an image and ask Gemini to uncover details, identify objects, or explain complex diagrams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input & Preview */}
        <div className="space-y-6">
          {/* Upload Area */}
          {!state.imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-600 transition-colors">
                    <Upload className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="mb-2 text-lg text-slate-300 font-medium">Click to upload image</p>
                <p className="text-sm text-slate-500">SVG, PNG, JPG or GIF (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl group">
              <img src={state.imagePreview} alt="Preview" className="w-full h-auto max-h-[500px] object-contain bg-black/40" />
              <button 
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500/80 backdrop-blur-md text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Prompt Input */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <label className="block text-sm font-medium text-slate-400 mb-2">Custom Prompt (Optional)</label>
            <div className="flex gap-2">
                <input
                type="text"
                value={state.prompt}
                onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="e.g., 'Identify the plants in this image' or 'Explain this chart'"
                className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={!state.image || state.isLoading}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={!state.image || state.isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 rounded-lg font-medium transition-all flex items-center gap-2"
                >
                    {state.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                    Analyze
                </button>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
                <ImageIcon className="text-emerald-400 w-5 h-5" />
                <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
            </div>

            {state.error ? (
                <div className="flex flex-col items-center justify-center flex-1 text-red-400 gap-3 text-center animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="w-12 h-12 opacity-50" />
                    <p>{state.error}</p>
                </div>
            ) : state.result ? (
                <div className="prose prose-invert prose-emerald max-w-none overflow-y-auto flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ReactMarkdown>{state.result}</ReactMarkdown>
                </div>
            ) : state.isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                    </div>
                    <p className="animate-pulse">Examining pixels...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-600 gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                        <Search className="w-10 h-10 opacity-50" />
                    </div>
                    <p>Upload an image to see the magic happen.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
