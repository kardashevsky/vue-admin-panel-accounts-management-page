<script setup lang="ts">
import { reactive, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

import type { Account, AccountType, Label } from '@/types/account'

const props = defineProps<{ modelValue: Account }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Account): void
  (e: 'remove', id: string): void
}>()

const draft = reactive<Account>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (v) => Object.assign(draft, v),
  { deep: true }
)

const typeOptions: { label: string; value: AccountType }[] = [
  { label: 'LDAP', value: 'LDAP' },
  { label: 'Локальная', value: 'LOCAL' },
]

const ui = reactive({
  labelsInput: '',
  touched: { login: false, password: false },
  errors: { login: false, password: false },
})

const labelsToInput = (labels: Label[]) => labels.map(l => l.text).join('; ')

const parseLabels = (input: string): Label[] =>
  input
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({ text }))

watch(
  () => draft.labels,
  (labels) => {
    ui.labelsInput = labelsToInput(labels)
  },
  { immediate: true, deep: true }
)

const patch = (p: Partial<Account>) => Object.assign(draft, p)

const LABELS_MAX = 50
const LOGIN_MAX = 100
const PASSWORD_MAX = 100

function isLoginValid() {
  const v = draft.login.trim()
  return v.length > 0 && v.length <= LOGIN_MAX
}

function isPasswordValid() {
  if (draft.type === 'LDAP') return true
  const v = (draft.password ?? '').trim()
  return v.length > 0 && v.length <= PASSWORD_MAX
}

function setErrors() {
  ui.errors.login = ui.touched.login ? !isLoginValid() : false
  ui.errors.password = ui.touched.password ? !isPasswordValid() : false
}

function commitIfValid() {
  setErrors()
  if (isLoginValid() && isPasswordValid()) {
    emit('update:modelValue', { ...draft })
  }
}

const onTypeChange = (type: AccountType) => {
  if (type === 'LDAP') {
    patch({ type, password: null })
    ui.touched.password = false
    ui.errors.password = false
    commitIfValid()
    return
  }

  // LOCAL
  patch({ type, password: draft.password ?? '' })
  ui.touched.password = true
  commitIfValid()
}

const onLabelsBlur = () => {
  const raw = ui.labelsInput.slice(0, LABELS_MAX)
  const parsed = parseLabels(raw)
  patch({ labels: parsed })
  ui.labelsInput = labelsToInput(parsed)
  emit('update:modelValue', { ...draft })
}

const onLoginBlur = () => {
  ui.touched.login = true
  patch({ login: draft.login.slice(0, LOGIN_MAX) })
  commitIfValid()
}

const onPasswordBlur = () => {
  if (draft.type === 'LDAP') return
  ui.touched.password = true
  patch({ password: (draft.password ?? '').slice(0, PASSWORD_MAX) })
  commitIfValid()
}

const loginInvalid = () => ui.touched.login && ui.errors.login
const passwordInvalid = () => ui.touched.password && ui.errors.password

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr 1fr 1fr auto',
  gap: '12px',
  alignItems: 'start',
} as const
</script>

<template>
  <div :style="rowStyle">
    <div>
      <InputText
        v-model="ui.labelsInput"
        :maxlength="LABELS_MAX"
        @blur="onLabelsBlur"
        style="width:100%;"
      />
    </div>

    <div>
      <Select
        :modelValue="draft.type"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onTypeChange"
        style="width:100%;"
      />
    </div>

    <div>
      <InputText
        :modelValue="draft.login"
        @update:modelValue="(v) => patch({ login: v })"
        :maxlength="LOGIN_MAX"
        @blur="onLoginBlur"
        :invalid="loginInvalid()"
        style="width:100%;"
      />
    </div>

    <div>
      <InputText
        v-if="draft.type === 'LOCAL'"
        :modelValue="draft.password ?? ''"
        @update:modelValue="(v) => patch({ password: v })"
        type="password"
        :maxlength="PASSWORD_MAX"
        @blur="onPasswordBlur"
        :invalid="passwordInvalid()"
        style="width:100%;"
      />
      <div v-else style="height:40px;"></div>
    </div>

    <div style="padding-top:6px;">
      <Button type="button" icon="pi pi-trash" severity="danger" text @click="emit('remove', draft.id)" />
    </div>
  </div>
</template>
