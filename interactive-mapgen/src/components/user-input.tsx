import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useAppStore } from "@/store"

import { callConfigApi } from "@/api/config"
import { callTransactionApi } from "@/api/transaction"

export function UserInput() {
  const inputText = useAppStore(state => state.inputText)
  const setUserInput = useAppStore(state => state.setInputText)
  const isLoading = useAppStore(state => state.isLoading)
  const setIsLoading = useAppStore(state => state.setIsLoading)
  const setConfig = useAppStore(state => state.setConfig)
  const setTransactions = useAppStore(state => state.setTransactions)

  async function handleSubmit() {
    setIsLoading(true)
    setConfig(null)
    setTransactions([])
    try {
      const config = await callConfigApi(inputText)
      setConfig(config)
      console.log("AI generated config: ", config)
      if (config) {
        const transactions = await callTransactionApi(config)
        setTransactions(transactions)
        console.log("AI generated transactions: ", transactions)
        setUserInput("")
      }
    } catch (e) {
      console.error("AI error: ", e)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center m-6 gap-2">
      <Input
        value={inputText}
        onChange={({ target }) => setUserInput(target.value)}
        onKeyDown={({ key }) => {
          if (key === "Enter" && !isLoading && inputText.trim()) handleSubmit()
        }}
        placeholder="請輸入描述，例如：北方有山，中心有湖"
        disabled={isLoading}
      />
      <Button
        onClick={handleSubmit}
        disabled={isLoading || !inputText.trim()}
      >
        {isLoading ? "Generating..." : "Generate Config"}
      </Button>
    </div>
  )
}
