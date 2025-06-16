'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, Clock, Users, Phone, Filter, Search, RefreshCw, Loader2, DollarSign, User } from 'lucide-react';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface CheckInReportViewProps {
  golfCourseId: number;
  golfCourseName: string;
}

interface CheckInOrderDetail {
  id: number;
  teeTime: string;
  playerName: string;
  total: number;
  holes: number;
  playerType: 'adult' | 'junior' | 'senior_veteran';
  rateType: 'cart' | 'walking';
}

interface CheckInOrder {
  id: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  CheckInOrderDetail: CheckInOrderDetail[];
}

export function CheckInReportView({ golfCourseId, golfCourseName }: CheckInReportViewProps) {
  const [orders, setOrders] = useState<CheckInOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to today's date
    return new Date();
  });
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { getToken } = useGolfCourseAuth();

  const fetchCheckInOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate.toISOString().split('T')[0]);
      }
      if (paymentStatusFilter !== 'all') {
        params.append('paymentStatus', paymentStatusFilter);
      }

      const response = await fetch(`/api/golf-course/${golfCourseId}/checkin-orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch check-in orders');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch check-in orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckInOrders();
  }, [selectedDate, paymentStatusFilter]);

  const handleRefresh = () => {
    fetchCheckInOrders();
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTeeTime = (teeTime: string) => {
    return new Date(teeTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(searchLower) ||
      order.customerPhone.includes(searchTerm) ||
      order.CheckInOrderDetail.some(detail => 
        detail.playerName.toLowerCase().includes(searchLower)
      )
    );
  });



  // Calculate summary stats
  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    const amount = Number(order.totalAmount) || 0;
    return sum + amount;
  }, 0);
  const totalPlayers = filteredOrders.reduce((sum, order) => {
    return sum + order.CheckInOrderDetail.length;
  }, 0);
  const completedPayments = filteredOrders.filter(order => order.paymentStatus === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                placeholder="Select date"
              />
            </div>
            
            <div>
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Customer name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleRefresh} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Players</p>
                <p className="text-2xl font-bold">{totalPlayers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold">{completedPayments}</p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Check-in Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Check-in Orders for {formatDate(selectedDate)}</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredOrders.length} order(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading check-in orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No check-in orders found for the selected date and filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {order.customerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.customerPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDateTime(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {order.CheckInOrderDetail.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {order.CheckInOrderDetail.map((detail, index) => (
                            <div key={detail.id} className="text-xs">
                              <div className="font-medium">{detail.playerName || `Player ${index + 1}`}</div>
                              <div className="text-gray-500">
                                {formatTeeTime(detail.teeTime)} • {detail.holes} holes • {detail.rateType}
                              </div>
                              <div className="text-gray-500 capitalize">
                                {detail.playerType?.replace('_', '/')} • ${Number(detail.total || 0).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusBadgeColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 