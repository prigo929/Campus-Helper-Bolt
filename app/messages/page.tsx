'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type DisplayMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  author: string;
};

export default function ConversationPage() {
  const params = useSearchParams();
  const router = useRouter();
  const conversationId = params.get('id') || '';

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [otherName, setOtherName] = useState('Conversation');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const load = async () => {
      if (!conversationId) {
        setError('No conversation selected.');
        setLoading(false);
        return;
      }
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;
      if (!currentUserId) {
        router.push('/sign-in');
        return;
      }
      setUserId(currentUserId);

      const { data: participantRows, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(full_name,email)')
        .eq('conversation_id', conversationId);

      if (participantsError) {
        setError(participantsError.message);
        setLoading(false);
        return;
      }

      const other = participantRows?.find((p) => p.user_id !== currentUserId);
      setOtherName(
        (other as any)?.profiles?.full_name || (other as any)?.profiles?.email || 'Conversation'
      );

      const { data: messageRows, error: messagesError } = await supabase
        .from('messages')
        .select('id, body, sender_id, created_at, profiles(full_name,email)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        setError(messagesError.message);
        setLoading(false);
        return;
      }

      const mapped =
        messageRows?.map((m) => ({
          id: m.id,
          body: m.body,
          sender_id: m.sender_id,
          created_at: m.created_at,
          author: (m as any).profiles?.full_name || (m as any).profiles?.email || 'Campus Helper user',
        })) || [];
      setMessages(mapped);
      setLoading(false);

      if (!channelRef.current) {
        channelRef.current = supabase
          .channel(`conversation-${conversationId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
            (payload) => {
              const newMessage = payload.new as any;
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMessage.id)) return prev;
                const author = newMessage.profiles?.full_name || newMessage.profiles?.email || 'Campus Helper user';
                return [
                  ...prev,
                  {
                    id: newMessage.id,
                    body: newMessage.body,
                    sender_id: newMessage.sender_id,
                    created_at: newMessage.created_at,
                    author,
                  },
                ];
              });
              scrollToBottom();
            }
          )
          .subscribe();
      }
    };

    load();

    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    if (!userId) {
      setError('Please sign in to send messages.');
      return;
    }
    if (!message.trim() || !conversationId) return;
    setSending(true);
    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      body: message.trim(),
    });
    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }
    setMessage('');
    setSending(false);
  };

  const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" className="text-[#1e3a5f] hover:text-[#d4af37]" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <p className="text-sm text-gray-500">Chat</p>
              <p className="text-lg font-semibold text-[#1e3a5f]">{otherName}</p>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-[#1e3a5f]">Conversation</CardTitle>
              <CardDescription className="text-gray-600">
                Realtime messages between you and {otherName || 'your contact'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && <p className="text-sm text-gray-600">Loading conversation...</p>}
              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</div>
              )}
              <div className="h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white px-3 py-2 space-y-2">
                {messages.length === 0 && !loading ? (
                  <p className="text-sm text-gray-500">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isMe ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-xs opacity-80 flex justify-between gap-2">
                            <span>{isMe ? 'You' : msg.author}</span>
                            <span>{formatTime(msg.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-line mt-1">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={sending}
                />
                <div className="flex justify-end">
                  <Button
                    className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f]"
                    onClick={sendMessage}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : <span className="flex items-center gap-2">Send <Send className="w-4 h-4" /></span>}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
