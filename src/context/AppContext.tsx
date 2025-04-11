import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { OrderData, OrderStatus, MessageTemplate, FAQItem, SettingsData } from '@/types';
import { toast } from 'sonner';

interface AppContextType {
  orders: OrderData[];
  addOrder: (order: Omit<OrderData, 'id'>) => void;
  updateOrder: (id: string, updates: Partial<OrderData>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  templates: MessageTemplate[];
  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  faqs: FAQItem[];
  addFaq: (faq: Omit<FAQItem, 'id'>) => void;
  updateFaq: (id: string, updates: Partial<FAQItem>) => void;
  deleteFaq: (id: string) => void;
  settings: SettingsData;
  updateSettings: (updates: Partial<SettingsData>) => void;
  isWhatsappReady: boolean;
  setWhatsappReady: (ready: boolean) => void;
  selectedOrders: string[];
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: (checked: boolean) => void;
  clearAllOrders: () => void;
  processingStatus: { [orderId: string]: 'idle' | 'processing' | 'success' | 'error' };
  setProcessingStatus: (status: { [orderId: string]: 'idle' | 'processing' | 'success' | 'error' }) => void;
  // Add the setters that were missing in the interface
  setOrders: React.Dispatch<React.SetStateAction<OrderData[]>>;
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  setFaqs: React.Dispatch<React.SetStateAction<FAQItem[]>>;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData>>;
  processIncomingMessage: (phone: string, message: string) => void;
  messageDeliveryLogs: {
    id: string;
    phone: string;
    orderNumber: string;
    customerName: string;
    timestamp: string;
    status: 'delivered' | 'failed';
    errorMessage?: string;
  }[];
  addMessageLog: (log: Omit<AppContextType['messageDeliveryLogs'][0], 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: uuidv4(),
    name: 'Order Confirmation',
    content: `Hi {name}, your order #{orderNumber} has been confirmed. Thank you!`,
    variables: ['name', 'orderNumber'],
  },
  {
    id: uuidv4(),
    name: 'Shipping Update',
    content: `Hello {name}, your order #{orderNumber} is on its way! Track it at {websiteUrl}`,
    variables: ['name', 'orderNumber', 'websiteUrl'],
  },
];

const defaultFaqs: FAQItem[] = [
  {
    id: uuidv4(),
    question: 'How do I track my order?',
    answer: 'You can track your order by visiting our website and entering your order number.',
    keywords: ['track', 'order', 'tracking'],
  },
  {
    id: uuidv4(),
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers.',
    keywords: ['payment', 'methods', 'credit card', 'paypal'],
  },
];

const defaultSettings: SettingsData = {
  autoRun: false,
  headlessMode: true,
  messageInterval: 60,
  followUpInterval: 120,
  maxFollowUps: 3,
  businessName: 'My Business',
  websiteUrl: 'https://mybusiness.com',
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [faqs, setFaqs] = useState<FAQItem[]>(defaultFaqs);
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [isWhatsappReady, setWhatsappReady] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<{ [orderId: string]: 'idle' | 'processing' | 'success' | 'error' }>({});
  const [messageDeliveryLogs, setMessageDeliveryLogs] = useState<AppContextType['messageDeliveryLogs']>([]);
  
  useEffect(() => {
    // Load data from localStorage on component mount
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
    
    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      setTemplates(defaultTemplates);
    }
    
    const storedFaqs = localStorage.getItem('faqs');
    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs));
    } else {
      setFaqs(defaultFaqs);
    }
    
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      setSettings(defaultSettings);
    }
  }, []);
  
  useEffect(() => {
    // Save data to localStorage whenever it changes
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);
  
  useEffect(() => {
    localStorage.setItem('faqs', JSON.stringify(faqs));
  }, [faqs]);
  
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);
  
  // New effect to store message logs
  useEffect(() => {
    localStorage.setItem('messageDeliveryLogs', JSON.stringify(messageDeliveryLogs));
  }, [messageDeliveryLogs]);
  
  useEffect(() => {
    // Load message logs from localStorage
    const storedLogs = localStorage.getItem('messageDeliveryLogs');
    if (storedLogs) {
      setMessageDeliveryLogs(JSON.parse(storedLogs));
    }
  }, []);
  
  const addOrder = (order: Omit<OrderData, 'id'>) => {
    const newOrder: OrderData = { 
      id: uuidv4(), 
      orderNumber: order.orderNumber || generateOrderNumber(), 
      ...order 
    };
    setOrders([...orders, newOrder]);
  };
  
  const updateOrder = (id: string, updates: Partial<OrderData>) => {
    setOrders(orders.map(order => (order.id === id ? { ...order, ...updates } : order)));
  };
  
  const deleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
    setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
  };
  
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(
      orders.map(order =>
        order.id === id ? { ...order, status } : order
      )
    );
  };
  
  // Handle incoming WhatsApp messages and update order status accordingly
  const processIncomingMessage = useCallback((phone: string, message: string) => {
    const order = orders.find(o => o.phone === phone && o.status === 'To Process');
    
    if (!order) return;
    
    // Check for confirmation keywords
    const confirmationKeywords = [
      'yes', 'ok', 'perfect', 'g', 'hn g', 'hn ji', 'han', 'kr do', 
      'confirmed', 'confirm hai', 'done'
    ];
    
    const normalizedMessage = message.toLowerCase().trim();
    
    // Check if message contains any confirmation keyword
    const isConfirmation = confirmationKeywords.some(keyword => 
      normalizedMessage === keyword || normalizedMessage.includes(keyword)
    );
    
    if (isConfirmation) {
      updateOrderStatus(order.id, 'Confirmed');
      
      // Record the response
      updateOrder(order.id, {
        lastResponseReceived: new Date().toISOString(),
        responseCount: (order.responseCount || 0) + 1
      });
      
      toast.success(`Order #${order.orderNumber} has been confirmed`);
    }
  }, [orders]);
  
  const addTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = { id: uuidv4(), ...template };
    setTemplates([...templates, newTemplate]);
  };
  
  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(templates.map(template => (template.id === id ? { ...template, ...updates } : template)));
  };
  
  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };
  
  const addFaq = (faq: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = { id: uuidv4(), ...faq };
    setFaqs([...faqs, newFaq]);
  };
  
  const updateFaq = (id: string, updates: Partial<FAQItem>) => {
    setFaqs(faqs.map(faq => (faq.id === id ? { ...faq, ...updates } : faq)));
  };
  
  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };
  
  const updateSettings = (updates: Partial<SettingsData>) => {
    setSettings({ ...settings, ...updates });
  };
  
  const toggleOrderSelection = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  
  const selectAllOrders = (checked: boolean) => {
    if (checked) {
      const allOrderIds = orders.map(order => order.id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };
  
  const clearAllOrders = () => {
    setSelectedOrders([]);
  };
  
  // Add a new message delivery log
  const addMessageLog = useCallback((log: Omit<AppContextType['messageDeliveryLogs'][0], 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    setMessageDeliveryLogs(prev => [newLog, ...prev]);
  }, []);
  
  // Helper function to check for non-responsive orders and update status
  const checkNonResponsiveOrders = useCallback(() => {
    const now = new Date();
    const nonResponseThreshold = 48; // hours
    
    orders.forEach(order => {
      if (order.status !== 'To Process' || !order.lastMessageSent) return;
      
      const lastMessageDate = new Date(order.lastMessageSent);
      const hoursSinceLastMessage = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);
      
      // If more than 48 hours have passed with no response
      if (hoursSinceLastMessage > nonResponseThreshold) {
        updateOrderStatus(order.id, 'Not Responding');
        toast.info(`Order #${order.orderNumber} marked as Not Responding due to inactivity`);
      }
    });
  }, [orders]);
  
  // Check for non-responsive orders every hour
  useEffect(() => {
    const intervalId = setInterval(checkNonResponsiveOrders, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [checkNonResponsiveOrders]);
  
  // Helper function to generate a unique order number
  const generateOrderNumber = (): string => {
    const baseNumber = 1000;
    const randomNumber = Math.floor(Math.random() * 2000) + baseNumber;
    return `${randomNumber}`;
  };

  // Parsing CSV data with orderNumber field
  const parseCSVData = (csvData: string): OrderData[] => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      return headers.reduce((obj: { [key: string]: string }, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });
    
    const defaultOrderNumbers = ['1091', '1184', '1185', '1189', '1191', '1192'];
    
    return rows.map((row, index) => {
      // Get orderNumber from row or use default if none exists
      let orderNumber = row.orderNumber || defaultOrderNumbers[index % defaultOrderNumbers.length];
      // Remove # if present in order number
      orderNumber = orderNumber.replace(/^#/, '');
      
      return {
        id: row.id || uuidv4(),
        orderNumber,
        name: row.name,
        phone: row.phone,
        product: row.product,
        address: row.address,
        status: (row.status as OrderStatus) || 'To Process',
      };
    });
  };
  
  const appContextValue: AppContextType = {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    faqs,
    addFaq,
    updateFaq,
    deleteFaq,
    settings,
    updateSettings,
    isWhatsappReady,
    setWhatsappReady,
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,
    clearAllOrders,
    processingStatus,
    setProcessingStatus,
    setOrders,
    setTemplates,
    setFaqs,
    setSettings,
    processIncomingMessage,
    messageDeliveryLogs,
    addMessageLog
  };
  
  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
