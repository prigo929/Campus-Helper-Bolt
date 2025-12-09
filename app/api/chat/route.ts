import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { groq } from '@ai-sdk/groq';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const gateway = process.env.AI_GATEWAY_API_KEY
    ? createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY })
    : null;

  if (!gateway && !process.env.OPENAI_API_KEY && !process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY or OPENAI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages }: { messages?: Array<{ id?: string }> } = await req.json();

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const uiMessages = messages.map(({ id: _id, ...rest }) => rest) as Parameters<typeof convertToModelMessages>[0];
  const modelMessages = convertToModelMessages(uiMessages);

  const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  const model = process.env.GROQ_API_KEY
    ? groq(groqModel)
    : gateway
      ? gateway('openai/gpt-4o-mini')
      : openai('gpt-4o-mini');

  const result = await streamText({
    model,
    system:
      'You are Military Helper AI, a concise assistant for crews. Keep answers short, helpful, and focused on missions, supply exchange, briefings, and operational coordination. If asked about account data, remind them you cannot see their private information.',
    messages: modelMessages,
    temperature: 0.6,
  });

  return result.toUIMessageStreamResponse();
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      usingGateway: Boolean(process.env.AI_GATEWAY_API_KEY),
      model: 'openai/gpt-4o-mini',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
