'use client';

import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AppNav } from '@/components/AppNav';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type UserSettings = {
  wallet_address: string;
  display_name: string | null;
  custom_url_slug: string | null;
  branding_color: string | null;
  branding_logo_url: string | null;
};

export default function Settings() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signIn, isAuthenticating, isCheckingAuth } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [brandingColor, setBrandingColor] = useState('#6366f1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    if (isAuthenticated && address) {
      loadSettings();
    } else if (!isCheckingAuth) {
      setIsLoadingSettings(false);
    }
  }, [isAuthenticated, address, isCheckingAuth]);

  const loadSettings = async () => {
    if (!address) return;

    setIsLoadingSettings(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (data) {
        setSettings(data);
        setDisplayName(data.display_name || '');
        setCustomSlug(data.custom_url_slug || '');
        setBrandingColor(data.branding_color || '#6366f1');
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: displayName || null,
          custom_url_slug: customSlug || null,
          branding_color: brandingColor,
        })
        .eq('wallet_address', address.toLowerCase());

      if (error) {
        console.error('Save error:', error);
        setSaveMessage('Failed to save settings. Please try again.');
      } else {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        await loadSettings();
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth || isLoadingSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        <nav className="p-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Themis
          </Link>
          <div className="w-40 h-10 bg-white/10 rounded-xl animate-pulse"></div>
        </nav>
        <main className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access settings</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in with your wallet to access settings</p>
          <button
            onClick={signIn}
            disabled={isAuthenticating}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isAuthenticating ? 'Signing In...' : 'Sign In with Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <AppNav />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Customize your payment page branding</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your name or business name"
                  maxLength={50}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This will be shown on your payment pages
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">themis.app/pay/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="yourname"
                    maxLength={30}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Create a custom URL for your payment page (lowercase, letters, numbers, and dashes only)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={brandingColor}
                    onChange={(e) => setBrandingColor(e.target.value)}
                    className="h-12 w-20 border border-gray-300 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingColor}
                    onChange={(e) => setBrandingColor(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                    placeholder="#6366f1"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a color for your payment page header
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                <div
                  className="rounded-xl p-6 text-white"
                  style={{ backgroundColor: brandingColor }}
                >
                  <div className="text-2xl font-bold mb-2">
                    {displayName || 'Your Name'}
                  </div>
                  <div className="text-sm opacity-90">Payment Request</div>
                </div>
              </div>

              {saveMessage && (
                <div
                  className={`rounded-xl p-4 ${
                    saveMessage.includes('success')
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {saveMessage}
                </div>
              )}

              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Wallet Address</span>
                  <span className="font-mono text-gray-900">{address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Created</span>
                  <span className="text-gray-900">
                    {settings?.wallet_address ? 'Active' : 'New'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
