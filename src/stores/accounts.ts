import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Account } from '@/types/account'

const STORAGE_KEY = 'vue-admin-accounts'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  )

  watch(
    accounts,
    (next) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    },
    { deep: true }
  )

  function addAccount(account: Account) {
    accounts.value.push(account)
  }

  function removeAccount(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id)
  }

  function updateAccount(account: Account) {
    const normalized: Account = {
      ...account,
      password: account.type === 'LDAP' ? null : account.password,
    }

    const index = accounts.value.findIndex(a => a.id === normalized.id)
    if (index !== -1) {
      accounts.value[index] = normalized
    }
  }

  return { accounts, addAccount, removeAccount, updateAccount }
})
