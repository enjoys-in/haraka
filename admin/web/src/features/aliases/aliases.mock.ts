import type { MailAlias } from './aliases.types';

// Placeholder aliases; replace with the aliases config contents.
export const MOCK_ALIASES: MailAlias[] = [
  {
    id: 'a1',
    address: 'info@cirrusmail.cloud',
    destinations: ['alice@cirrusmail.cloud', 'bob@cirrusmail.cloud'],
    type: 'alias',
    enabled: true,
  },
  {
    id: 'a2',
    address: 'support@cirrusmail.cloud',
    destinations: ['helpdesk@partner.net'],
    type: 'forward',
    enabled: true,
  },
  {
    id: 'a3',
    address: '*@cirrusmail.cloud',
    destinations: ['catchall@cirrusmail.cloud'],
    type: 'catchall',
    enabled: false,
  },
  {
    id: 'a4',
    address: 'sales@cirrusmail.cloud',
    destinations: ['crm@partner.net', 'sales-team@cirrusmail.cloud'],
    type: 'forward',
    enabled: true,
  },
];
