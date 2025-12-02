import React, { useState } from 'react';
import { PolyCount, GenerationConfig } from '../types';
import { Sparkles, Box, Layers, Image as ImageIcon } from 'lucide-react';

interface ControlsProps {
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [polyCount, setPolyCount] = useState<PolyCount>(PolyCount.MEDIUM);
  const [includeTexture, setIncludeTexture] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ prompt, polyCount, includeTexture });
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full bg-gray-900 border-r border-gray-800 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-500/20">
            <Box className="w-6 h-6 text-white" />
        </div>
        <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Aether3D
            </h1>
            <p className="text-xs text-gray-500">Generative Asset Engine</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A rusty metal barrel with hazard stripes..."
            className="w-full h-32 bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
            required
          />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Geometry Detail
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(PolyCount).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPolyCount(level)}
                  className={`py-2 px-3 text-xs font-medium rounded-md transition-all border ${
                    polyCount === level
                      ? 'bg-gray-800 border-primary-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : 'bg-gray-950 border-gray-800 text-gray-500 hover:bg-gray-900'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-950 rounded-lg border border-gray-800">
             <div className="flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-gray-400" />
                 <span className="text-sm text-gray-300">Generate Texture</span>
             </div>
             <button
               type="button"
               role="switch"
               aria-checked={includeTexture}
               onClick={() => setIncludeTexture(!includeTexture)}
               className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                 includeTexture ? 'bg-primary-600' : 'bg-gray-700'
               }`}
             >
               <span
                 className={`inline-block h-3 w-3 transform rounded-full bg-white transition duration-200 ease-in-out ${
                   includeTexture ? 'translate-x-5' : 'translate-x-1'
                 }`}
               />
             </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="group relative w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {isGenerating ? 'Computing...' : 'Generate Asset'}
                {!isGenerating && <Sparkles className="w-4 h-4 group-hover:animate-pulse" />}
            </span>
            {/* Glossy effect */}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </form>

      <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Model: Gemini 2.5 Flash</span>
              <span>v1.0.0</span>
          </div>
      </div>
    </div>
  );
};
