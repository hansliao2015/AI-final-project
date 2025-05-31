import OpenAI from "openai"

import type { IConfig, ITransaction } from "@/types"
import transactionPrompt from "@/prompts/transaction-prompt"
import testPrompt from "@/prompts/test-prompt"

export async function callTransactionApi(config: IConfig | null, instruction: string): Promise<ITransaction[]> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true,
  })

  const completion = await client.chat.completions.create({
    model: "grok-3-mini",
    messages: [
      {
        role: "system",
        content: transactionPrompt,
      },
      {
        role: "user",
        content: (config ? "\n<config>\n" + JSON.stringify(config) + "\n<config>\n" : "") + "\n<user-instruction>\n" + instruction + "\n<user-instruction>\n",
      },
    ],
  })

  const content = completion.choices[0].message.content
  try {
    if (!content) return []
    return JSON.parse(content.trim())
    return JSON.parse(testPrompt.trim()) // For testing purposes, replace with content when ready
  } catch (e) {
    console.error("Error parsing JSON content: ", e)
    // console.error("Invalid JSON content: ", content)
    return []
  }
}
