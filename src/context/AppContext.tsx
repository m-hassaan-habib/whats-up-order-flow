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
  
  const addOrder = (order: Omit<OrderData, 'id'>) => {
    const newOrder: OrderData = { id: uuidv4(), orderNumber: generateOrderNumber(), ...order };
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
  
  // Helper function to generate a unique order number
  const generateOrderNumber = (): string => {
    const baseNumber = 1000;
    const randomNumber = Math.floor(Math.random() * 2000) + baseNumber;
    return `#${randomNumber}`;
  };

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
    
    return rows.map((row, index) => {
      const defaultOrderNumbers = ['1091', '1184', '1185', '1189', '1191', '1192'];
      const orderNumber = row.orderNumber || defaultOrderNumbers[index % defaultOrderNumbers.length];
      
      return {
        id: row.id || uuidv4(),
        orderNumber: orderNumber.replace(/^#/, ''),
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
