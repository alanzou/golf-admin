'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Settings, Save, MapPin, Phone, Globe, DollarSign } from 'lucide-react';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

type GolfCourseSettings = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  taxRate: number;
  discountRate: number;
  leadDiscountRate: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    User: number;
    Customer: number;
    Booking: number;
  };
};

interface GolfCourseSettingsProps {
  golfCourseId: number;
}

export function GolfCourseSettings({ golfCourseId }: GolfCourseSettingsProps) {
  const [settings, setSettings] = useState<GolfCourseSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { getToken, user: currentUser } = useGolfCourseAuth();

  const fetchSettings = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/api/golf-course/${golfCourseId}/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch golf course settings');
      }
      
      const data = await response.json();
      setSettings(data.golfCourse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [golfCourseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = getToken();
      const response = await fetch(`/api/golf-course/${golfCourseId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settings.name,
          address: settings.address,
          city: settings.city,
          state: settings.state,
          zip: settings.zip,
          phone: settings.phone,
          website: settings.website,
          taxRate: settings.taxRate,
          discountRate: settings.discountRate,
          leadDiscountRate: settings.leadDiscountRate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings');
      }

      const updatedData = await response.json();
      setSettings(updatedData.golfCourse);
      setSuccess('Settings updated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const canEditSettings = () => {
    if (!currentUser) return false;
    return currentUser.role === 'MANAGER' || currentUser.role === 'OWNER';
  };

  const updateSetting = (field: keyof GolfCourseSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading golf course settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Golf course settings not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Golf Course Settings
          </h2>
          <p className="text-gray-600">{settings.name}</p>
        </div>
        {canEditSettings() && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Golf Course Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => updateSetting('name', e.target.value)}
                disabled={!canEditSettings()}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => updateSetting('address', e.target.value)}
                disabled={!canEditSettings()}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) => updateSetting('city', e.target.value)}
                  disabled={!canEditSettings()}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={settings.state}
                  onChange={(e) => updateSetting('state', e.target.value)}
                  disabled={!canEditSettings()}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={settings.zip}
                  onChange={(e) => updateSetting('zip', e.target.value)}
                  disabled={!canEditSettings()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                disabled={!canEditSettings()}
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => updateSetting('website', e.target.value)}
                disabled={!canEditSettings()}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={(settings.taxRate * 100).toFixed(2)}
                  onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) / 100 || 0)}
                  disabled={!canEditSettings()}
                />
              </div>
              <div>
                <Label htmlFor="discountRate">Discount Rate (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={(settings.discountRate * 100).toFixed(2)}
                  onChange={(e) => updateSetting('discountRate', parseFloat(e.target.value) / 100 || 0)}
                  disabled={!canEditSettings()}
                />
              </div>
              <div>
                <Label htmlFor="leadDiscountRate">Lead Discount Rate (%)</Label>
                <Input
                  id="leadDiscountRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={(settings.leadDiscountRate * 100).toFixed(2)}
                  onChange={(e) => updateSetting('leadDiscountRate', parseFloat(e.target.value) / 100 || 0)}
                  disabled={!canEditSettings()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {settings._count?.User || 0}
                </div>
                <div className="text-sm text-blue-600">Staff Members</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {settings._count?.Customer || 0}
                </div>
                <div className="text-sm text-green-600">Customers</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {settings._count?.Booking || 0}
                </div>
                <div className="text-sm text-purple-600">Bookings</div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Created: {new Date(settings.createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(settings.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 