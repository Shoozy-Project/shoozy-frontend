import type { Metadata } from 'next';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Settings | Shoezy Admin',
  description: 'Manage Shoezy store configuration settings.',
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#FF8C00]" /> Store Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure system-wide settings for the Shoezy e-commerce platform.
          </p>
        </div>
        <Button className="bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Store Details</CardTitle>
          <CardDescription>Basic store identifiers, currencies, and support contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Store Name</label>
              <input type="text" defaultValue="Shoezy Tunisia" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Support Email</label>
              <input type="email" defaultValue="support@shoezy.tn" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Primary Currency</label>
              <select defaultValue="TND" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00] bg-white">
                <option value="TND">Tunisian Dinar (د.ت)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Methods</label>
              <input type="text" disabled defaultValue="Cash on Delivery Only" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping & Delivery Rates</CardTitle>
          <CardDescription>Configure delivery thresholds and fixed courier costs inside Tunisia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Flat Courier Shipping Rate (TND)</label>
              <input type="number" defaultValue={7} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Free Shipping Threshold (TND)</label>
              <input type="number" defaultValue={150} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF8C00]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
