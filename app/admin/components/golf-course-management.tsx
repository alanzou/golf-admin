'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MapPin, Phone, Globe, Loader2, Users } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import Link from 'next/link';

type GolfCourse = {
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
  _count?: {
    User: number;
    Customer: number;
    Booking: number;
  };
};

type GolfCourseFormData = {
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
};

export function GolfCourseManagement() {
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<GolfCourse | null>(null);
  const [formData, setFormData] = useState<GolfCourseFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    taxRate: 0.06,
    discountRate: 0.1,
    leadDiscountRate: 0.3
  });
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useAuth();

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
      setError(err instanceof Error ? err.message : 'Failed to fetch golf courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGolfCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch('/api/admin/golf-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create golf course');
      }

      await fetchGolfCourses();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create golf course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/golf-courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update golf course');
      }

      await fetchGolfCourses();
      setIsEditDialogOpen(false);
      setEditingCourse(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update golf course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this golf course? This will also delete all associated users, customers, and bookings.')) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/golf-courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete golf course');
      }

      await fetchGolfCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete golf course');
    }
  };

  const openEditDialog = (course: GolfCourse) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      address: course.address,
      city: course.city,
      state: course.state,
      zip: course.zip,
      phone: course.phone,
      website: course.website,
      taxRate: course.taxRate,
      discountRate: course.discountRate,
      leadDiscountRate: course.leadDiscountRate
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      website: '',
      taxRate: 0.06,
      discountRate: 0.1,
      leadDiscountRate: 0.3
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading golf courses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Golf Course Management
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Golf Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Golf Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="discountRate">Discount Rate</Label>
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="leadDiscountRate">Lead Discount Rate</Label>
                  <Input
                    id="leadDiscountRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.leadDiscountRate}
                    onChange={(e) => setFormData({ ...formData, leadDiscountRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Golf Course
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

      <div className="grid gap-6">
        {golfCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No golf courses found.</p>
            </CardContent>
          </Card>
        ) : (
          golfCourses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {course.phone && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {course.phone}
                        </Badge>
                      )}
                      {course.website && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Website
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Location</h4>
                    <p className="text-sm text-gray-600">
                      {course.address && `${course.address}, `}
                      {course.city && `${course.city}, `}
                      {course.state} {course.zip}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Statistics</h4>
                    <div className="flex gap-4 text-sm">
                      <span>Users: {course._count?.User || 0}</span>
                      <span>Customers: {course._count?.Customer || 0}</span>
                      <span>Bookings: {course._count?.Booking || 0}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rates</h4>
                    <div className="text-sm text-gray-600">
                      <p>Tax: {(course.taxRate * 100).toFixed(1)}%</p>
                      <p>Discount: {(course.discountRate * 100).toFixed(1)}%</p>
                      <p>Lead Discount: {(course.leadDiscountRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Created</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Golf Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Golf Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Course Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-state">State</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-zip">ZIP Code</Label>
                <Input
                  id="edit-zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-taxRate">Tax Rate</Label>
                <Input
                  id="edit-taxRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-discountRate">Discount Rate</Label>
                <Input
                  id="edit-discountRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.discountRate}
                  onChange={(e) => setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-leadDiscountRate">Lead Discount Rate</Label>
                <Input
                  id="edit-leadDiscountRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.leadDiscountRate}
                  onChange={(e) => setFormData({ ...formData, leadDiscountRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Golf Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 