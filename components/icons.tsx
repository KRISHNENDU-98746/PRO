import React from 'react';

export const BuildIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

export const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export const FlutterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7 14 5-5 5 5-10 10-5-5z"/>
        <path d="m12 19 5-5-5-5-5 5z"/>
    </svg>
);

export const FileCodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6.343 6.343l2.829 2.829m1.414-7.071l2.829-2.829M12 2v4m4.657-1.657l-2.829 2.829M18 5h4m-2 2v4m-3.657 3.657l-2.829-2.829" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export const DeployIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-8 4h.01M12 16h.01" />
    </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 12.12C34.553 8.243 29.626 6 24 6C13.486 6 5 14.486 5 25s8.486 19 19 19s19-8.486 19-19c0-1.042-.124-2.058-.358-3.039l-.031-.078z" />
        <path fill="#FF3D00" d="M6.306 14.691L12.486 19.338C14.116 13.065 18.601 8.846 24 8.846c2.75 0 5.253 1.013 7.159 2.684l5.657-5.657C32.843 2.181 28.62 0 24 0C14.882 0 7.234 6.745 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-4.822C29.211 40.778 26.753 42 24 42c-5.222 0-9.673-3.692-11.088-8.625l-6.521 5.028C9.405 44.594 16.126 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 4.822C41.332 35.617 44 30.564 44 24c0-1.564-.236-3.076-.64-4.533L43.611 20.083z" />
    </svg>
);

export const SignOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);


export const A0DevLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.751 23.952c-2.455 0-4.665-.903-6.63-2.709C3.156 19.437 2.173 17.227 2.173 14.772v-4.14h4.488v3.912c0 1.903.69 3.534 2.07 4.896 1.38 1.362 3.033 2.043 4.959 2.043 1.926 0 3.58-.69 4.959-2.07 1.38-1.38 2.07-3.024 2.07-4.92V4.776h4.488v10.116c0 2.455-.983 4.665-2.949 6.63-1.966 1.965-4.218 2.949-6.756 2.949l-1.737-.027-.228.027Zm17.805-4.596L25.32 8.76h-4.32L17.292 19.32h4.515l.912-2.133h5.715l.94 2.16h4.517Zm-5.46-5.85L26.37 8.76h.057l2.25 4.752h-4.542Z" fill="#fff"></path>
    <path d="M42.103 21.6c-2.34 0-4.23-1.89-4.23-4.23V6.6h2.79v10.77c0 1.05.57 1.77 1.44 1.77.84 0 1.44-.72 1.44-1.77V6.6h2.79v10.77c0 2.34-1.89 4.23-4.23 4.23Z" fill="#fff"></path>
    <path d="M52.753 19.32h-4.59V6.6h4.59v12.72Zm-2.295 4.68c-1.44 0-2.61-1.17-2.61-2.61s1.17-2.61 2.61-2.61 2.61 1.17 2.61 2.61-1.17 2.61-2.61 2.61Z" fill="#fff"></path>
    <path d="M57.253 6.6h2.79v12.72h4.23V6.6h2.79v15h-9.81V6.6Z" fill="#fff"></path>
    <path d="M78.613 12.42c0-3.6-2.25-5.94-5.85-5.94h-4.89v15h2.79V14.1h2.1c2.73 0 3.84 1.5 3.84 3.9v3.6h2.79v-5.18Zm-5.85-3.33h-2.1v4.14h2.1c1.23 0 1.62-.6 1.62-1.95v-.24c0-1.35-.39-1.95-1.62-1.95Z" fill="#fff"></path>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.47 0 4.793-.746 6.75-2.04l-1.8-2.61c-1.44.87-3.15 1.41-4.95 1.41-3.96 0-7.2-3.24-7.2-7.2s3.24-7.2 7.2-7.2 7.2 3.24 7.2 7.2V12h-4.8v-2.4H12a2.4 2.4 0 0 0-2.4 2.4c0 1.325 1.075 2.4 2.4 2.4h7.2c0-6.627-5.373-12-12-12Z" fill="#fff" fillOpacity=".5"></path>
  </svg>
);


export const CentralAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`${className} bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3 text-white">
            <path d="M8.284 21.5L2.5 12L8.284 2.5H15.716L21.5 12L15.716 21.5H8.284Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15.5L9 8.5L12 1.5L15 8.5L12 15.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    </div>
);


export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 00-9-9m-9 9h18" />
  </svg>
);


export const UserAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0C27.9411 0 36 8.05887 36 18Z" fill="url(#pattern0)"/>
        <defs>
        <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use href="#image0_1_2" transform="scale(0.00195312)"/>
        </pattern>
        <image id="image0_1_2" width="512" height="512" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAAAXNSR0IArs4c6QAA..."/>
        </defs>
    </svg>
);
