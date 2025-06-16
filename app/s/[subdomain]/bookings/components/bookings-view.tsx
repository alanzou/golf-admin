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
import { Calendar, Clock, Users, Phone, Mail, Filter, Search, RefreshCw, Loader2 } from 'lucide-react';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface BookingsViewProps {
  golfCourseId: number;
  golfCourseName: string;
}

interface Booking {
  id: number;
  bookingUUID: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAID';
  subTotal: number;
  tax: number;
  total: number;
  createdAt: string;
  BookingDetail: {
    id: number;
    teeTime: string;
    playerNames: string;
    numberOfPlayers: number;
    holes: number;
    cart: boolean;
    playerType: 'adult' | 'junior' | 'senior_veteran';
    rateType: 'cart' | 'walking';
  }[];
}

export function BookingsView({ golfCourseId, golfCourseName }: BookingsViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to today's date
    return new Date();
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { getToken } = useGolfCourseAuth();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate.toISOString().split('T')[0]);
      }
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/golf-course/${golfCourseId}/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, statusFilter]);

  const handleRefresh = () => {
    fetchBookings();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PAID': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
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

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.firstName.toLowerCase().includes(searchLower) ||
      booking.lastName.toLowerCase().includes(searchLower) ||
      booking.phone.includes(searchTerm) ||
      booking.email.toLowerCase().includes(searchLower) ||
      booking.bookingUUID.toLowerCase().includes(searchLower)
    );
  });



  // Calculate summary stats
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, booking) => {
    const total = Number(booking.total) || 0;
    return sum + total;
  }, 0);
  const totalPlayers = filteredBookings.reduce((sum, booking) => {
    return sum + (booking.BookingDetail[0]?.numberOfPlayers || 0);
  }, 0);

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
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Name, phone, email..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
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
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-500 font-bold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bookings for {formatDate(selectedDate)}</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredBookings.length} booking(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No bookings found for the selected date and filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tee Time</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const detail = booking.BookingDetail[0];
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          {booking.bookingUUID.split('-')[0]}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.firstName} {booking.lastName}
                            </div>
                            {detail?.playerNames && (
                              <div className="text-sm text-gray-500">
                                Players: {detail.playerNames}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {booking.phone}
                            </div>
                            {booking.email && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Mail className="h-3 w-3" />
                                {booking.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {detail ? formatTeeTime(detail.teeTime) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {detail?.numberOfPlayers || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{detail?.holes || 18} holes</div>
                            <div className="text-gray-500">
                              {detail?.cart ? 'With cart' : 'Walking'}
                            </div>
                            <div className="text-gray-500 capitalize">
                              {detail?.playerType?.replace('_', '/')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(booking.bookingStatus)}>
                            {booking.bookingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(booking.total || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 