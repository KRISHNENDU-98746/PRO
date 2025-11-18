import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppConfig } from './types';
import { generateOrRefineAppConfig, generateFlutterCode, GenerationResult } from './services/geminiService';
import { deploy, DeploymentResult } from './a0';
import { User, onAuthStateChanged, initializeGoogleSignIn, renderGoogleButton, signOut } from './authService';
import AppRenderer from './components/AppRenderer';
import CodeBlock from './components/CodeBlock';
import Loader from './components/Loader';
import { BuildIcon, EyeIcon, FlutterIcon, A0DevLogo, CentralAppIcon, GlobeIcon, SendIcon, DeployIcon, CloseIcon, ClipboardIcon, CheckIcon, SparklesIcon, FileCodeIcon, GoogleIcon, SignOutIcon } from './components/icons';

type View = 'preview' | 'flutter';
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
type ExplanationContent = {
  explanation: string;
  filesChanged: string[];
};

type Message = {
  role: 'user' | 'assistant';
  content: string | ExplanationContent;
};

const LoginPage: React.FC = () => {
  const signInButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const attemptRender = () => {
      if (window.google && signInButtonRef.current) {
        renderGoogleButton(signInButtonRef.current);
      } else {
        // Retry if the Google script hasn't loaded yet
        setTimeout(attemptRender, 100);
      }
    };
    attemptRender();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-text-primary">
      <div className="absolute inset-0 bg-stars opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-overlay"></div>
      <div className="relative z-10 text-center p-8 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-2xl shadow-2xl max-w-md">
          <A0DevLogo className="h-8 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Welcome to AI App Builder</h1>
          <p className="text-brand-text-secondary mb-8">Sign in to start creating and deploying apps with AI.</p>
          <div className="flex justify-center">
            <div ref={signInButtonRef}></div>
          </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState<string>('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [flutterCode, setFlutterCode] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<View>('preview');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isUrlCopied, setIsUrlCopied] = useState<boolean>(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAuth = () => {
      if (window.google) {
        initializeGoogleSignIn();
        const unsubscribe = onAuthStateChanged(authUser => {
          setUser(authUser);
          setAuthState(authUser ? 'authenticated' : 'unauthenticated');
        });
        return unsubscribe;
      } else {
        // If Google script is not loaded, retry
        setTimeout(initAuth, 100);
      }
    };
    const unsubscribe = initAuth();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSignOut = async () => {
    await signOut();
    handleStartOver(); // Reset app state on sign out
    setIsProfileMenuOpen(false);
  };

  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const prompt = (messageContent || currentUserInput).trim();
    if (!prompt) {
      setError("Please enter a description for your app.");
      return;
    }
    
    const newMessages: Message[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setCurrentUserInput('');
    setIsLoading(true);
    setError(null);
    setDeploymentError(null);

    try {
      const result: GenerationResult = await generateOrRefineAppConfig({ 
        prompt, 
        config: appConfig, 
        history: messages 
      });
      setAppConfig(result.appConfig);
      setMessages(prev => [...prev, { role: 'assistant', content: {
        explanation: result.explanation,
        filesChanged: result.filesChanged
      }}]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserInput, appConfig, messages]);

  useEffect(() => {
    if (appConfig) {
      const generateCode = async () => {
        setIsGeneratingCode(true);
        setCodeError(null);
        setFlutterCode(null);
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
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleDeploy = async () => {
    if (!flutterCode) return;
    setIsDeploying(true);
    setDeploymentError(null);
    try {
      const result = await deploy(flutterCode);
      setDeploymentResult(result);
      setIsDeployModalOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Deployment failed.';
      setDeploymentError(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };
  
  const handleCopyUrl = () => {
      if(!deploymentResult) return;
      navigator.clipboard.writeText(deploymentResult.url);
      setIsUrlCopied(true);
      setTimeout(() => setIsUrlCopied(false), 2000);
  };

  const handleStartOver = () => {
    setAppConfig(null);
    setFlutterCode(null);
    setCurrentUserInput('');
    setError(null);
    setCodeError(null);
    setDeploymentError(null);
    setMessages([]);
    setActiveView('preview');
  };
  
  const examplePrompts = [
    'A baby name swiper app',
    'An excuse generator',
    'A conversation starter for parties',
  ];

  if (authState === 'loading') {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><Loader /></div>;
  }
  
  if (authState === 'unauthenticated') {
    return <LoginPage />;
  }

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
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Showcase</a>
                    <a href="#" className="hover:text-brand-text-primary transition-colors">Docs</a>
                </nav>
                <div className="relative" ref={profileMenuRef}>
                  <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center gap-2 bg-white/10 text-sm font-medium pl-1 pr-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                      <img src={user?.picture} alt="User" className="w-6 h-6 rounded-full" />
                      {user?.name}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-brand-surface border border-brand-border rounded-lg shadow-lg py-1 z-20">
                      <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-brand-text-secondary hover:bg-brand-bg/50">
                        <SignOutIcon className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
            </div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10">
            <CentralAppIcon className="w-16 h-16 mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Hey, let's build your AI app!
            </h1>
            <div className="w-full max-w-2xl mx-auto">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative p-1.5 bg-black/20 rounded-2xl border border-white/10 shadow-[0_0_25px_theme(colors.brand.glow/0.4)]">
                    <textarea value={currentUserInput} onChange={(e) => setCurrentUserInput(e.target.value)} placeholder="Make a game where players can..." className="w-full bg-transparent text-white placeholder-gray-500 text-lg pl-4 pr-32 py-4 h-16 resize-none focus:outline-none" />
                    <div className="absolute left-3 bottom-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-white/5 text-xs px-3 py-1.5 rounded-lg"><GlobeIcon className="w-4 h-4" />Public</div>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <button type="submit" disabled={isLoading} className="bg-white text-black font-semibold py-2 px-5 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {isLoading ? 'Building...' : 'Build it'} &rarr;
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            </div>
            <div className="mt-8 flex gap-3 flex-wrap justify-center items-center">
              <p className="text-sm text-brand-text-secondary">Or try an example:</p>
                {examplePrompts.map(p => (
                    <button key={p} onClick={() => handleSendMessage(p)} className="px-4 py-1.5 bg-white/5 border border-white/10 text-sm rounded-full hover:bg-white/10 transition-colors">{p}</button>
                ))}
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg">
      {isDeployModalOpen && deploymentResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsDeployModalOpen(false)}>
          <div className="bg-brand-surface rounded-xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsDeployModalOpen(false)} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white"><CloseIcon className="w-6 h-6"/></button>
            <h2 className="text-2xl font-bold text-white mb-2">🚀 Deployed!</h2>
            <p className="text-brand-text-secondary mb-6">Your app is now live. Share it with anyone!</p>
            <div className="bg-white p-4 rounded-lg inline-block mb-6">
                <img src={deploymentResult.qrCode} alt="QR Code" className="w-40 h-40"/>
            </div>
            <div className="flex items-center bg-brand-bg border border-brand-border rounded-lg p-2">
                <input type="text" readOnly value={deploymentResult.url} className="bg-transparent w-full text-brand-text-primary focus:outline-none"/>
                <button onClick={handleCopyUrl} className="bg-brand-primary text-white font-semibold px-3 py-1.5 rounded-md text-sm flex items-center">
                   {isUrlCopied ? <CheckIcon className="w-5 h-5"/> : <ClipboardIcon className="w-5 h-5"/>}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel: Chat */}
      <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 md:p-6 flex flex-col border-r border-brand-border h-screen">
        <header className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center"><BuildIcon className="w-8 h-8 text-brand-primary" /><h1 className="text-2xl font-bold ml-3">AI App Builder</h1></div>
          <button onClick={handleStartOver} className="text-sm text-brand-text-secondary hover:text-brand-text-primary transition-colors">Start Over</button>
        </header>
        <div className="flex-grow flex flex-col bg-brand-surface p-4 rounded-lg border border-brand-border overflow-hidden">
            <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-brand-primary"/></div>}
                    <div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-sm ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-brand-bg'}`}>
                      {typeof msg.content === 'string' ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="text-sm">
                          <p className="whitespace-pre-wrap">{msg.content.explanation}</p>
                          <div className="mt-3 border-t border-brand-border/50 pt-2">
                              <p className="text-xs font-semibold text-brand-text-secondary mb-1">FILES CHANGED:</p>
                              <ul className="text-xs space-y-0.5">
                                  {msg.content.filesChanged.map((file, i) => (
                                      <li key={i} className="flex items-center gap-2 text-brand-text-secondary">
                                          <FileCodeIcon className="w-3.5 h-3.5" />
                                          <span>{file}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-brand-primary"/></div>
                    <div className="px-4 py-2 rounded-lg bg-brand-bg"><Loader/></div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex-shrink-0">
                <textarea value={currentUserInput} onChange={(e) => setCurrentUserInput(e.target.value)} onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage();}}} placeholder="Change the title to..." className="w-full bg-brand-bg border border-brand-border rounded-lg p-3 pr-12 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none transition" rows={2}/>
                <button type="submit" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-primary disabled:opacity-50"><SendIcon className="w-6 h-6"/></button>
            </form>
             {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Right Panel: Preview/Code/Deploy */}
      <main className="w-full md:w-1/2 lg:w-2/3 xl:w-3/4 p-4 md:p-6 flex flex-col h-screen">
        <header className="mb-4 flex justify-between items-center flex-shrink-0">
            <div className="flex border-b border-brand-border">
              <button onClick={() => setActiveView('preview')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${activeView === 'preview' ? 'border-b-2 border-brand-primary text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}><EyeIcon className="w-5 h-5 mr-2" /> Preview</button>
              <button onClick={() => setActiveView('flutter')} className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${activeView === 'flutter' ? 'border-b-2 border-brand-primary text-brand-text-primary' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}><FlutterIcon className="w-5 h-5 mr-2" /> Flutter Code</button>
            </div>
            <button onClick={handleDeploy} disabled={!flutterCode || isDeploying} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition duration-200 disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed">
              {isDeploying ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><DeployIcon className="w-5 h-5 mr-2" /> Deploy</>}
            </button>
        </header>
        {deploymentError && <p className="text-red-400 text-sm mb-2 text-right">{deploymentError}</p>}
        <div className="flex-grow bg-brand-surface rounded-lg border border-brand-border overflow-y-auto">
          {activeView === 'preview' ? (
            <AppRenderer config={appConfig} />
          ) : (
            <div className="p-4 h-full">
              {isGeneratingCode ? (
                <div className="flex items-center justify-center h-full"><Loader message="Generating Flutter code..." /></div>
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
