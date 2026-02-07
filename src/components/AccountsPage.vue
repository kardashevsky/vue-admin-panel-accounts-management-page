<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

import AccountRow from './AccountRow.vue'
import { useAccountsStore } from '@/stores/accounts'
import type { Account } from '@/types/account'

const store = useAccountsStore()

const addEmptyAccount = () => {
  store.addAccount({
    id: uuidv4(),
    labels: [],
    type: 'LOCAL',
    login: '',
    password: '',
  })
}

const updateAccount = (acc: Account) => store.updateAccount(acc)
const removeAccount = (id: string) => store.removeAccount(id)
</script>

<template>
  <div style="padding:24px;max-width:1100px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h2 style="margin:0;">Учётные записи</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="addEmptyAccount" />
    </div>

    <Message v-if="store.accounts.length > 0" severity="info" :closable="false" style="margin-bottom:12px;">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </Message>

    <div style="display:grid;gap:12px;">
      <div
        v-if="store.accounts.length === 0"
        style="
          opacity:.7;
          display:flex;
          justify-content:center;
          align-items:center;
          min-height:200px;
          text-align:center;
        "
      >
        Нет учётных записей
      </div>

      <Card v-else v-for="acc in store.accounts" :key="acc.id">
        <template #content>
          <AccountRow :modelValue="acc" @update:modelValue="updateAccount" @remove="removeAccount" />
        </template>
      </Card>
    </div>
  </div>
</template>
