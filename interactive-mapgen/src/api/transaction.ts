import OpenAI from 'openai';
import type { IConfig, ITransaction } from '@/types';
import transactionPrompt from '@/prompts/transaction-prompt';


export async function callTransactionApi(config: IConfig): Promise<ITransaction[] | null> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
    dangerouslyAllowBrowser: true,
  });

  const completion = await client.chat.completions.create({
    model: 'grok-3-mini',
    messages: [
      {
        role: 'system',
        content: transactionPrompt,
      },
      {
        role: 'user',
        content: config ? "Here is the config: " + JSON.stringify(config) : '',
      },
    ],
  });

  const content = completion.choices[0].message.content;
  try {
    if (!content) return null;
    return JSON.parse(content.trim());
  } catch (e) {
    console.error('not valid json, output: ', content);
    return null;
  }
}