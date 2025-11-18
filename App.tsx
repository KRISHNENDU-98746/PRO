
import React, { useState, useCallback, useEffect } from 'react';
import { AppConfig } from './types';
import { generateAppConfig, generateFlutterCode } from './services/geminiService';
import AppRenderer from './components/AppRenderer';
import CodeBlock from './components/CodeBlock';
import Loader from './components/Loader';
import { BuildIcon, EyeIcon, FlutterIcon, A0DevLogo, CentralAppIcon, GlobeIcon, UserAvatarIcon } from './components/icons';

type View = 'preview' | 'flutter';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [flutterCode, setFlutterCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('preview');

  const handleGenerateApp = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your app.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCodeError(null);
    setAppConfig(null);
    setFlutterCode(null);

    try {
      const config = await generateAppConfig(prompt);
      setAppConfig(config);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    if (appConfig) {
      const generateCode = async () => {
        setIsGeneratingCode(true);
        setCodeError(null);
        try {
          const code = await generateFlutterCode(appConfig);
          setFlutterCode(code);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while generating code.';
          setCodeError(errorMessage);
        } finally {
          setIsGeneratingCode(false);
        }
      };
      generateCode();
    }
  }, [appConfig]);

  const handleStartOver = () => {
    setAppConfig(null);
    setFlutterCode(null);
    setPrompt('');
    setError(null);
    setCodeError(null);
    setActiveView('preview');
  };
  
  const examplePrompts = [
    'A baby name swiper app',
    'An excuse generator',
    'A conversation starter for parties',
  ];

  if (!appConfig) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text-primary overflow-hidden">
        <div className="absolute inset-0 bg-stars opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-overlay"></div>
        
        <header className="relative z-10 w-full px-6 py-4">
            <div className="flex items-center justify-between mx-auto max-w-7xl">
                <A0DevLogo className="h-6" />
                <nav className="hidden md:flex items-center gap-6 text-sm text-brand-text-secondary">
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Home</a>
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Careers</a>
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Showcase</a>
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Blog</a>
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Docs</a>
                </nav>
                <button className="flex items-center gap-2 bg-white/10 text-sm font-medium px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                    <UserAvatarIcon className="w-5 h-5 rounded-full" />
                    My Apps
                </button>
            </div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
            <CentralAppIcon className="w-16 h-16 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Hey, let's build your AI app!
            </h1>
            
            <div className="w-full max-w-2xl mx-auto">
                <div className="relative p-1.5 bg-black/20 rounded-2xl border border-white/10 shadow-[0_0_25px_theme(colors.brand.glow/0.4)]">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Make a game where players can..."
                        className="w-full bg-transparent text-white placeholder-gray-500 text-lg pl-4 pr-32 py-4 h-16 resize-none focus:outline-none"
                    />
                    <div className="absolute left-3 bottom-3 flex items-center gap-2">
                        <button className="flex items-center gap-1.5 bg-white/5 text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
                            <GlobeIcon className="w-4 h-4" />
                            Public
                        </button>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button 
                          onClick={handleGenerateApp}
                          disabled={isLoading}
                          className="bg-white text-black font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Building...' : 'Build it'} &rarr;
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>

            <div className="mt-8 flex gap-3 flex-wrap justify-center items-center">
              <p className="text-sm text-brand-text-secondary">Or try an example:</p>
                {examplePrompts.map(p => (
                    <button key={p} onClick={() => setPrompt(p)} className="px-4 py-1.5 bg-white/5 border border-white/10 text-sm rounded-full hover:bg-white/10 transition-colors">
                        {p}
                    </button>
                ))}
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
      {/* Left Panel: Builder */}
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 md:p-6 flex flex-col border-r border-brand-border">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BuildIcon className="w-8 h-8 text-brand-primary" />
            <h1 className="text-2xl font-bold ml-3">AI App Builder</h1>
          </div>
           <button 
              onClick={handleStartOver} 
              className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              Start Over
            </button>
        </header>
        <div className="flex-grow flex flex-col bg-brand-surface p-4 rounded-lg border border-brand-border">
          <h2 className="font-semibold text-lg mb-2">Original Prompt</h2>
          <p className="bg-brand-bg/50 p-3 rounded-md text-sm text-brand-text-secondary italic">"{prompt}"</p>
        </div>
      </div>

      {/* Right Panel: Preview/Code */}
      <main className="w-full md:w-1/2 lg:w-2/3 xl:w-3/4 p-4 md:p-6 flex flex-col">
        {appConfig && (
          <div className="mb-4">
            <div className="flex border-b border-brand-border">
              <button
                onClick={() => setActiveView('preview')}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${activeView === 'preview' ? 'border-b-2 border-brand-primary text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
              >
                <EyeIcon className="w-5 h-5 mr-2" /> Preview
              </button>
              <button
                onClick={() => setActiveView('flutter')}
                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${activeView === 'flutter' ? 'border-b-2 border-brand-primary text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
              >
                <FlutterIcon className="w-5 h-5 mr-2" /> Flutter Code
              </button>
            </div>
          </div>
        )}
        <div className="flex-grow bg-brand-surface rounded-lg border border-brand-border overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader message="Generating your app's blueprint..." />
            </div>
          ) : activeView === 'preview' ? (
            <AppRenderer config={appConfig} />
          ) : (
            <div className="p-4">
              {isGeneratingCode ? (
                <div className="flex items-center justify-center h-full">
                  <Loader message="Generating Flutter code..." />
                </div>
              ) : codeError ? (
                  <p className="text-red-400 p-4">{codeError}</p>
              ) : (
                <CodeBlock code={flutterCode || ''} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
