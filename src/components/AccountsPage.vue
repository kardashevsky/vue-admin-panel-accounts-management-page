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

const TITLE = 'Учётные записи'
const BTN_ADD = 'Добавить'
const HINT_TEXT = 'Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;'
const EMPTY_TEXT = 'Нет учётных записей'
</script>

<template>
  <div class="acc-page">
    <div class="acc-header">
      <h2 class="acc-title">{{ TITLE }}</h2>
      <Button :label="BTN_ADD" icon="pi pi-plus" @click="addEmptyAccount" />
    </div>

    <Message
      v-if="store.accounts.length > 0"
      severity="info"
      :closable="false"
      class="acc-hint"
    >
      {{ HINT_TEXT }}
    </Message>

    <div class="acc-list">
      <div v-if="store.accounts.length === 0" class="acc-empty">
        {{ EMPTY_TEXT }}
      </div>

      <Card v-else v-for="acc in store.accounts" :key="acc.id">
        <template #content>
          <AccountRow :modelValue="acc" @update:modelValue="updateAccount" @remove="removeAccount" />
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.acc-page {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.acc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.acc-title {
  margin: 0;
}

.acc-hint {
  margin-bottom: 12px;
}

.acc-list {
  display: grid;
  gap: 12px;
}

.acc-empty {
  opacity: 0.7;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  text-align: center;
}
</style>
