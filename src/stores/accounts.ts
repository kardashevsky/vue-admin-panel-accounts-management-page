import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Account } from '@/types/account';

const STORAGE_KEY = 'vue-admin-accounts';

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  );

  watch(
    accounts,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true }
  );

  function addAccount(account: Account) {
    accounts.value.push(account);
  }

  function removeAccount(id: string) {
    accounts.value = accounts.value.filter(a => a.id !== id);
  }

  function updateAccount(updated: Account) {
    const idx = accounts.value.findIndex(a => a.id === updated.id);
    if (idx !== -1) accounts.value[idx] = updated;
  }

  return { accounts, addAccount, removeAccount, updateAccount };
});
