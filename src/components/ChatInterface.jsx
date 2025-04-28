import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, ChevronDown, Trash2, Bot, User, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { io } from 'socket.io-client';
import parse from 'html-react-parser';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

const LoadingDots = () => (
  <div className="flex space-x-1.5 px-2 py-1">
    <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

const ConnectionStatus = ({ isConnecting, isError }) => {
  if (!isConnecting && !isError) return null;
  
  return (
    <Alert variant={isError ? "destructive" : "default"} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <span>Connecting to server</span>
            <LoadingDots />
          </div>
        ) : (
          "Unable to connect to server. Please check your connection and try again."
        )}
      </AlertDescription>
    </Alert>
  );
};

const ChatMessage = ({ text, isUser, isLoading, timestamp }) => (
  <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 items-end space-x-2 relative`}>
    {!isUser && (
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm shadow-md">
          <Bot className="w-4 h-4" />
        </div>
      </div>
    )}
    <div className="flex flex-col space-y-1 max-w-[85%]">
      <div
        className={`p-4 rounded-2xl ${isUser
            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm'
            : 'bg-muted/80 backdrop-blur-sm rounded-bl-sm shadow-sm'
          }`}
      >
        {isLoading ? <LoadingDots /> : parse(text)}
      </div>
      <div className={`text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right' : 'text-left'}`}>
        <Clock className="w-3 h-3 inline-block mr-1" />
        {new Date().toLocaleTimeString()}
      </div>
    </div>
    {isUser && (
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-white text-sm shadow-md">
          <User className="w-4 h-4" />
        </div>
      </div>
    )}
  </div>
);

const QuickQuestions = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const questions = [
    "What's the engagement rate trend for all kind of posts?",
    "What type of reel themes were the most popular",
    "Which type of post was the most appreciated?",
    "What type of content gets the most shares?",
    "What hashtags are driving the most engagement?",
    "Which type of post has better prospects in future?"
  ];

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        className="w-full flex items-center justify-between border-2 border-primary/20 hover:border-primary/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Quick Questions</span>
        <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <div className="mt-2 p-2 bg-muted/50 backdrop-blur-sm rounded-lg grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border border-border/50">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full text-left justify-start h-auto py-2.5 px-3 text-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              onClick={() => {
                onSelect(question);
                setIsOpen(false);
              }}
            >
              {question}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
};

const formatMarkdownResponse = (text) => {
  const formatHeadings = (text) => {
    return text
      .replace(/^##\s+(.+)$/gm, '</div><div class="mt-6 mb-3"><h2 class="text-xl font-semibold text-foreground/90 border-b pb-2 mb-3">$1</h2>')
      .replace(/^#\s+(.+)$/gm, '</div><div class="mt-6 mb-3"><h1 class="text-2xl font-bold text-foreground border-b pb-2 mb-3">$1</h1>');
  };

  const formatBold = (text) => {
    return text
      .replace(/\*\*(.+?):\*\*/g, '<strong class="font-semibold text-foreground block mb-2">$1:</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  };

  const formatParagraphs = (text) => {
    const paragraphs = text.split('\n').filter(p => p.trim());

    return paragraphs.map(p => {
      if (p.trim().startsWith('#')) return p;
      return `<div class="mb-4">${p}</div>`;
    }).join('\n');
  };

  let formattedText = formatParagraphs(text);
  formattedText = formatHeadings(formattedText);
  formattedText = formatBold(formattedText);

  formattedText = `<div class="formatted-content space-y-2">${formattedText}</div>`
    .replace(/<div>\s*<\/div>/g, '')
    .replace(/(<\/div>)\s*(<div)/g, '$1$2');

  return formattedText;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const scrollRef = useRef(null);
  const socketRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const initializeSocket = () => {
      setIsConnecting(true);
      setConnectionError(false);
      
      socketRef.current = io(SERVER_URL, {
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000
      });

      socketRef.current.on('connect', () => {
        setIsConnecting(false);
        setConnectionError(false);
        reconnectAttemptsRef.current = 0;
        console.log('Connected to chat server');
      });

      socketRef.current.on('connect_error', () => {
        reconnectAttemptsRef.current++;
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError(true);
          setIsConnecting(false);
        }
      });

      socketRef.current.on('disconnect', () => {
        setIsConnecting(true);
        console.log('Disconnected from server');
      });

      socketRef.current.on('bot_typing', (isTyping) => {
        setIsLoading(isTyping);
        if (isTyping) {
          scrollToBottom();
        }
      });

      socketRef.current.on('bot_response', (data) => {
        const formattedResponse = formatMarkdownResponse(data.reply);
        setMessages(prev => [...prev, { text: formattedResponse, isUser: false }]);
        setIsLoading(false);
      });

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false
        }]);
        setIsLoading(false);
      });
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  const sendMessage = (text) => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected');
      return;
    }

    const formattedUserMessage = formatMarkdownResponse(text);
    setMessages(prev => [...prev, { text: formattedUserMessage, isUser: true }]);
    socketRef.current.emit('chat_message', text);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuestionSelect = (question) => {
    sendMessage(question);
  };

  const clearHistory = () => {
    const welcomeMessage = {
      text: formatMarkdownResponse("Hello! How can I help you analyze your social media performance? You can type your question or select from the quick questions above."),
      isUser: false
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chatHistory', JSON.stringify([welcomeMessage]));
  };


  return (
    <Card className="w-full max-w-8xl mx-auto mt-6 shadow-xl border-t-4 border-t-primary bg-gradient-to-b from-background to-background/98">
      <CardHeader className="border-b border-border/40">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <span>AI Assistant</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="flex items-center space-x-2 border-2 border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
            <span className="text-destructive">Clear History</span>
          </Button>
        </div>
        <CardDescription>Ask questions about your social media performance</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ConnectionStatus isConnecting={isConnecting} isError={connectionError} />
        <QuickQuestions onSelect={handleQuestionSelect} />
        <ScrollArea className="h-[500px] pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                {...msg}
                timestamp={new Date().toISOString()}
              />
            ))}
            {isLoading && (
              <ChatMessage
                text=""
                isUser={false}
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border/40">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connectionError ? "Connection failed. Please try again later." : "Type your message..."}
            disabled={isLoading || isConnecting || connectionError}
            className="flex-1 bg-muted/50 border-2 focus-visible:ring-primary/30"
          />
          <Button
            type="submit"
            disabled={isLoading || isConnecting || connectionError}
            className="px-4 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 transition-opacity shadow-md"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}