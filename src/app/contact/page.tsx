"use client";

import { useState } from 'react';
import { EnvelopeIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeEmail, setSubscribeEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center py-8">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Contact Us</h1>
          
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-brand-navy" />
                      Name
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full h-11 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy text-lg transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="col-span-1">
                  <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-brand-navy" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full h-11 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy text-lg transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="subject" className="block text-base font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="block w-full h-11 px-4 rounded-lg border-2 border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy text-lg transition-colors"
                    placeholder="Enter message subject"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="message" className="block text-base font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full px-4 py-3 rounded-lg border-2 border-gray-300 shadow-sm focus:border-brand-navy focus:ring-brand-navy text-lg transition-colors"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="col-span-2">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full flex justify-center items-center h-12 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-brand-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy transition-all"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold text-brand-navy mb-4">
              Stay Updated with Investment Insights
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-navy"
              />
              <button className="bg-brand-navy text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-brand-navy transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-brand-navy transition-colors">Terms of Service</a>
              <a href="/contact" className="hover:text-brand-navy transition-colors">Contact Us</a>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} InvestTrack. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {status === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Message Sent Successfully!</h3>
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {status === 'error' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
            <div className="text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Message Failed to Send</h3>
              <p className="mt-2 text-sm text-gray-500">
                Please try again later or contact us through alternative means.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 