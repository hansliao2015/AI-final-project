import { create } from "zustand"

import type { IAppState } from "./types"

export const useAppStore = create<IAppState>()(set => ({
  isLoading: false,
  inputText: "",
  config: null,
  transactions: [],

  setIsLoading: isLoading => set({ isLoading }),
  setInputText: inputText => set({ inputText }),
  setConfig: config => set({ config }),
  setTransactions: transactions => set({ transactions })
}))
