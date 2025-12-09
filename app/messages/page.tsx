'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, MessageSquare } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getSafeSession } from '@/lib/get-safe-session';

type DisplayMessage = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
  author: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  lastMessage?: string;
  lastAt?: string;
};

type TargetProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
};

export default function ConversationPage() {
  return (
    <Suspense fallback={<MessagesSuspenseFallback />}>
      <ConversationPageContent />
    </Suspense>
  );
}

function ConversationPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const conversationId = params.get('id') || '';

  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [otherName, setOtherName] = useState('All conversations');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [startError, setStartError] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<TargetProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('You');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingBroadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingBroadcastRef = useRef<number>(0);
  const handleBack = () => {
    if (conversationId) {
      router.push('/messages');
      return;
    }
    if (typeof window !== 'undefined') {
      const lastNonChat = window.sessionStorage.getItem('lastNonChatPath');
      if (lastNonChat) {
        router.push(lastNonChat);
        return;
      }
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push('/home');
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendTypingSignal = (isTyping: boolean) => {
    if (!conversationId || !channelRef.current || !userId) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId,
        name: currentUserName || 'Someone',
        isTyping,
      },
    });
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!conversationId || !channelRef.current || !userId) return;
    if (!value.trim()) {
      sendTypingSignal(false);
      if (typingBroadcastTimeoutRef.current) {
        clearTimeout(typingBroadcastTimeoutRef.current);
        typingBroadcastTimeoutRef.current = null;
      }
      return;
    }

    const now = Date.now();
    if (now - lastTypingBroadcastRef.current > 900) {
      sendTypingSignal(true);
      lastTypingBroadcastRef.current = now;
    }

    if (typingBroadcastTimeoutRef.current) {
      clearTimeout(typingBroadcastTimeoutRef.current);
    }
    typingBroadcastTimeoutRef.current = setTimeout(() => {
      sendTypingSignal(false);
    }, 1400);
  };

  const loadConversations = async () => {
    if (!supabase) {
      setConversationsLoading(false);
      return;
    }
    const { session, error: sessionError } = await getSafeSession({ silent: true });
    if (sessionError) {
      console.error('Failed to load conversations session', sessionError);
    }
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      setConversationsLoading(false);
      return;
    }

    const { data: participantRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    const ids = participantRows?.map((p) => p.conversation_id) || [];
    if (ids.length === 0) {
      setConversations([]);
      setConversationsLoading(false);
      return;
    }

    const { data: convRows, error: convError } = await supabase
      .from('conversations')
      .select(
        'id, updated_at, conversation_participants(user_id, profiles(full_name,email)), messages(body, created_at, sender_id)'
      )
      .in('id', ids)
      .order('updated_at', { ascending: false });

    if (convError) {
      console.error('Conversation list error', convError);
      setConversationsLoading(false);
      return;
    }

    const mapped: ConversationSummary[] =
      convRows?.map((c: any) => {
        const others = (c.conversation_participants || []).filter((p: any) => p.user_id !== currentUserId);
        const other =
          others[0]?.profiles?.full_name || others[0]?.profiles?.email || 'Conversation';
        const last = (c.messages || []).sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        return {
          id: c.id,
          title: other,
          lastMessage: last?.body,
          lastAt: last?.created_at || c.updated_at,
        };
      }) || [];

    setConversations(mapped);
    setConversationsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const ref = document.referrer;
      if (ref && !ref.includes('/messages')) {
        const url = new URL(ref);
        const pathWithQuery = url.pathname + (url.search || '');
        window.sessionStorage.setItem('lastNonChatPath', pathWithQuery || '/');
      }
    } catch {
      // ignore referrer parse errors
    }
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      if (!supabase) return;
      const query = newEmail.trim();
      if (query.length < 2) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }
      const { session } = await getSafeSession({ silent: true });
      const currentUserId = session?.user?.id;
      if (!currentUserId) return;
      setSearchLoading(true);
      const isUuid = /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(query);
      const clauses = [
        `email.ilike.%${query}%`,
        `full_name.ilike.%${query}%`,
        isUuid ? `id.eq.${query}` : '',
      ].filter(Boolean);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(clauses.join(','))
        .limit(5);
      if (error) {
        setSearchLoading(false);
        return;
      }
      const filtered = (data || []).filter((p) => p.id !== currentUserId);
      setSearchResults(filtered);
      setSearchLoading(false);
    };

    const handle = setTimeout(runSearch, 250);
    return () => clearTimeout(handle);
  }, [newEmail]);

  useEffect(() => {
    const load = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      toast.error('Supabase is not configured.');
      return;
    }

      const { session, error: sessionError } = await getSafeSession();
      const currentUserId = session?.user?.id;
      if (sessionError) {
        console.error('Failed to load chat session', sessionError);
      }
      if (!currentUserId) {
        router.push('/sign-in');
        return;
      }
    setUserId(currentUserId);

    if (!conversationId) {
      setLoading(false);
      setOtherName('All conversations');
      return;
    }

    // Ensure current user is marked as a participant in case they were missing
    await supabase.from('conversation_participants').upsert(
        { conversation_id: conversationId, user_id: currentUserId },
        { onConflict: 'conversation_id,user_id' }
      );

      const { data: participantRows, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles(full_name,email)')
        .eq('conversation_id', conversationId);

      if (participantsError) {
        setError(participantsError.message);
        setLoading(false);
        toast.error('Could not load the participants for this chat.');
        return;
      }

      const other = participantRows?.find((p) => p.user_id !== currentUserId);
      const me = participantRows?.find((p) => p.user_id === currentUserId);
      setCurrentUserName(
        (me as any)?.profiles?.full_name || (me as any)?.profiles?.email || 'You'
      );
      const resolvedName =
        (other as any)?.profiles?.full_name || (other as any)?.profiles?.email || 'Conversation';
      setOtherName(resolvedName);

      const { data: messageRows, error: messagesError } = await supabase
        .from('messages')
        .select('id, body, sender_id, created_at, profiles(full_name,email)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        setError(messagesError.message);
        setLoading(false);
        toast.error('Could not load messages for this conversation.');
        return;
      }

      const mapped =
        messageRows?.map((m) => ({
          id: m.id,
          body: m.body,
          sender_id: m.sender_id,
          created_at: m.created_at,
          author: (m as any).profiles?.full_name || (m as any).profiles?.email || 'Military Helper user',
        })) || [];
      setMessages(mapped);
      setLoading(false);

      if (!channelRef.current) {
        channelRef.current = supabase
          .channel(`conversation-${conversationId}`, {
            config: {
              broadcast: { self: true },
            },
          })
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
            (payload) => {
              const newMessage = payload.new as any;
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMessage.id)) return prev;
                const author =
                  newMessage.sender_id === currentUserId
                    ? 'You'
                    : newMessage.profiles?.full_name || newMessage.profiles?.email || 'Military Helper user';
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
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === conversationId
                    ? { ...c, lastMessage: newMessage.body, lastAt: newMessage.created_at }
                    : c
                )
              );
              scrollToBottom();
            }
          )
          .on('broadcast', { event: 'new-message' }, (payload) => {
            const newMessage = payload.payload as DisplayMessage | undefined;
            if (!newMessage || !newMessage.id) return;
            setTypingUser(null);
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            setConversations((prev) =>
              prev.map((c) =>
                c.id === conversationId
                  ? { ...c, lastMessage: newMessage.body, lastAt: newMessage.created_at }
                  : c
              )
            );
            scrollToBottom();
          })
          .on('broadcast', { event: 'typing' }, (payload) => {
            const typingPayload = payload.payload as { userId?: string; name?: string; isTyping?: boolean };
            if (!typingPayload?.userId || typingPayload.userId === currentUserId) return;

            if (typingPayload.isTyping) {
              setTypingUser(typingPayload.name || 'Someone');
              if (typingIndicatorTimeoutRef.current) {
                clearTimeout(typingIndicatorTimeoutRef.current);
              }
              typingIndicatorTimeoutRef.current = setTimeout(() => setTypingUser(null), 2200);
            } else {
              if (typingIndicatorTimeoutRef.current) {
                clearTimeout(typingIndicatorTimeoutRef.current);
                typingIndicatorTimeoutRef.current = null;
              }
              setTypingUser(null);
            }
          })
          .subscribe();
      }
    };

    load();

    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
        typingIndicatorTimeoutRef.current = null;
      }
      if (typingBroadcastTimeoutRef.current) {
        clearTimeout(typingBroadcastTimeoutRef.current);
        typingBroadcastTimeoutRef.current = null;
      }
      lastTypingBroadcastRef.current = 0;
      setTypingUser(null);
    };
  }, [conversationId, router]);

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      toast.error('Supabase is not configured.');
      return;
    }
    if (!userId) {
      setError('Please sign in to send messages.');
      toast.error('Please sign in to send messages.');
      return;
    }
    if (!message.trim() || !conversationId) return;
    setSending(true);
    const trimmedBody = message.trim();
    const { data: inserted, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: trimmedBody,
      })
      .select('id, body, sender_id, created_at, profiles(full_name,email)')
      .maybeSingle();
    if (insertError) {
      setError(insertError.message);
      setSending(false);
      toast.error(insertError.message || 'Could not send your message.');
      return;
    }
    if (typingBroadcastTimeoutRef.current) {
      clearTimeout(typingBroadcastTimeoutRef.current);
      typingBroadcastTimeoutRef.current = null;
    }
    sendTypingSignal(false);
    const mapped: DisplayMessage = inserted
      ? {
          id: inserted.id,
          body: inserted.body,
          sender_id: inserted.sender_id,
          created_at: inserted.created_at,
          author:
            (inserted as any).profiles?.full_name ||
            (inserted as any).profiles?.email ||
            'You',
        }
      : {
          id: `local-${Date.now()}`,
          body: message.trim(),
          sender_id: userId,
          created_at: new Date().toISOString(),
          author: 'You',
        };
    setMessages((prev) => {
      if (prev.find((m) => m.id === mapped.id)) return prev;
      return [...prev, mapped];
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, lastMessage: trimmedBody, lastAt: new Date().toISOString() } : c
      )
    );
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new-message',
        payload: mapped,
      });
    }
    setMessage('');
    setSending(false);
    toast.success('Message sent', { id: 'message-status' });
  };

  const startConversation = async (profileOverride?: TargetProfile) => {
    setStartError('');
    if (!supabase) {
      setStartError('Supabase is not configured.');
      toast.error('Supabase is not configured.');
      return;
    }
    const rawInput = newEmail.trim();
    if (!profileOverride && !rawInput) {
      setStartError('Enter an email, name, or ID to start a chat.');
      return;
    }
    const { session } = await getSafeSession();
    const currentUserId = session?.user?.id;
    if (!currentUserId) {
      router.push('/sign-in');
      return;
    }
    setStartLoading(true);
    let targetProfile = profileOverride;
    if (!targetProfile) {
      const targetEmail = rawInput.toLowerCase();
      const isUuid = /^[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12}$/i.test(rawInput);
      const searchClauses = [
        `email.ilike.${rawInput}`,
        `email.ilike.%${targetEmail}%`,
        `full_name.ilike.%${targetEmail}%`,
        isUuid ? `id.eq.${rawInput}` : '',
      ].filter(Boolean);
      const { data: fetched, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .or(searchClauses.join(','))
        .maybeSingle();
      if (profileError || !fetched?.id) {
        setStartError(profileError?.message || 'User not found with that contact info.');
        setStartLoading(false);
        toast.error(profileError?.message || 'User not found with that contact info.');
        return;
      }
      targetProfile = fetched;
    }

    if (targetProfile.id === currentUserId) {
      setStartError('You cannot start a chat with yourself.');
      setStartLoading(false);
      toast.error('You cannot start a chat with yourself.');
      return;
    }

    // Check for existing conversation between both users
    const { data: myConvs } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);
    const myIds = (myConvs || []).map((c) => c.conversation_id);
    let conversationId = myIds[0] || null;
    if (myIds.length > 0) {
      const { data: shared } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('conversation_id', myIds)
        .eq('user_id', targetProfile.id);
      conversationId = shared?.[0]?.conversation_id || null;
    }

    if (!conversationId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ started_by: currentUserId })
        .select('id')
        .single();
      if (convError || !newConv?.id) {
        setStartError(convError?.message || 'Could not start conversation.');
        setStartLoading(false);
        toast.error(convError?.message || 'Could not start conversation.');
        return;
      }
      conversationId = newConv.id;
      await supabase.from('conversation_participants').insert([
        { conversation_id: conversationId, user_id: currentUserId },
        { conversation_id: conversationId, user_id: targetProfile.id },
      ]);
    } else {
      await supabase.from('conversation_participants').upsert(
        [
          { conversation_id: conversationId, user_id: currentUserId },
          { conversation_id: conversationId, user_id: targetProfile.id },
        ],
        { onConflict: 'conversation_id,user_id' }
      );
    }

    setStartLoading(false);
    setNewEmail('');
    const fallbackTitle = targetProfile.full_name || targetProfile.email || 'Conversation';
    setConversations((prev) => [
      { id: conversationId as string, title: fallbackTitle, lastMessage: '', lastAt: new Date().toISOString() },
      ...prev.filter((c) => c.id !== conversationId),
    ]);
    loadConversations();
    router.push(`/messages?id=${conversationId}`);
    toast.success('Conversation ready', { description: 'Start sending your first message.' });
  };

  const formatTime = (value?: string | null) =>
    value ? new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" className="text-[#1e3a5f] hover:text-[#d4af37]" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <p className="text-sm text-gray-500">Chats</p>
              <p className="text-lg font-semibold text-[#1e3a5f]">
                {conversationId ? otherName : 'All conversations'}
              </p>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-[#1e3a5f]">All conversations</CardTitle>
              <CardDescription className="text-gray-600">
                Select a thread or start a new one to message privately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1 space-y-3">
                  <div className="flex items-center gap-2 text-[#1e3a5f]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold">Conversations</span>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-2 max-h-96 overflow-y-auto space-y-2">
                    {conversationsLoading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : conversations.length === 0 ? (
                      <p className="text-sm text-gray-500">No conversations yet.</p>
                    ) : (
                      conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => router.push(`/messages?id=${conv.id}`)}
                          className={`w-full text-left rounded-md px-3 py-2 border ${
                            conv.id === conversationId ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#1e3a5f]">{conv.title}</p>
                          {conv.lastMessage && (
                            <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                          )}
                          {conv.lastAt && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {new Date(conv.lastAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                              {new Date(conv.lastAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3 space-y-2">
                    <p className="text-sm font-semibold text-[#1e3a5f]">Start new chat</p>
                    <Input
                      placeholder="Enter email, name, or user ID"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="text-sm placeholder:text-gray-500 text-gray-900"
                      style={{ minHeight: 44 }}
                    />
                    {startError && <p className="text-xs text-red-600">{startError}</p>}
                    {searchLoading && <p className="text-xs text-gray-500">Searching...</p>}
                    {searchResults.length > 0 && (
                      <div className="space-y-1">
                        {searchResults.slice(0, 5).map((profile) => (
                          <button
                            key={profile.id}
                            onClick={() => startConversation(profile)}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            <p className="font-semibold text-[#1e3a5f]">{profile.full_name || 'Military Helper user'}</p>
                            <p className="text-xs text-gray-600">{profile.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="bg-[#1e3a5f] text-white hover:bg-[#2a4a6f] w-full"
                      onClick={() => startConversation()}
                      disabled={startLoading}
                    >
                      {startLoading ? 'Starting...' : 'Start conversation'}
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {conversationId ? (
                    <>
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
                        {typingUser && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 pl-1">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span>{typingUser} is typing...</span>
                          </div>
                        )}
                        <div ref={bottomRef} />
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Write a message..."
                          value={message}
                          onChange={(e) => handleMessageChange(e.target.value)}
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
                    </>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-gray-600">
                      <p className="text-lg font-semibold text-[#1e3a5f] mb-2">Select a conversation</p>
                      <p className="text-sm">Choose a chat from the list or start a new one to begin messaging.</p>
                    </div>
                  )}
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

function MessagesSuspenseFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-gray-600">Loading messages...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
