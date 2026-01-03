"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: any[];
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. Looking for something specific?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //   Auto-scroll to bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timeout);
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          products: data.products,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (text: string) => {
    // Splits text by markdown links like [Title](url)
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <Link
            key={i}
            href={match?.[2] || "/"}
            className="text-blue-600 underline font-medium hover:text-blue-800"
          >
            {match[1]}
          </Link>
        );
      }

      return part;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 print:hidden"
        size="icon"
      >
        {isOpen ? <X /> : <MessageCircle />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] bg-background border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 border-b bg-muted/50 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Shopping Assistant</h3>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 text-sm",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {m.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <div className="whitespace-pre-wrap">
                    {renderContent(m.content)}
                  </div>

                  {/* If products were returned with the message, show mini cards */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 grid gap-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className="p-2 bg-background border rounded hover:border-primary transition-colors flex gap-2 items-center"
                        >
                          {p.images?.[0] && (
                            <img
                              src={p.images[0]}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="overflow-hidden">
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs opacity-70">
                              {new Intl.NumberFormat("en-NG", {
                                style: "currency",
                                currency: "NGN",
                              }).format(p.price)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about perfumes, gifts..."
                className="flex-1"
              />
              <Button type="submit" size={"icon"} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
