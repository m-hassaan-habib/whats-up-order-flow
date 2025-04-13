
import { supabase } from '@/integrations/supabase/client';
import { 
  Order, OrderInsert, OrderUpdate,
  Template, TemplateInsert, TemplateUpdate,
  MessageLog, MessageLogInsert,
  WhatsappSession, WhatsappSessionUpdate
} from '@/types/database';

// Order services
export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  createOrder: async (order: OrderInsert): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateOrder: async (id: string, updates: OrderUpdate): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteOrder: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Template services
export const templateService = {
  getTemplates: async (): Promise<Template[]> => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  createTemplate: async (template: TemplateInsert): Promise<Template> => {
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateTemplate: async (id: string, updates: TemplateUpdate): Promise<Template> => {
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteTemplate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Message log services
export const messageLogService = {
  getLogs: async (): Promise<MessageLog[]> => {
    const { data, error } = await supabase
      .from('message_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  createLog: async (log: MessageLogInsert): Promise<MessageLog> => {
    const { data, error } = await supabase
      .from('message_logs')
      .insert(log)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// WhatsApp session services
export const whatsappService = {
  getSession: async (): Promise<WhatsappSession | null> => {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
  
  updateSession: async (id: string, updates: WhatsappSessionUpdate): Promise<WhatsappSession> => {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  createSession: async (): Promise<WhatsappSession> => {
    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .insert({
        connection_status: 'disconnected'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
