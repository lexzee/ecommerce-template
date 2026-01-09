"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

// Strict Types
interface ChatProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  images: string[] | null;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
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

  // Auto-scroll to bottom
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

  // Helper to format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(siteConfig.billing.currency.locale, {
      style: "currency",
      currency: siteConfig.billing.currency.code,
    }).format(price);
  };

  // Helper to render markdown-style links
  const renderContent = (text: string) => {
    const parts = text.split(/(\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <Link
            key={i}
            href={match?.[2] || "/"}
            className="text-primary underline underline-offset-4 font-medium hover:text-primary/80"
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
      {/* Floating Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[60] print:hidden"
        size="icon"
        aria-label="Toggle Chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-background border border-border rounded-xl shadow-2xl z-[50] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in-0 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Shopping Assistant</h3>
              <p className="text-[10px] text-muted-foreground">
                Ask me anything about our products
              </p>
            </div>
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
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {m.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={cn(
                    "p-3 rounded-lg max-w-[85%]",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {renderContent(m.content)}
                  </div>

                  {/* Product Recommendations */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 grid gap-2 w-full">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          className="p-2 bg-background border border-border rounded-md hover:border-primary transition-colors flex gap-3 items-center group"
                        >
                          <div className="relative w-10 h-10 flex-shrink-0 bg-muted rounded-sm overflow-hidden">
                            {p.images?.[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                                No Img
                              </div>
                            )}
                          </div>

                          <div className="overflow-hidden min-w-0">
                            <div className="font-medium truncate text-foreground group-hover:text-primary transition-colors">
                              {p.name.length > 25
                                ? p.name.slice(0, 22) + "..."
                                : p.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(p.price)}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-muted p-3 rounded-lg border border-border">
                  <div className="flex gap-1 h-4 items-center">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-background">
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
                autoFocus
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
