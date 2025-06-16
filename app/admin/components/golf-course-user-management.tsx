'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus, Users, Eye, EyeOff, Loader2, Search, Filter } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';

type GolfCourseUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STAFF' | 'MANAGER' | 'OWNER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  GolfCourse: {
    id: number;
    name: string;
    city: string;
    state: string;
  };
};

type GolfCourse = {
  id: number;
  name: string;
  city: string;
  state: string;
};

type UserFormData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STAFF' | 'MANAGER' | 'OWNER';
  isActive: boolean;
  golfCourseId: string;
};

export function GolfCourseUserManagement() {
  const [users, setUsers] = useState<GolfCourseUser[]>([]);
  const [golfCourses, setGolfCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GolfCourseUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'STAFF',
    isActive: true,
    golfCourseId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGolfCourse, setSelectedGolfCourse] = useState('all');
  const { getToken } = useAuth();

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (selectedGolfCourse !== 'all') {
        params.append('golfCourseId', selectedGolfCourse);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/golf-course-users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch golf course users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch golf course users');
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
      console.error('Failed to fetch golf courses:', err);
    }
  };

  useEffect(() => {
    fetchGolfCourses();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedGolfCourse]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch('/api/admin/golf-course-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          golfCourseId: parseInt(formData.golfCourseId)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      await fetchUsers();
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const token = getToken();
      const { password, ...updateDataWithoutPassword } = formData;
      const updateData = password 
        ? { ...formData, golfCourseId: parseInt(formData.golfCourseId) }
        : { ...updateDataWithoutPassword, golfCourseId: parseInt(formData.golfCourseId) };

      const response = await fetch(`/api/admin/golf-course-users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      await fetchUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string, golfCourseName: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}" from ${golfCourseName}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/admin/golf-course-users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const openEditDialog = (user: GolfCourseUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      golfCourseId: user.GolfCourse.id.toString()
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'STAFF',
      isActive: true,
      golfCourseId: ''
    });
    setShowPassword(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800';
      case 'MANAGER': return 'bg-blue-100 text-blue-800';
      case 'STAFF': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading golf course users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Golf Course User Management
        </h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Golf Course User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Golf Course User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="golfCourseId">Golf Course *</Label>
                  <Select value={formData.golfCourseId} onValueChange={(value) => setFormData({ ...formData, golfCourseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select golf course" />
                    </SelectTrigger>
                    <SelectContent>
                      {golfCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name} ({course.city}, {course.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'STAFF' | 'MANAGER' | 'OWNER' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedGolfCourse} onValueChange={setSelectedGolfCourse}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Golf Courses</SelectItem>
              {golfCourses.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Golf Course Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No golf course users found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Golf Course</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : '-'}
                    </TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.GolfCourse.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.GolfCourse.city}, {user.GolfCourse.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.username, user.GolfCourse.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Golf Course User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-golfCourseId">Golf Course *</Label>
                <Select value={formData.golfCourseId} onValueChange={(value) => setFormData({ ...formData, golfCourseId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select golf course" />
                  </SelectTrigger>
                  <SelectContent>
                    {golfCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.city}, {course.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-password">Password (leave empty to keep current)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'STAFF' | 'MANAGER' | 'OWNER' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="OWNER">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 