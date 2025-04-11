
export type OrderStatus = 'Not Responding' | 'To Process' | 'Confirmed' | 'Cancelled';

export interface OrderData {
  id: string;
  product: string;
  name: string;
  phone: string;
  address: string;
  status: OrderStatus;
  lastMessageSent?: string;
  lastResponseReceived?: string;
  responseCount?: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface SettingsData {
  autoRun: boolean;
  headlessMode: boolean;
  messageInterval: number;
  followUpInterval: number;
  maxFollowUps: number;
  businessName: string;
  websiteUrl: string;
  whatsappCredentials?: {
    username: string;
    saved: boolean;
  };
}
