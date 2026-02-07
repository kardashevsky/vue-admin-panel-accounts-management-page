<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

import type { Account, AccountType, Label } from '@/types/account'

const props = defineProps<{ modelValue: Account }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: Account): void; (e: 'remove', id: string): void }>()

const typeOptions: { label: string; value: AccountType }[] = [
  { label: 'LDAP', value: 'LDAP' },
  { label: 'Локальная', value: 'LOCAL' },
]

const state = reactive({
  labelsInput: '',
  touched: {
    login: false,
    password: false,
  },
  errors: {
    login: false,
    password: false,
  },
})

function labelsToInput(labels: Label[]) {
  return labels.map(l => l.text).join('; ')
}

function parseLabels(input: string): Label[] {
  return input
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 50) // защита от мусора; лимит по длине поля ниже
    .map(text => ({ text }))
}

function validate(acc: Account) {
  const loginOk = acc.login.trim().length > 0 && acc.login.length <= 100
  const passwordOk =
    acc.type === 'LDAP'
      ? true
      : acc.password !== null && acc.password.trim().length > 0 && acc.password.length <= 100

  state.errors.login = state.touched.login ? !loginOk : false
  state.errors.password = state.touched.password ? !passwordOk : false

  return loginOk && passwordOk
}

const account = computed(() => props.modelValue)

watch(
  () => props.modelValue.labels,
  (labels) => {
    state.labelsInput = labelsToInput(labels)
  },
  { immediate: true, deep: true }
)

function update(patch: Partial<Account>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

function onTypeChange(type: AccountType) {
  if (type === 'LDAP') {
    update({ type, password: null })
    // пароль больше не валидируем
    state.errors.password = false
    state.touched.password = false
  } else {
    update({ type, password: props.modelValue.password ?? '' })
  }
  // сохранение по change
  validate({ ...props.modelValue, type, password: type === 'LDAP' ? null : (props.modelValue.password ?? '') })
}

function onLabelsBlur() {
  const raw = state.labelsInput.slice(0, 50) // максимум 50 символов
  state.labelsInput = raw
  update({ labels: parseLabels(raw) })
  // метка необязательная, валидации нет
}

function onLoginBlur() {
  state.touched.login = true
  const next = props.modelValue.login.slice(0, 100)
  if (next !== props.modelValue.login) update({ login: next })
  validate({ ...props.modelValue, login: next })
}

function onPasswordBlur() {
  state.touched.password = true
  if (props.modelValue.type === 'LDAP') return
  const next = (props.modelValue.password ?? '').slice(0, 100)
  if (next !== props.modelValue.password) update({ password: next })
  validate({ ...props.modelValue, password: next })
}

const loginInvalid = computed(() => state.errors.login)
const passwordInvalid = computed(() => state.errors.password)
</script>

<template>
  <div
    style="
      display:grid;
      grid-template-columns: 1.2fr 0.8fr 1fr 1fr auto;
      gap: 12px;
      align-items: start;
    "
  >
    <div>
      <label style="display:block; font-size:12px; opacity:.8; margin-bottom:6px;">Метка</label>
      <InputText
        v-model="state.labelsInput"
        placeholder="tag1; tag2; tag3"
        maxlength="50"
        @blur="onLabelsBlur"
        style="width:100%;"
      />
      <small style="display:block; margin-top:6px; opacity:.7;">Введите метки через ;</small>
    </div>

    <div>
      <label style="display:block; font-size:12px; opacity:.8; margin-bottom:6px;">Тип</label>
      <Dropdown
        :modelValue="account.type"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onTypeChange"
        style="width:100%;"
      />
    </div>

    <div>
      <label style="display:block; font-size:12px; opacity:.8; margin-bottom:6px;">Логин *</label>
      <InputText
        :modelValue="account.login"
        @update:modelValue="(v) => update({ login: v })"
        maxlength="100"
        @blur="onLoginBlur"
        :invalid="loginInvalid"
        style="width:100%;"
      />
    </div>

    <div>
      <label style="display:block; font-size:12px; opacity:.8; margin-bottom:6px;">Пароль *</label>
      <InputText
        v-if="account.type === 'LOCAL'"
        :modelValue="account.password ?? ''"
        @update:modelValue="(v) => update({ password: v })"
        type="password"
        maxlength="100"
        @blur="onPasswordBlur"
        :invalid="passwordInvalid"
        style="width:100%;"
      />
      <div v-else style="height:40px; display:flex; align-items:center; opacity:.7;">
        скрыт для LDAP
      </div>
    </div>

    <div style="padding-top:22px;">
      <Button
        type="button"
        icon="pi pi-trash"
        severity="danger"
        text
        @click="emit('remove', account.id)"
      />
    </div>
  </div>
</template>
