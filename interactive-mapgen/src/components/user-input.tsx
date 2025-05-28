import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { callConfigApi } from "@/api/config"
import { callTransactionApi } from "@/api/transaction"
import type { ITransaction, IConfig } from "@/types"

export function UserInput() {
  const [userInput, setUserInput] = useState("")
  const [isloading, setIsLoading] = useState(false)
  const [config, setConfig] = useState<IConfig | null>(null)
  const [transactions, setTransactions] = useState<ITransaction[] | null>(null)

  async function handleSubmit() {
    setIsLoading(true)
    setConfig(null)
    setTransactions(null)
    try {
      const config = await callConfigApi(userInput)
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
    <div className="flex flex-col mx-6 my-6 gap-2">
      <Input
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        placeholder="請輸入描述，例如：北方有山，中心有湖"
        disabled={isloading}
      />
      <Button
        onClick={handleSubmit}
        disabled={isloading || !userInput.trim()}
        className="mt-1"
      >
        {isloading ? "Generating..." : "Generate Config"}
      </Button>
    </div>
  )
}
