import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  KeyRound,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useClearChatHistory,
  useGetAdminConfig,
  useGetChatHistory,
  useSendChatMessage,
  useSetGroqApiKey,
} from "../hooks/useBackend";
import { MessageRole } from "../types";
import type { ChatMessage } from "../types";

const QUICK_PROMPTS = [
  "Explain my weak areas",
  "Give me a study plan",
  "Help me with Physics",
  "How do I improve my score?",
];

function formatContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={part}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === MessageRole.user;
  const time = new Date(Number(message.timestamp)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-ocid="chat-message"
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5
          ${isUser ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div
        className={`flex flex-col gap-0.5 max-w-[78%] min-w-0 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-[11px] font-semibold text-foreground/70">
            {isUser ? "You" : "AI Mentor"}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
            ${
              isUser
                ? "bg-accent/90 text-accent-foreground rounded-tr-sm"
                : "bg-primary/10 border border-primary/20 text-foreground rounded-tl-sm"
            }`}
        >
          {message.content.split("\n").map((line, i) => (
            <span key={`${message.id}-${i}`}>
              {i > 0 && <br />}
              {formatContent(line)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3" data-ocid="typing-indicator">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={14} />
      </div>
      <div className="flex flex-col gap-0.5 items-start">
        <span className="text-[11px] font-semibold text-foreground/70 px-1">
          AI Mentor
        </span>
        <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground italic">
            Mentor is thinking…
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyChat() {
  return (
    <div
      className="flex flex-col items-center justify-center h-full py-16 gap-4 text-center"
      data-ocid="chat-empty-state"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Sparkles size={28} className="text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-base">
          Your AI Mentor is ready
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Ask anything about your studies, weak areas, or get a personalised
          study plan.
        </p>
      </div>
    </div>
  );
}

function GroqKeyPanel({ onDismiss }: { onDismiss: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const setGroqKey = useSetGroqApiKey();

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    setGroqKey.mutate(trimmed, {
      onSuccess: (ok) => {
        if (ok) {
          setSaved(true);
          setTimeout(onDismiss, 1200);
        }
      },
    });
  };

  return (
    <div
      className="mx-4 mb-3 rounded-xl border border-primary/25 bg-primary/5 p-4 flex-shrink-0"
      data-ocid="groq-key-panel"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <KeyRound size={13} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Configure AI Mentor
            </p>
            <p className="text-xs text-muted-foreground">
              Enter your Groq API key to activate personalised responses
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0"
          aria-label="Dismiss"
          data-ocid="groq-panel-dismiss"
        >
          <X size={14} />
        </button>
      </div>

      {saved ? (
        <div className="flex items-center gap-2 text-sm text-chart-5 font-medium py-1">
          <span className="w-2 h-2 rounded-full bg-chart-5 inline-block" />
          API key saved! Activating mentor…
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="gsk_••••••••••••••••••••••••"
            className="flex-1 h-9 text-sm font-mono"
            disabled={setGroqKey.isPending}
            data-ocid="groq-key-input"
          />
          <Button
            size="sm"
            className="h-9 px-4 flex-shrink-0"
            onClick={handleSave}
            disabled={!apiKey.trim() || setGroqKey.isPending}
            data-ocid="groq-key-save-btn"
          >
            {setGroqKey.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      )}

      {setGroqKey.isError && (
        <p className="text-xs text-destructive mt-2">
          Failed to save key. Please check it's valid and try again.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground mt-2">
        Get a free key at{" "}
        <a
          href="https://console.groq.com/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          console.groq.com/keys
        </a>
        . Your key is stored securely in the backend.
      </p>
    </div>
  );
}

export default function MentorPage() {
  const [input, setInput] = useState("");
  const [showGroqPanel, setShowGroqPanel] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: adminConfig } = useGetAdminConfig();
  const { data: chatMessages = [], isLoading } = useGetChatHistory();
  const sendMessage = useSendChatMessage();
  const clearHistory = useClearChatHistory();

  const isTyping = sendMessage.isPending;
  const groqNotConfigured = adminConfig ? !adminConfig.groqConfigured : false;

  // Only auto-open panel when Groq is explicitly NOT configured (don't auto-open when pre-configured)
  useEffect(() => {
    // If adminConfig has loaded and groq is not configured, show the panel
    if (adminConfig && groqNotConfigured) {
      setShowGroqPanel(true);
    }
    // If Groq is now configured, ensure panel is closed
    if (adminConfig && !groqNotConfigured) {
      setShowGroqPanel(false);
    }
  }, [adminConfig, groqNotConfigured]);

  // Scroll to bottom on new messages or typing state change
  const msgCount = chatMessages.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll trigger
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgCount, isTyping]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    sendMessage.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleClear = () => {
    clearHistory.mutate();
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-card border-b border-border px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AI Mentor</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {groqNotConfigured ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
                  Not configured — set your Groq key below
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-5 inline-block" />
                  Powered by Groq LLM · Personalised for you
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => setShowGroqPanel((v) => !v)}
            aria-label="Configure API key"
            data-ocid="groq-settings-toggle"
          >
            <Settings2 size={13} className="mr-1.5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={handleClear}
            disabled={clearHistory.isPending || chatMessages.length === 0}
            data-ocid="clear-chat-btn"
            aria-label="Clear chat history"
          >
            <RotateCcw size={13} className="mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Groq Key Configuration Panel */}
      {showGroqPanel && (
        <div className="flex-shrink-0 pt-3">
          <GroqKeyPanel onDismiss={() => setShowGroqPanel(false)} />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" data-ocid="chat-scroll-area">
        <div className="max-w-3xl mx-auto space-y-5">
          {isLoading ? (
            <div className="space-y-4 pt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
                >
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <Skeleton
                    className={`h-14 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-72"}`}
                  />
                </div>
              ))}
            </div>
          ) : chatMessages.length === 0 ? (
            <EmptyChat />
          ) : (
            chatMessages.map((msg) => (
              <MessageBubble key={msg.id.toString()} message={msg} />
            ))
          )}

          {isTyping && <TypingIndicator />}

          {sendMessage.isError && (
            <div
              className="text-center text-xs text-destructive bg-destructive/10 rounded-lg px-4 py-2"
              data-ocid="chat-error"
            >
              Failed to get a response. Please try again.
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Quick prompts */}
      <div className="px-4 pt-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              type="button"
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isTyping}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
              data-ocid="quick-prompt"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 flex-shrink-0 border-t border-border bg-card/50 pt-3">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor anything… (Enter to send, Shift+Enter for new line)"
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            rows={1}
            disabled={isTyping}
            data-ocid="chat-input"
          />
          <Button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
            aria-label="Send message"
            data-ocid="send-message-btn"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-3xl mx-auto">
          Responses are personalised to your study data. Always verify with
          official sources.
        </p>
      </div>
    </div>
  );
}
