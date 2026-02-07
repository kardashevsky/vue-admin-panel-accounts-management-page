<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import Button from 'primevue/button'
import Card from 'primevue/card'

import { useAccountsStore } from '@/stores/accounts'
import AccountRow from './AccountRow.vue'
import type { Account } from '@/types/account'

const store = useAccountsStore()

function addEmptyAccount() {
  store.addAccount({
    id: uuidv4(),
    labels: [],
    type: 'LOCAL',
    login: '',
    password: '',
  })
}

function updateAccount(acc: Account) {
  store.updateAccount(acc)
}

function removeAccount(id: string) {
  store.removeAccount(id)
}
</script>

<template>
  <div style="padding: 24px; max-width: 1100px; margin: 0 auto;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <h2>Учетные записи</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="addEmptyAccount" />
    </div>

    <div style="display:grid; gap:12px;">
      <Card v-for="acc in store.accounts" :key="acc.id">
        <template #content>
          <AccountRow
            :modelValue="acc"
            @update:modelValue="updateAccount"
            @remove="removeAccount"
          />
        </template>
      </Card>

      <div v-if="store.accounts.length === 0" style="opacity:.7;">
        Нет учетных записей
      </div>
    </div>
  </div>
</template>
