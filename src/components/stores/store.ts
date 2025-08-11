import { proxy } from "valtio"

export const state = proxy<{ current: string | null }>({ current: null })
