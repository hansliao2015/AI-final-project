import OpenAI from "openai"

import optimizationPrompt from "@/prompts/optimization-prompt"

export async function callOptimizationApi(instruction: string): Promise<string> {
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
        content: optimizationPrompt,
      },
      {
        role: "user",
        content: "Here is the user instruction: " + instruction,
      },
    ],
  })

  const content = completion.choices[0].message.content
  try {
    if (!content) return ""
    return content
    return ""
  } catch (e) {
    console.error("Error parsing content: ", e)
    return ""
  }
}
