'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DashboardButton } from "@/components/dashboard-button";
import { motion, AnimatePresence } from 'framer-motion';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { UploadCloud, ClipboardPaste, X, RotateCcw, Sparkles, ScanSearch, Clipboard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ReactConfetti from 'react-confetti';

// Setup PDF.js worker
// This points to the worker script in node_modules. Adjust path if necessary for your build setup.
// Note: You might need to configure your bundler (e.g., Webpack/Next.js) to correctly handle/copy this worker file.
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    // Alternative if hosting the worker yourself:
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '/_next/static/chunks/pdf.worker.min.js'; // Example for Next.js
}

// --- Simple useWindowSize Hook --- 
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024, // Default for SSR
    height: typeof window !== 'undefined' ? window.innerHeight : 768, // Default for SSR
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize(); 

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return size;
}
// --- End useWindowSize Hook ---

export const AIHumanizer = ({ onClose }: { onClose?: () => void }) => {
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inputMode, setInputMode] = useState<'initial' | 'active'>('initial');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiFading, setConfettiFading] = useState(false);

  const { width, height } = useWindowSize();

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleHumanize = async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setHumanizedText('');
    setConfidenceScore(null);

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
        signal: signal,
      });

      if (!response.ok) {
        let errorText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorText = `Error: ${errorData.error || errorText}`;
        } catch (e) { /* Ignore if response isn't JSON */ }
        console.error('API Error (non-stream):', errorText);
        toast.error(errorText);
        setHumanizedText(errorText);
        throw new Error(errorText);
      }
      
      if (!response.body) {
          throw new Error("Response body is missing");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let currentOutput = '';
      let streamSuccessful = true;

      while (!done) {
        try {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (done) {
                console.log("Stream finished.");
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.substring(5));
                        if (jsonData.chunk) {
                            currentOutput += jsonData.chunk;
                            setHumanizedText(currentOutput);
                        } else if (jsonData.error) {
                            console.error("Stream error reported:", jsonData.error);
                            toast.error(`Stream Error: ${jsonData.error}`);
                            setHumanizedText(prev => prev + `\n[Stream Error: ${jsonData.error}]`);
                            done = true;
                            streamSuccessful = false;
                            break;
                        }
                    } catch (e) {
                        console.error("Error parsing SSE data line:", line, e);
                        streamSuccessful = false;
                    }
                }
            }
        } catch (readError) {
            console.error("Error reading from stream:", readError);
            toast.error("Error reading stream");
            setHumanizedText(prev => prev + "\n[Error reading stream]");
            done = true;
            streamSuccessful = false;
        }
      }

      if (streamSuccessful && currentOutput) {
          toast.success("Humanized successfully!");
          if (Math.random() < 0.5) { // 50% chance of showing confetti
            setShowConfetti(true);
            setConfettiFading(false);
            setTimeout(() => {
              setConfettiFading(true);
              setTimeout(() => setShowConfetti(false), 1000); // Remove from DOM after fade completes
            }, 4000); // Start fading after 4 seconds
          }
      }

    } catch (error) {
       if (error instanceof Error && error.name === 'AbortError') {
           console.log('Fetch aborted');
       } else {
           console.error('Failed to humanize text (fetch setup or stream init):', error);
           const errorMsg = error instanceof Error ? error.message : 'An error occurred';
           toast.error(`Humanization failed: ${errorMsg}`);
           if (!humanizedText) {
               setHumanizedText(`Error: ${errorMsg}`);
           }
       }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCheckAI = async () => {
    if (!humanizedText || isLoading || isCheckingAI) return;

    setIsCheckingAI(true);
    setConfidenceScore(null);

    try {
        const response = await fetch('/api/check-ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: humanizedText }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMsg = errorData.error || 'Failed to fetch AI score';
            console.error('AI Check API Error:', errorMsg, errorData.details);
            toast.error(`AI Check failed: ${errorMsg}`);
            throw new Error(errorMsg);
        }

        const data = await response.json();
        setConfidenceScore(typeof data.confidenceScore === 'number' ? data.confidenceScore : null);
        toast.success("AI score calculated.");

    } catch (error) {
        console.error('Failed to check AI score:', error);
        setConfidenceScore(null);
    } finally {
        setIsCheckingAI(false);
    }
  };

  const handleCopy = () => {
    if (humanizedText) {
        navigator.clipboard.writeText(humanizedText);
        toast.success('Copied to clipboard!');
    }
  };

  const handleFileUploadClick = () => {
    console.log("[handleFileUploadClick] Triggered.");
    console.log("[handleFileUploadClick] fileInputRef.current:", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log("[handleFileUploadClick] click() called on ref.");
    } else {
      console.error("[handleFileUploadClick] Ref was null, could not click.");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setHumanizedText('');
    setConfidenceScore(null);
    setFileName(file.name);
    setInputText('');
    setFileError(null);
    setIsLoading(true);
    setInputMode('active');

    try {
      let text = '';
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'text/plain' || fileExtension === 'txt') {
        text = await file.text();
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExtension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (fileType === 'application/pdf' || fileExtension === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        text = fullText;
      } else {
        throw new Error('Unsupported file type. Please upload TXT, DOCX, or PDF.');
      }
      setInputText(text);
    } catch (err) {
      console.error('Error reading file:', err);
      setFileError(err instanceof Error ? err.message : 'Could not read file content.');
      setFileName(null);
      setInputMode('initial');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetInput = () => {
      setInputText('');
      setHumanizedText('');
      setConfidenceScore(null);
      setFileName(null);
      setFileError(null);
      setInputMode('initial');
      abortControllerRef.current?.abort();
  };

  const handleActivateAndFocus = () => {
      if (inputMode === 'initial') {
          console.log('Activating input via focus/interaction...');
          setInputMode('active');
      }
      setTimeout(() => textAreaRef.current?.focus(), 0);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50 relative">
      <Toaster position="top-right" reverseOrder={false} />
      {showConfetti && <ReactConfetti 
        width={width} 
        height={height} 
        recycle={false} 
        numberOfPieces={350}
        gravity={0.5}
        opacity={0.7}
        colors={['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3']}
        style={{
          transition: 'opacity 1s ease-out',
          opacity: confettiFading ? 0 : 1
        }}
      />}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">AI Humanizer</h1>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-md border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg max-h-[75vh]">
        
        <div className="flex flex-row border-b border-gray-200 flex-shrink-0"> 
            <div className="w-full md:w-1/2 flex justify-between items-center p-6 pr-3 border-r border-gray-200">
                <h2 className="text-lg font-medium text-gray-700">Input AI Text</h2>
                {inputMode === 'active' && (inputText || fileName || fileError) ? (
                     <DashboardButton 
                        isIconOnly variant="light" size="sm" 
                        onClick={handleResetInput} title="Clear input and start over" aria-label="Clear input"
                     >
                        <RotateCcw size={16} />
                     </DashboardButton>
                ) : <div style={{ width: '32px' }}/>}
            </div>
            <div className="w-full md:w-1/2 flex justify-between items-center p-6 pl-3">
                <h2 className="text-lg font-medium text-gray-700">Humanized Output</h2>
                <div className="flex items-center gap-3 min-h-[32px]">
                    <AnimatePresence>
                        {confidenceScore !== null && !isCheckingAI && (
                            <>
                                <motion.span
                                    key="score"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-sm font-medium px-2 py-0.5 rounded-full ${confidenceScore > 75 ? 'bg-green-100 text-green-700' : confidenceScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
                                >
                                    Variation Score: {confidenceScore.toFixed(0)}%
                                </motion.span>

                                {confidenceScore > 75 && (
                                    <motion.span
                                        key="status"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-sm font-semibold bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent"
                                    >
                                        Undetectable. Human written.
                                    </motion.span>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        <div className="flex flex-1 flex-col md:flex-row overflow-hidden"> 
            <div className="w-full md:w-1/2 flex flex-col gap-4 p-6 border-r border-gray-200">
                <input 
                  type="file" ref={fileInputRef} onChange={handleFileChange}
                  accept=".txt,.docx,.pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                  style={{ display: 'none' }} aria-hidden="true"
                />

                <div className="flex-1 flex flex-col relative min-h-[250px]">
                    <AnimatePresence>
                        {inputMode === 'initial' && (
                            <motion.div
                                key="overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 top-0 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none bg-white/70 p-4"
                            >
                                <DashboardButton 
                                    onClick={handleFileUploadClick} 
                                    className="w-full max-w-xs flex items-center justify-center gap-2 pointer-events-auto"
                                >
                                   <UploadCloud size={18}/> Import from File
                                </DashboardButton>
                                <DashboardButton 
                                    onClick={handleActivateAndFocus}
                                    className="w-full max-w-xs flex items-center justify-center gap-2 pointer-events-auto"
                                >
                                        <ClipboardPaste size={18}/> Paste Text
                                </DashboardButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className={`flex-1 flex flex-col h-full`}> 
                        {inputMode === 'active' && fileName && !fileError && <p className="text-sm text-gray-500 mb-2 flex-shrink-0">File: {fileName}</p>}
                        {inputMode === 'active' && fileError && <p className="text-sm text-red-600 mb-2 flex-shrink-0">Error: {fileError}</p>}
                        
                        <textarea
                            ref={textAreaRef} 
                            value={inputText}
                            onChange={(e) => {
                                const currentText = e.target.value;
                                
                                if (inputMode === 'initial' && currentText !== '') { 
                                    setInputMode('active');
                                }

                                setInputText(currentText);

                                if (fileName || fileError) {
                                    setFileName(null); 
                                    setFileError(null);
                                }

                                if (currentText === '') {
                                    setInputMode('initial');
                                }
                            }}
                            onPaste={(e) => {
                                handleActivateAndFocus(); 
                            }}
                            placeholder={isLoading ? "Processing..." : "Paste or type your AI-generated text here..."}
                            className={`flex-1 w-full h-full p-0 border-none focus:outline-none resize-none text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 ${isLoading ? 'opacity-50' : ''}`}
                            readOnly={isLoading}
                        />
                    </div>
                </div> 

                <div className="mt-auto flex justify-between items-center gap-3">
                    <span className="text-xs text-gray-500">
                        {inputText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <div className="flex gap-3">
                        <DashboardButton
                            color="primary"
                            variant="solid"
                            onClick={handleHumanize}
                            disabled={isLoading || !inputText}
                            isLoading={isLoading && !humanizedText}
                            startContent={!(isLoading && !humanizedText) ? <Sparkles size={16} /> : null}
                        >
                            {isLoading && !humanizedText ? 'Humanizing...' : 'Humanize Text'}
                        </DashboardButton>
                    </div>
                </div>
            </div> 

            <div className="w-full md:w-1/2 flex flex-col overflow-hidden p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={humanizedText.length > 0 ? 1 : 0}
                    className="flex-1 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap break-words text-gray-900"
                >
                    {isLoading && !humanizedText ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Connecting to stream...</p>
                        </div>
                     ) : humanizedText ? (
                        humanizedText
                     ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-center">Input text on the left and click "Humanize Text".<br/>The output will stream here.</p>
                        </div>
                     )}
                </motion.div>

                <div className="mt-auto flex justify-between items-center gap-3">
                     <span className="text-xs text-gray-500">
                        {humanizedText.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                    <div className="flex gap-3">
                        <DashboardButton
                            color="secondary"
                            variant="solid"
                            onClick={handleCheckAI}
                            disabled={isCheckingAI || isLoading || !humanizedText}
                            isLoading={isCheckingAI}
                            startContent={!isCheckingAI ? <ScanSearch size={16} /> : null}
                        >
                            {isCheckingAI ? 'Checking...' : 'Check AI'}
                        </DashboardButton>
                        <DashboardButton
                            variant="bordered"
                            onClick={handleCopy}
                            disabled={isLoading || !humanizedText}
                            startContent={<Clipboard size={16} />}
                        >
                            Copy
                        </DashboardButton>
                    </div>
                </div>
            </div>
        </div> 
      </div> 
    </div> 
  );
}; 