<script setup lang="ts">
import { reactive, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

import type { Account, AccountType, Label } from '@/types/account'

const props = defineProps<{ modelValue: Account }>()
const draft = reactive<Account>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (v) => Object.assign(draft, v),
  { deep: true }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: Account): void
  (e: 'remove', id: string): void
}>()

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
  return labels.map((l) => l.text).join('; ')
}

function parseLabels(input: string): Label[] {
  return input
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text }))
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

watch(
  () => draft.labels,
  (labels) => {
    state.labelsInput = labelsToInput(labels)
  },
  { immediate: true, deep: true }
)

function updateLocal(patch: Partial<Account>) {
  Object.assign(draft, patch)
}

function commitIfValid() {
  if (validate(draft)) {
    emit('update:modelValue', { ...draft })
  }
}

function onTypeChange(type: AccountType) {
  if (type === 'LDAP') {
    updateLocal({ type, password: null })
    state.errors.password = false
    state.touched.password = false
  } else {
    updateLocal({ type, password: draft.password ?? '' })
  }
  commitIfValid()
}

function onLabelsBlur() {
  const raw = state.labelsInput.slice(0, 50)
  const parsed = parseLabels(raw)
  updateLocal({ labels: parsed })
  state.labelsInput = labelsToInput(parsed)
  emit('update:modelValue', { ...draft })
}

function onLoginBlur() {
  state.touched.login = true
  const next = draft.login.slice(0, 100)
  updateLocal({ login: next })
  commitIfValid()
}

function onPasswordBlur() {
  state.touched.password = true
  if (draft.type === 'LDAP') return
  const next = (draft.password ?? '').slice(0, 100)
  updateLocal({ password: next })
  commitIfValid()
}

const loginInvalid = () => state.touched.login && state.errors.login
const passwordInvalid = () => state.touched.password && state.errors.password
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 1.2fr 0.8fr 1fr 1fr auto;
      gap: 12px;
      align-items: start;
    "
  >
    <div>
      <InputText
        v-model="state.labelsInput"
        placeholder="tag1; tag2; tag3"
        maxlength="50"
        @blur="onLabelsBlur"
        style="width: 100%;"
      />
    </div>

    <div>
      <Select
        :modelValue="draft.type"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onTypeChange"
        style="width: 100%;"
      />
    </div>

    <div>
      <InputText
        :modelValue="draft.login"
        @update:modelValue="(v) => updateLocal({ login: v })"
        maxlength="100"
        @blur="onLoginBlur"
        :invalid="loginInvalid()"
        style="width: 100%;"
      />
    </div>

    <div>
      <InputText
        v-if="draft.type === 'LOCAL'"
        :modelValue="draft.password ?? ''"
        @update:modelValue="(v) => updateLocal({ password: v })"
        type="password"
        maxlength="100"
        @blur="onPasswordBlur"
        :invalid="passwordInvalid()"
        style="width: 100%;"
      />
      <div v-else style="height: 40px;"></div>
    </div>

    <div style="padding-top: 6px;">
      <Button
        type="button"
        icon="pi pi-trash"
        severity="danger"
        text
        @click="emit('remove', draft.id)"
      />
    </div>
  </div>
</template>
