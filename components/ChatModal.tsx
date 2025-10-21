import React, { useState, useEffect, useRef } from 'react';
import { Chat, Part } from '@google/genai';
import { LoadingSpinner } from './LoadingSpinner';
import { ChatMessage } from '../types';

const ReactMarkdown = (window as any).ReactMarkdown;
const remarkGfm = (window as any).remarkGfm;

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatSession: Chat;
  initialHistory: ChatMessage[];
  onSaveHistory: (history: ChatMessage[]) => void;
  onClearHistory: () => void;
}

const IconX: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const IconTrash: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const IconUser: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const IconSparkles: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const IconPaperClip: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);


export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chatSession, initialHistory, onSaveHistory, onClearHistory }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Deep copy to prevent mutation of props
            setMessages(JSON.parse(JSON.stringify(initialHistory)));
        }
    }, [isOpen, initialHistory]);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleClose = () => {
        onSaveHistory(messages);
        onClose();
    };
    
    const handleClear = () => {
        if (window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện này không? Thao tác này không thể hoàn tác.")) {
            onClearHistory();
            setMessages([]);
        }
    };
    
    const blobToDataUrl = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to read blob as Data URL."));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const processImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chỉ chọn tệp hình ảnh.');
            return;
        }
        if (file.size > 4 * 1024 * 1024) { // 4MB limit
            alert('Kích thước tệp không được vượt quá 4MB.');
            return;
        }
        handleRemoveImage(); // Remove previous image if any
        setImageFile(file);
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processImageFile(file);
        }
        if(event.target) event.target.value = '';
    };

    const handlePaste = (event: React.ClipboardEvent) => {
        if (imageFile || isLoading) {
            return;
        }

        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    event.preventDefault();
                    processImageFile(file);
                    return; 
                }
            }
        }
    };

    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userInput.trim() && !imageFile) || isLoading) return;

        let userMessage: ChatMessage = { role: 'user', text: userInput };
        
        const currentImageFile = imageFile;
        const currentImagePreview = imagePreview;
        
        if (currentImageFile && currentImagePreview) {
            const dataUrl = await blobToDataUrl(currentImageFile);
            userMessage = { ...userMessage, imageUrl: dataUrl };
        }

        setMessages(prev => [...prev, userMessage]);
        
        setUserInput('');
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(true);

        try {
            const parts: Part[] = [];
            
            if (userInput.trim()) {
                parts.push({ text: userInput });
            }

            if (currentImageFile) {
                const base64Data = (await blobToDataUrl(currentImageFile)).split(',')[1];
                parts.push({
                    inlineData: {
                        data: base64Data,
                        mimeType: currentImageFile.type,
                    },
                });
            }

            const stream = await chatSession.sendMessageStream({ message: parts });
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-brand-surface w-full max-w-2xl h-[90vh] flex flex-col rounded-lg shadow-2xl border border-gray-700/50 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <h2 className="text-lg font-bold text-brand-secondary">Trò Chuyện Cùng AI</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleClear} className="p-1 rounded-full text-brand-text-secondary hover:text-red-400 hover:bg-red-900/30 transition-colors" aria-label="Xóa lịch sử trò chuyện">
                            <IconTrash className="w-6 h-6" />
                        </button>
                        <button onClick={handleClose} className="p-1 rounded-full text-brand-text-secondary hover:bg-gray-700/50 transition-colors" aria-label="Đóng">
                            <IconX className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <main ref={chatContainerRef} className="p-4 overflow-y-auto flex-grow space-y-6">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                    <IconSparkles className="w-5 h-5 text-brand-primary" />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600/80 text-white' : 'bg-gray-800/60'}`}>
                                {msg.imageUrl && (
                                    <img src={msg.imageUrl} alt="User upload" className="mb-2 rounded-lg max-h-60" />
                                )}
                                {msg.text && (
                                    <article className="prose prose-invert prose-p:my-1 text-white">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    </article>
                                )}
                            </div>
                             {msg.role === 'user' && (
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-600 flex items-center justify-center">
                                    <IconUser className="w-5 h-5 text-gray-200" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                             <div className="w-8 h-8 flex-shrink-0 rounded-full bg-brand-primary/20 flex items-center justify-center">
                                <IconSparkles className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="max-w-md p-3 rounded-lg bg-gray-800/60 flex items-center">
                               <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse " style={{animationDelay: '0s'}}></div>
                               <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.2s'}}></div>
                               <div className="w-2 h-2 bg-brand-text rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-brand-surface/80">
                    {imagePreview && (
                        <div className="relative mb-2 w-24">
                            <img src={imagePreview} alt="Xem trước" className="rounded-lg border border-gray-600" />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 border-2 border-brand-surface"
                                aria-label="Xóa ảnh"
                            >
                                <IconX className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} onPaste={handlePaste} className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            accept="image/*"
                            className="hidden"
                        />
                         <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || !!imageFile}
                            className="p-2 text-brand-text-secondary hover:text-brand-primary transition-colors duration-200 rounded-full hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Đính kèm ảnh"
                        >
                            <IconPaperClip className="w-6 h-6"/>
                        </button>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Hỏi về build... Dán hoặc đính kèm ảnh nếu cần."
                            className="w-full bg-gray-800/50 border border-gray-600 rounded-md px-4 py-2 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition duration-200"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || (!userInput.trim() && !imageFile)}
                            className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Gửi
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};