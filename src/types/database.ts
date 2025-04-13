
import type { Database } from '@/integrations/supabase/types';

// Export existing types from the Database type
export type Tables = Database['public']['Tables'];

// Define types for orders table
export type Order = Tables['orders']['Row'];
export type OrderInsert = Tables['orders']['Insert'];
export type OrderUpdate = Tables['orders']['Update'];

// Define types for templates table
export type Template = Tables['templates']['Row'];
export type TemplateInsert = Tables['templates']['Insert'];
export type TemplateUpdate = Tables['templates']['Update'];

// Define types for message_logs table
export type MessageLog = Tables['message_logs']['Row'];
export type MessageLogInsert = Tables['message_logs']['Insert'];
export type MessageLogUpdate = Tables['message_logs']['Update'];

// Define types for whatsapp_sessions table
export type WhatsappSession = Tables['whatsapp_sessions']['Row'];
export type WhatsappSessionInsert = Tables['whatsapp_sessions']['Insert'];
export type WhatsappSessionUpdate = Tables['whatsapp_sessions']['Update'];
