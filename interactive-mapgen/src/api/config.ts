import OpenAI from "openai"

import type { IConfig } from "@/types"
import configPrompt from "@/prompts/config-prompt"

export async function callConfigApi(instruction: string): Promise<IConfig | null> {
  const client = new OpenAI({
    apiKey: import.meta.env.VITE_GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
    dangerouslyAllowBrowser: true
  })

  const completion = await client.chat.completions.create({
    model: "grok-3-mini",
    messages: [
      {
        role: "system",
        content: configPrompt
      },
      {
        role: "user",
        content: "Here is the user instruction: " + instruction
      },
    ],
  })
  const content = completion.choices[0].message.content
  try {
    if (!content) return null;
    return JSON.parse(content.trim())
  } catch (e) {
    console.error("Error parsing JSON content: ", e)
    console.error("Invalid JSON content: ", content)
    return null
  }
}
