<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'

import type { Account, AccountType, Label } from '@/types/account'

const props = defineProps<{ modelValue: Account }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Account): void
  (e: 'remove', id: string): void
}>()

const LABELS_MAX = 50
const LOGIN_MAX = 100
const PASSWORD_MAX = 100

const typeOptions: { label: string; value: AccountType }[] = [
  { label: 'LDAP', value: 'LDAP' },
  { label: 'Локальная', value: 'LOCAL' },
]

const labelsToInput = (labels: Label[]) =>
  labels.map(l => l.text).join('; ')

const parseLabels = (input: string): Label[] =>
  input
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({ text }))

const draft = reactive<Account>({ ...props.modelValue })

const ui = reactive({
  labelsInput: '',
  touched: { login: false, password: false },
  errors: { login: false, password: false },
})

watch(() => props.modelValue, v => Object.assign(draft, v))

watch(
  () => draft.labels,
  labels => { ui.labelsInput = labelsToInput(labels) },
  { immediate: true }
)

const patch = (p: Partial<Account>) => Object.assign(draft, p)

const str = (v: string | undefined) => v ?? ''
const onLoginInput = (v: string | undefined) => patch({ login: str(v) })
const onPasswordInput = (v: string | undefined) => patch({ password: str(v) })

const ids = computed(() => ({
  labels: `acc-${draft.id}-labels`,
  type: `acc-${draft.id}-type`,
  login: `acc-${draft.id}-login`,
  password: `acc-${draft.id}-password`,
}))

const labelsCount = computed(() => ui.labelsInput.length)
const loginCount = computed(() => (draft.login ?? '').length)
const passwordCount = computed(() => (draft.password ?? '').length)

const isLoginValid = () => {
  const v = draft.login.trim()
  return v.length > 0 && v.length <= LOGIN_MAX
}

const isPasswordValid = () => {
  if (draft.type === 'LDAP') return true
  const v = (draft.password ?? '').trim()
  return v.length > 0 && v.length <= PASSWORD_MAX
}

const setErrors = () => {
  ui.errors.login = ui.touched.login ? !isLoginValid() : false
  ui.errors.password = ui.touched.password ? !isPasswordValid() : false
}

const commitIfValid = () => {
  setErrors()
  if (isLoginValid() && isPasswordValid()) {
    emit('update:modelValue', { ...draft })
  }
}

const loginInvalid = () => ui.touched.login && ui.errors.login
const passwordInvalid = () => ui.touched.password && ui.errors.password

const onTypeChange = (type: AccountType) => {
  if (type === 'LDAP') {
    patch({ type, password: null })
    ui.touched.password = false
    ui.errors.password = false
    commitIfValid()
    return
  }

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
</script>

<template>
  <div class="acc-row">
    <div class="acc-field">
      <label :for="ids.labels" class="acc-label">Метка</label>

      <InputText
        :inputId="ids.labels"
        v-model="ui.labelsInput"
        :maxlength="LABELS_MAX"
        @blur="onLabelsBlur"
        class="acc-input"
      />

      <div class="acc-counter-wrap">
        <small class="acc-counter">{{ labelsCount }}/{{ LABELS_MAX }}</small>
      </div>
    </div>

    <div class="acc-field">
      <label :for="ids.type" class="acc-label">Тип</label>

      <Select
        :inputId="ids.type"
        :modelValue="draft.type"
        :options="typeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onTypeChange"
        class="acc-input"
      />
    </div>

    <div class="acc-field">
      <label :for="ids.login" class="acc-label">Логин</label>

      <InputText
        :inputId="ids.login"
        :modelValue="draft.login"
        @update:modelValue="onLoginInput"
        :maxlength="LOGIN_MAX"
        @blur="onLoginBlur"
        :invalid="loginInvalid()"
        class="acc-input"
      />

      <div class="acc-counter-wrap">
        <small class="acc-counter">{{ loginCount }}/{{ LOGIN_MAX }}</small>
      </div>
    </div>

    <div class="acc-field">
      <label v-if="draft.type === 'LOCAL'" :for="ids.password" class="acc-label">Пароль</label>

      <InputText
        v-if="draft.type === 'LOCAL'"
        :inputId="ids.password"
        :modelValue="draft.password ?? ''"
        @update:modelValue="onPasswordInput"
        type="password"
        :maxlength="PASSWORD_MAX"
        @blur="onPasswordBlur"
        :invalid="passwordInvalid()"
        class="acc-input"
      />

      <div v-if="draft.type === 'LOCAL'" class="acc-counter-wrap">
        <small class="acc-counter">{{ passwordCount }}/{{ PASSWORD_MAX }}</small>
      </div>

      <div v-else class="acc-password-spacer"></div>
    </div>

    <div class="acc-actions">
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

<style scoped>
.acc-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr 1fr auto;
  gap: 12px;
  align-items: start;
}

.acc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.acc-label {
  font-size: 12px;
  line-height: 1.2;
  color: var(--text-color-secondary);
}

.acc-input {
  width: 100%;
}

.acc-counter-wrap {
  display: flex;
  justify-content: flex-end;
}

.acc-counter {
  opacity: 0.65;
  font-size: 12px;
  line-height: 1;
}

.acc-password-spacer {
  height: 40px;
}

.acc-actions {
  padding-top: 18px;
}
</style>
