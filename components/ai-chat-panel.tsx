'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { Sparkles, Send, StopCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Summarize today’s top campus jobs in one sentence.',
  'Give me tips for writing a compelling job post students will trust.',
  'How should I price used textbooks so they sell fast?',
  'Suggest three safety reminders for meeting a buyer on campus.',
];

function extractText(parts: UIMessage['parts']) {
  return parts
    .map((part) => {
      if (part.type === 'text' || part.type === 'reasoning') return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function AiChatPanel() {
  const { messages, sendMessage, stop, status, error, clearError } = useChat();
  const [input, setInput] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const hasMessages = useMemo(() => messages.some((message: UIMessage) => message.role !== 'system'), [messages]);

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    await sendMessage({ text: trimmed });
    setInput('');
    clearError?.();
  };

  return (
    <Card className="shadow-lg border-gray-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              Military Helper AI
            </CardTitle>
            <p className="text-sm text-gray-600">Powered by the Next.js AI SDK for quick, focused answers.</p>
          </div>
          <Badge variant="secondary" className="bg-[#f4d03f]/20 text-[#1e3a5f] border-[#f4d03f]/40">
            Beta
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="text-left rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm transition hover:border-[#d4af37] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50/60">
          <ScrollArea className="h-[360px]">
            <div className="p-4 space-y-3" ref={scrollRef}>
              {!hasMessages && (
                <div className="rounded-xl bg-white p-4 text-sm text-gray-700 shadow-sm border border-dashed border-gray-200">
                  Ask anything about campus jobs, listings, or forum posts. Your questions stay on this device; the bot
                  cannot see private account data.
                </div>
              )}

              {messages
                .filter((message: UIMessage) => message.role !== 'system')
                .map((message: UIMessage) => {
                  const isUser = message.role === 'user';
                  const text = extractText(message.parts);
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'relative flex gap-2 rounded-xl border p-3 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-chat-pop',
                        isUser
                          ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                          : 'bg-white text-gray-900 border-gray-200'
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500',
                          isUser
                            ? 'bg-gradient-to-r from-white/10 via-white/5 to-white/0'
                            : 'bg-gradient-to-r from-purple-500/10 via-indigo-400/10 to-transparent'
                        )}
                      />
                      <div className="mt-1">
                        {isUser ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase">
                            You
                          </div>
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4d03f]/25 text-[#1e3a5f]">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                          {isUser ? 'You' : 'Military Helper AI'}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">{text || '...'}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about writing a job post, pricing a listing, or moderating a forum thread..."
            rows={3}
            className="resize-none"
          />
          {error && <p className="text-sm text-red-600">Something went wrong: {error.message}</p>}
          <div className="flex items-center justify-between gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            ) : (
              <div className="text-xs text-gray-500">Campus-focused answers. Keep prompts concise.</div>
            )}
            <div className="flex items-center gap-2">
              {isLoading && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300 text-gray-700"
                  onClick={stop}
                  disabled={!isLoading}
                >
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
              <Button
                type="submit"
                className="bg-[#1e3a5f] hover:bg-[#163150]"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
