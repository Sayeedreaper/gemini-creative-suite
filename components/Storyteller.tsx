import React, { useState } from 'react';
import { Upload, BookOpen, Volume2, Loader2, Sparkles, StopCircle } from 'lucide-react';
import { StoryState } from '../types';
import { generateStoryFromImage, speakText } from '../services/geminiService';

export const Storyteller: React.FC = () => {
  const [state, setState] = useState<StoryState>({
    image: null,
    imagePreview: null,
    generatedStory: '',
    isLoading: false,
    isPlayingAudio: false,
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
        generatedStory: '', 
        error: null 
      }));
    }
  };

  const handleGenerateStory = async () => {
    if (!state.image) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null, generatedStory: '' }));

    try {
      const story = await generateStoryFromImage(state.image);
      setState(prev => ({ ...prev, generatedStory: story }));
    } catch (error) {
      setState(prev => ({ ...prev, error: "Failed to generate story. Please try a different image." }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleReadAloud = async () => {
    if (!state.generatedStory || state.isPlayingAudio) return;

    setState(prev => ({ ...prev, isPlayingAudio: true }));

    try {
      await speakText(state.generatedStory);
    } catch (error) {
      console.error("TTS error", error);
      // Note: Error handling for audio playback failures is minimal here for brevity, 
      // but in production you'd want to show a toast.
    } finally {
      setState(prev => ({ ...prev, isPlayingAudio: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 h-full overflow-y-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 inline-block mb-3">
          Visual Storyteller
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Transform any image into a captivating narrative. Upload a scene, and let AI ghostwrite the opening chapter—then hear it brought to life.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Image Upload Section */}
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
           <div className="relative bg-slate-900 rounded-2xl p-1 flex flex-col items-center justify-center overflow-hidden min-h-[200px] border border-slate-800">
                {!state.imagePreview ? (
                    <label className="w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors rounded-xl">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Upload className="w-8 h-8 text-purple-400" />
                        </div>
                        <span className="text-lg font-medium text-slate-300">Choose a scene to inspire your story</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="relative w-full">
                        <img 
                            src={state.imagePreview} 
                            alt="Story Inspiration" 
                            className="w-full h-64 md:h-96 object-cover rounded-xl opacity-60" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                            <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-300 border border-white/10">
                                {state.image?.name}
                            </span>
                            <button 
                                onClick={() => setState(prev => ({...prev, image: null, imagePreview: null, generatedStory: ''}))}
                                className="text-xs text-red-300 hover:text-red-200 bg-red-900/50 px-3 py-1 rounded-full backdrop-blur-md transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                )}
           </div>
        </div>

        {/* Action Button */}
        {state.image && !state.generatedStory && (
            <div className="flex justify-center">
                <button
                    onClick={handleGenerateStory}
                    disabled={state.isLoading}
                    className="group relative px-8 py-4 bg-slate-900 rounded-full overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all disabled:opacity-70"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-3 text-white font-bold text-lg">
                        {state.isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Weaving Narrative...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                <span>Generate Story</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        )}

        {/* Story Output */}
        {state.generatedStory && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BookOpen className="w-40 h-40 text-purple-400" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                             <h3 className="text-2xl font-serif text-purple-200 italic">The Opening...</h3>
                             <button
                                onClick={handleReadAloud}
                                disabled={state.isPlayingAudio}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    state.isPlayingAudio 
                                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 animate-pulse cursor-wait' 
                                    : 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg'
                                }`}
                             >
                                {state.isPlayingAudio ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Narrating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Volume2 className="w-4 h-4" />
                                        <span>Read Aloud</span>
                                    </>
                                )}
                             </button>
                        </div>
                        
                        <div className="prose prose-lg prose-invert prose-p:leading-relaxed prose-p:font-light prose-p:text-slate-300 max-w-none font-serif border-l-4 border-purple-500/30 pl-6">
                            <p className="whitespace-pre-wrap">{state.generatedStory}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {state.error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-center">
                {state.error}
            </div>
        )}
      </div>
    </div>
  );
};
