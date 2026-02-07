<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

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
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <h2>Учетные записи</h2>
      <Button label="Добавить" icon="pi pi-plus" @click="addEmptyAccount" />
    </div>

    <Message severity="info" :closable="false" style="margin-bottom:12px;">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </Message>

    <div
      style="
        display:grid;
        grid-template-columns: 1.2fr 0.8fr 1fr 1fr auto;
        gap: 12px;
        padding: 0 12px 8px;
        font-size: 12px;
        opacity: .8;
      "
    >
      <div>Метка</div>
      <div>Тип</div>
      <div>Логин *</div>
      <div>Пароль *</div>
      <div></div>
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
