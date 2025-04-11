
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrderData, OrderStatus, MessageTemplate, FAQItem, SettingsData } from '@/types';

interface AppContextType {
  orders: OrderData[];
  setOrders: React.Dispatch<React.SetStateAction<OrderData[]>>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  templates: MessageTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MessageTemplate[]>>;
  faqs: FAQItem[];
  setFaqs: React.Dispatch<React.SetStateAction<FAQItem[]>>;
  settings: SettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SettingsData>>;
  isWhatsappReady: boolean;
  setIsWhatsappReady: React.Dispatch<React.SetStateAction<boolean>>;
  selectedOrders: string[];
  setSelectedOrders: React.Dispatch<React.SetStateAction<string[]>>;
  toggleOrderSelection: (id: string) => void;
  selectAllOrders: (selected: boolean) => void;
  processingStatus: { [key: string]: 'idle' | 'processing' | 'success' | 'error' };
  setProcessingStatus: React.Dispatch<React.SetStateAction<{ [key: string]: 'idle' | 'processing' | 'success' | 'error' }>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default templates
const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Initial Contact',
    content: 'Assalam o Alikum, *Mr./Mrs. {name}*,\n\nHum *{businessName}* ki trf se aap se rabta kr rhy hain.\n\nAap ne hmari website pr *{product}* ka order kia tha jis ka order number *{orderNumber}* hai.\n\nAap se request hai ky Kindly order confirm kr den ta ky hum apka order jald az jald process kr den.\n\nBht Shukria!!',
    variables: ['name', 'businessName', 'product', 'orderNumber']
  },
  {
    id: '2',
    name: 'Follow-up',
    content: 'Assalam o Alikum, *Mr./Mrs. {name}*,\n\nHum *{businessName}* ki trf se dobara aap se rabta kr rhy hain.\n\nKya aap ne hmara pichla message dekha tha? Aap ne *{product}* ka order kia tha.\n\nHum iss order ko confirm karna chahte hain. Kya aap order confirm krna chahte hain?\n\nBht Shukria!!',
    variables: ['name', 'businessName', 'product']
  },
  {
    id: '3',
    name: 'Confirmation Thank You',
    content: 'Shukria *Mr./Mrs. {name}*,\n\nAap ka order confirm ho gaya hai. Hum isse jald hi process kr den ge.\n\n3-4 din mein aap ko delivery ho jaye gi.\n\nBht Shukria!!',
    variables: ['name']
  }
];

// Default FAQs
const defaultFaqs: FAQItem[] = [
  {
    id: '1',
    question: 'Delivery kitne din mein hogi?',
    answer: 'Delivery 3-4 din mein ho jaye gi.',
    keywords: ['delivery', 'din', 'time', 'kab', 'jaldi', 'pahunchay ga', 'pahunche', 'kitna']
  },
  {
    id: '2',
    question: 'Aap kahan se hain?',
    answer: 'Hum Lahore, Pakistan mein hain.',
    keywords: ['kahan', 'location', 'address', 'lahore', 'pakistan', 'daftar', 'office']
  },
  {
    id: '3',
    question: 'Main aur products kaise dekh sakta hoon?',
    answer: 'Aap hmari website {websiteUrl} par visit kr k sare products dekh sakte hain.',
    keywords: ['products', 'items', 'aur', 'dusre', 'website', 'catalog', 'dekh']
  },
  {
    id: '4',
    question: 'Main dobara order kaise karu?',
    answer: 'Dobara order karne k liye hmari website {websiteUrl} par visit karen.',
    keywords: ['dobara', 'again', 'order', 'kaise', 'phir', 'dubara', 'new']
  },
  {
    id: '5',
    question: 'Cash on delivery available hai?',
    answer: 'Ji han, cash on delivery available hai.',
    keywords: ['cash', 'cod', 'delivery', 'payment', 'paisa', 'rupay', 'method']
  }
];

// Default settings
const defaultSettings: SettingsData = {
  autoRun: false,
  headlessMode: false,
  messageInterval: 5, // minutes
  followUpInterval: 120, // minutes (2 hours)
  maxFollowUps: 3,
  businessName: 'Mihraaj Ventures',
  websiteUrl: 'https://mihraajventures.com',
  whatsappCredentials: undefined
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage if available, otherwise use defaults
  const [orders, setOrders] = useState<OrderData[]>(() => {
    const saved = localStorage.getItem('whatsbot_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem('whatsbot_templates');
    return saved ? JSON.parse(saved) : defaultTemplates;
  });
  
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('whatsbot_faqs');
    return saved ? JSON.parse(saved) : defaultFaqs;
  });
  
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('whatsbot_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [isWhatsappReady, setIsWhatsappReady] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<{ [key: string]: 'idle' | 'processing' | 'success' | 'error' }>({});
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('whatsbot_orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('whatsbot_templates', JSON.stringify(templates));
  }, [templates]);
  
  useEffect(() => {
    localStorage.setItem('whatsbot_faqs', JSON.stringify(faqs));
  }, [faqs]);
  
  useEffect(() => {
    localStorage.setItem('whatsbot_settings', JSON.stringify(settings));
  }, [settings]);
  
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === id ? { ...order, status } : order
      )
    );
  };
  
  const toggleOrderSelection = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) 
        ? prev.filter(orderId => orderId !== id)
        : [...prev, id]
    );
  };
  
  const selectAllOrders = (selected: boolean) => {
    if (selected) {
      const allOrderIds = orders.map(order => order.id);
      setSelectedOrders(allOrderIds);
    } else {
      setSelectedOrders([]);
    }
  };
  
  return (
    <AppContext.Provider value={{
      orders,
      setOrders,
      updateOrderStatus,
      templates,
      setTemplates,
      faqs,
      setFaqs,
      settings,
      setSettings,
      isWhatsappReady,
      setIsWhatsappReady,
      selectedOrders,
      setSelectedOrders,
      toggleOrderSelection,
      selectAllOrders,
      processingStatus,
      setProcessingStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
