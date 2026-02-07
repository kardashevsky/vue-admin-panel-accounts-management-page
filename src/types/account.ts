export type AccountType = 'LDAP' | 'LOCAL';

export interface Label {
  text: string;
}

export interface Account {
  id: string;
  labels: Label[];
  type: AccountType;
  login: string;
  password: string | null;
}
