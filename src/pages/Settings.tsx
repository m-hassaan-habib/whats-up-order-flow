
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Smartphone, Save, Trash2, PlusCircle, XCircle, Edit, CheckCircle, MessageSquare, InfoIcon, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageTemplate, FAQItem } from '@/types';
import { toast } from 'sonner';

const Settings = () => {
  const { 
    settings, 
    templates, 
    faqs, 
    isWhatsappReady,
    setSettings,
    setTemplates,
    setFaqs,
    setWhatsappReady
  } = useAppContext();
  
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showFaqDialog, setShowFaqDialog] = useState(false);
  
  // WhatsApp connection simulation state
  const [connecting, setConnecting] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  
  const saveSettings = () => {
    setSettings(localSettings);
    toast.success("Settings saved successfully");
  };
  
  const connectWhatsApp = () => {
    setConnecting(true);
    
    if (!localSettings.headlessMode) {
      // Show QR code for scanning
      setQrCodeVisible(true);
      
      // Simulate successful QR code scan after 5 seconds
      setTimeout(() => {
        setQrCodeVisible(false);
        setConnecting(false);
        setIsWhatsappReady(true);
        toast.success("WhatsApp connected successfully!");
      }, 5000);
    } else {
      // Simulate headless connection
      setTimeout(() => {
        setConnecting(false);
        setIsWhatsappReady(true);
        toast.success("WhatsApp connected successfully!");
      }, 3000);
    }
  };
  
  const handleSaveTemplate = (template: MessageTemplate) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(t => 
        t.id === template.id ? template : t
      ));
      toast.success("Template updated successfully");
    } else {
      // Add new template
      setTemplates([...templates, { ...template, id: uuidv4() }]);
      toast.success("New template added successfully");
    }
    
    setEditingTemplate(null);
    setShowTemplateDialog(false);
  };
  
  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted successfully");
  };
  
  const handleSaveFaq = (faq: FAQItem) => {
    if (editingFaq) {
      // Update existing FAQ
      setFaqs(faqs.map(f => 
        f.id === faq.id ? faq : f
      ));
      toast.success("FAQ updated successfully");
    } else {
      // Add new FAQ
      setFaqs([...faqs, { ...faq, id: uuidv4() }]);
      toast.success("New FAQ added successfully");
    }
    
    setEditingFaq(null);
    setShowFaqDialog(false);
  };
  
  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
    toast.success("FAQ deleted successfully");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure WhatsBot settings and message templates
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="w-full grid grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="faqs">FAQs & Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Connection</CardTitle>
              <CardDescription>
                Connect to WhatsApp Web to send and receive messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Headless Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Run WhatsApp Web in background mode without showing browser
                  </p>
                </div>
                <Switch 
                  checked={localSettings.headlessMode}
                  onCheckedChange={(checked) => {
                    setLocalSettings({
                      ...localSettings,
                      headlessMode: checked
                    });
                  }}
                />
              </div>
              
              {qrCodeVisible && (
                <div className="border rounded-md p-4 bg-muted/20 flex flex-col items-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                    {/* Simulated QR code (would be a real QR in production) */}
                    <div className="grid grid-cols-5 grid-rows-5 gap-1 w-36 h-36">
                      {Array(25).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-center">
                    Scan this QR code with your WhatsApp mobile app
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={connectWhatsApp}
                  disabled={connecting}
                  className="flex-1"
                >
                  {connecting ? (
                    <>Connecting...</>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Connect WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Configure information about your business for messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName"
                  value={localSettings.businessName}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      businessName: e.target.value
                    });
                  }}
                  placeholder="Enter your business name"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input 
                  id="websiteUrl"
                  value={localSettings.websiteUrl}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      websiteUrl: e.target.value
                    });
                  }}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Message Settings</CardTitle>
              <CardDescription>
                Configure how messages are sent and follow-ups are handled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Run</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send follow-up messages based on schedule
                  </p>
                </div>
                <Switch 
                  checked={localSettings.autoRun}
                  onCheckedChange={(checked) => {
                    setLocalSettings({
                      ...localSettings,
                      autoRun: checked
                    });
                  }}
                />
              </div>
              
              <Separator />
              
              <div className="grid gap-3">
                <Label htmlFor="messageInterval">Message Interval (minutes)</Label>
                <Input 
                  id="messageInterval"
                  type="number"
                  min="1"
                  value={localSettings.messageInterval}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      messageInterval: Number(e.target.value) || 5
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Time between sending messages to different customers (to avoid WhatsApp ban)
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="followUpInterval">Follow-up Interval (minutes)</Label>
                <Input 
                  id="followUpInterval"
                  type="number"
                  min="30"
                  value={localSettings.followUpInterval}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      followUpInterval: Number(e.target.value) || 120
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Time to wait before sending a follow-up message to non-responsive customers
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="maxFollowUps">Maximum Follow-ups</Label>
                <Input 
                  id="maxFollowUps"
                  type="number"
                  min="1"
                  max="5"
                  value={localSettings.maxFollowUps}
                  onChange={(e) => {
                    setLocalSettings({
                      ...localSettings,
                      maxFollowUps: Number(e.target.value) || 3
                    });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of follow-up messages to send before giving up
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Message Templates</h2>
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
          
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle>{template.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="message-bubble received w-full">
                    <div className="whitespace-pre-line text-sm">{template.content}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {templates.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create message templates to send to your customers
                  </p>
                  <Button
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowTemplateDialog(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Alert className="bg-muted/30">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Template Variables</AlertTitle>
            <AlertDescription>
              <p className="mb-2">You can use these variables in your templates:</p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li><span className="font-mono">{'{name}'}</span> - Customer name</li>
                <li><span className="font-mono">{'{businessName}'}</span> - Your business name</li>
                <li><span className="font-mono">{'{product}'}</span> - Product name</li>
                <li><span className="font-mono">{'{orderNumber}'}</span> - Order number</li>
                <li><span className="font-mono">{'{websiteUrl}'}</span> - Your website URL</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="faqs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">FAQs & Automated Responses</h2>
            <Button
              onClick={() => {
                setEditingFaq(null);
                setShowFaqDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingFaq(faq);
                          setShowFaqDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="message-bubble sent w-full">
                    <div className="whitespace-pre-line text-sm">{faq.question}</div>
                  </div>
                  <div className="message-bubble received w-full">
                    <div className="whitespace-pre-line text-sm">{faq.answer}</div>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm font-medium mb-1">Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {faq.keywords.map((keyword, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-muted rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {faqs.length === 0 && (
              <Card className="bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create FAQ responses to automatically answer customer questions
                  </p>
                  <Button
                    onClick={() => {
                      setEditingFaq(null);
                      setShowFaqDialog(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Alert className="bg-muted/30">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>How FAQs Work</AlertTitle>
            <AlertDescription>
              <p>The bot will automatically respond to customer messages based on keywords in their messages. Add common questions and appropriate responses with relevant keywords for detection.</p>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      
      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Edit your message template' 
                : 'Create a new message template to send to customers'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const content = formData.get('content') as string;
            
            // Get variables from content using regex
            const variableRegex = /{([^}]+)}/g;
            const matches = content.match(variableRegex) || [];
            const variables = matches.map(match => match.slice(1, -1));
            
            if (!name.trim() || !content.trim()) {
              toast.error("Name and content are required");
              return;
            }
            
            const template: MessageTemplate = {
              id: editingTemplate?.id || '',
              name: name.trim(),
              content: content.trim(),
              variables: [...new Set(variables)]
            };
            
            handleSaveTemplate(template);
          }}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g., Initial Contact"
                  defaultValue={editingTemplate?.name || ''}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea 
                  id="content"
                  name="content"
                  placeholder="Type your message template here..."
                  defaultValue={editingTemplate?.content || ''}
                  className="min-h-[150px]"
                  required
                />
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-medium mb-1">Available variables:</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><span className="font-mono">{'{name}'}</span> - Customer name</p>
                  <p><span className="font-mono">{'{businessName}'}</span> - Your business name</p>
                  <p><span className="font-mono">{'{product}'}</span> - Product name</p>
                  <p><span className="font-mono">{'{orderNumber}'}</span> - Order number</p>
                  <p><span className="font-mono">{'{websiteUrl}'}</span> - Your website URL</p>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* FAQ Dialog */}
      <Dialog open={showFaqDialog} onOpenChange={setShowFaqDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Create FAQ'}
            </DialogTitle>
            <DialogDescription>
              {editingFaq 
                ? 'Edit your FAQ response' 
                : 'Create a new automated response for customer questions'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const question = formData.get('question') as string;
            const answer = formData.get('answer') as string;
            const keywordsStr = formData.get('keywords') as string;
            
            if (!question.trim() || !answer.trim() || !keywordsStr.trim()) {
              toast.error("All fields are required");
              return;
            }
            
            // Split keywords by comma and trim whitespace
            const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k !== '');
            
            if (keywords.length === 0) {
              toast.error("At least one keyword is required");
              return;
            }
            
            const faq: FAQItem = {
              id: editingFaq?.id || '',
              question: question.trim(),
              answer: answer.trim(),
              keywords
            };
            
            handleSaveFaq(faq);
          }}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input 
                  id="question"
                  name="question"
                  placeholder="e.g., Delivery kitne din mein hogi?"
                  defaultValue={editingFaq?.question || ''}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea 
                  id="answer"
                  name="answer"
                  placeholder="e.g., Delivery 3-4 din mein ho jaye gi."
                  defaultValue={editingFaq?.answer || ''}
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Input 
                  id="keywords"
                  name="keywords"
                  placeholder="e.g., delivery, din, time, kab, jaldi"
                  defaultValue={editingFaq?.keywords.join(', ') || ''}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Add keywords that might appear in the customer's question to trigger this response
                </p>
              </div>
              
              <Alert className="bg-muted/30">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle className="text-sm">Variables in Answers</AlertTitle>
                <AlertDescription className="text-xs">
                  You can use <span className="font-mono">{'{websiteUrl}'}</span> and <span className="font-mono">{'{businessName}'}</span> in your answers
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowFaqDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
