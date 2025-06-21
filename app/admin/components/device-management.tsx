'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Smartphone, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';

type Device = {
  id: number;
  name: string;
  deviceType: string;
  deviceId: string;
  isActive: boolean;
  lastSeen?: string;
  golfCourseId: number;
  GolfCourse: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

type DeviceFormData = {
  name: string;
  deviceType: string;
  deviceId: string;
  isActive: boolean;
  golfCourseId?: number;
};

type GolfCourse = {
  id: number;
  name: string;
};

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    deviceType: 'android',
    deviceId: '',
    isActive: true,
    golfCourseId: undefined
  });
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useAuth();

  const fetchDevices = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/admin/devices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      
      const data = await response.json();
      setDevices(data.devices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const fetchGolfCourses = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/admin/golf-courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch golf courses');
      }
      
      const data = await response.json();
      setGolfCourses(data.golfCourses || []);
    } catch (err) {
      console.error('Error fetching golf courses:', err);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchGolfCourses();
  }, []);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.golfCourseId) {
      setError('Please select a golf course');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create device');
      }

      await fetchDevices();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create device');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update device');
      }

      await fetchDevices();
      setIsEditDialogOpen(false);
      setEditingDevice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete device');
      }

      await fetchDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
    }
  };

  const openEditDialog = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      deviceType: device.deviceType,
      deviceId: device.deviceId,
      isActive: device.isActive,
      golfCourseId: device.golfCourseId
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      deviceType: 'android',
      deviceId: '',
      isActive: true,
      golfCourseId: undefined
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading devices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          Device Management
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Device</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDevice} className="space-y-4">
              <div>
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deviceType">Device Type</Label>
                <Select value={formData.deviceType} onValueChange={(value) => setFormData({ ...formData, deviceType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="golfCourse">Golf Course</Label>
                <Select value={formData.golfCourseId?.toString()} onValueChange={(value) => setFormData({ ...formData, golfCourseId: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a golf course" />
                  </SelectTrigger>
                  <SelectContent>
                    {golfCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Device
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {devices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No devices found.</p>
            </CardContent>
          </Card>
        ) : (
          devices.map((device) => (
            <Card key={device.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{device.name}</h3>
                      <Badge variant={device.isActive ? 'default' : 'secondary'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{device.deviceType}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Device ID: {device.deviceId}</p>
                    <p className="text-sm text-gray-600">Golf Course: {device.GolfCourse.name}</p>
                    {device.lastSeen && (
                      <p className="text-xs text-gray-500">
                        Last seen: {new Date(device.lastSeen).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created: {new Date(device.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDevice} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Device Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-deviceId">Device ID</Label>
              <Input
                id="edit-deviceId"
                value={formData.deviceId}
                onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-deviceType">Device Type</Label>
              <Select value={formData.deviceType} onValueChange={(value) => setFormData({ ...formData, deviceType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-golfCourse">Golf Course</Label>
              <Select value={formData.golfCourseId?.toString()} onValueChange={(value) => setFormData({ ...formData, golfCourseId: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a golf course" />
                </SelectTrigger>
                <SelectContent>
                  {golfCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Device
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 