'use client';

import { useState } from 'react';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

// Since we can't use async in client components, we'll need to pass dictionary as props
// For now, we'll create a client component that receives the dictionary
export default function ContactPage({ dictionary, locale }: { dictionary: any; locale: Locale }) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the form data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header dictionary={dictionary} locale={locale} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-background to-muted/20">
          <div className="container max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {dictionary.pages.contact.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {dictionary.pages.contact.subtitle}
            </p>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {dictionary.pages.contact.form.submit}
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">{dictionary.pages.contact.form.name}</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={dictionary.pages.contact.form.namePlaceholder}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{dictionary.pages.contact.form.email}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={dictionary.pages.contact.form.emailPlaceholder}
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">{dictionary.pages.contact.form.message}</Label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder={dictionary.pages.contact.form.messagePlaceholder}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="w-full min-h-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800">{dictionary.pages.contact.form.success}</p>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800">{dictionary.pages.contact.form.error}</p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? dictionary.common.loading : dictionary.pages.contact.form.submit}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {dictionary.pages.contact.info.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Mail className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">contact@dnawebapp.com</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Phone className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <MapPin className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          123 Tech Street<br />
                          Innovation City, IC 12345
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Office Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer dictionary={dictionary} locale={locale} />
    </div>
  );
}