import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageTransition from "@/components/premium/PageTransition";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

async function streamChat({ messages, onDelta, onDone }: { messages: Message[]; onDelta: (text: string) => void; onDone: () => void }) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    if (resp.status === 429) throw new Error("Rate limited — please wait a moment and try again.");
    if (resp.status === 402) throw new Error("Credits exhausted — please top up.");
    throw new Error(err.error || "Failed to get AI response");
  }
  if (!resp.body) throw new Error("No response stream");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try { const parsed = JSON.parse(json); const content = parsed.choices?.[0]?.delta?.content; if (content) onDelta(content); }
      catch { buf = line + "\n" + buf; break; }
    }
  }
  onDone();
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };
    try {
      await streamChat({ messages: [...messages, userMsg], onDelta: upsert, onDone: () => setIsLoading(false) });
    } catch (e: any) { toast.error(e.message || "Something went wrong"); setIsLoading(false); }
  };

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-display text-gradient">AI Health Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask me anything about your health, appointments, or blood donation 💬</p>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-7 h-7 text-primary/40" />
              </div>
              <p className="text-sm">Hi there! 👋 I'm your CareCell AI assistant.<br />How can I help you today?</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1 border border-primary/20">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "glass text-foreground"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-1 border border-border/50">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="glass rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-border/30 flex gap-2">
          <input
            ref={inputRef}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-border bg-[hsl(var(--glass)_/_0.03)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
          />
          <GlowButton onClick={send} disabled={isLoading || !input.trim()} size="md">
            <Send className="w-4 h-4" />
          </GlowButton>
        </div>
      </GlassCard>
    </PageTransition>
  );
}
