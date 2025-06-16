'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar, Clock, Users, Filter, Search, RefreshCw, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useGolfCourseAuth } from '@/lib/use-golf-course-auth';

interface TeeTimeSheetViewProps {
  golfCourseId: number;
  golfCourseName: string;
}

interface TeeTimeSlot {
  id: number;
  date: string;
  tee_time: string;
  slot1: string | null;
  slot2: string | null;
  slot3: string | null;
  slot4: string | null;
  slot1_status: boolean;
  slot2_status: boolean;
  slot3_status: boolean;
  slot4_status: boolean;
}

export function TeeTimeSheetView({ golfCourseId, golfCourseName }: TeeTimeSheetViewProps) {
  const [teeTimeSlots, setTeeTimeSlots] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Default to today's date
    return new Date();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { getToken } = useGolfCourseAuth();

  const fetchTeeTimeSlots = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/golf-course/${golfCourseId}/tee-time-sheet?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tee time slots');
      }
      
      const data = await response.json();
      setTeeTimeSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tee time slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeeTimeSlots();
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchTeeTimeSlots();
  };

  const formatTeeTime = (teeTime: string) => {
    // The tee_time comes as a time string from the database
    const [hours, minutes] = teeTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter slots based on search term
  const filteredSlots = teeTimeSlots.filter(slot => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      slot.slot1?.toLowerCase().includes(searchLower) ||
      slot.slot2?.toLowerCase().includes(searchLower) ||
      slot.slot3?.toLowerCase().includes(searchLower) ||
      slot.slot4?.toLowerCase().includes(searchLower)
    );
  });



  // Calculate summary stats
  const totalSlots = filteredSlots.length;
  const totalPlayers = filteredSlots.reduce((sum, slot) => {
    let players = 0;
    if (slot.slot1) players++;
    if (slot.slot2) players++;
    if (slot.slot3) players++;
    if (slot.slot4) players++;
    return sum + players;
  }, 0);
  
  const checkedInPlayers = filteredSlots.reduce((sum, slot) => {
    let checkedIn = 0;
    if (slot.slot1_status) checkedIn++;
    if (slot.slot2_status) checkedIn++;
    if (slot.slot3_status) checkedIn++;
    if (slot.slot4_status) checkedIn++;
    return sum + checkedIn;
  }, 0);

  const availableSlots = filteredSlots.reduce((sum, slot) => {
    let available = 0;
    if (!slot.slot1) available++;
    if (!slot.slot2) available++;
    if (!slot.slot3) available++;
    if (!slot.slot4) available++;
    return sum + available;
  }, 0);

  const renderPlayerSlot = (playerName: string | null, isCheckedIn: boolean, slotNumber: number) => {
    if (!playerName) {
      return (
        <div className="p-2 border border-dashed border-gray-300 rounded text-center text-gray-400 text-sm">
          Empty Slot {slotNumber}
        </div>
      );
    }

    return (
      <div className={`p-2 border rounded text-sm ${
        isCheckedIn 
          ? 'border-green-500 bg-green-50 text-green-800' 
          : 'border-yellow-500 bg-yellow-50 text-yellow-800'
      }`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{playerName}</span>
          {isCheckedIn ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-yellow-600" />
          )}
        </div>
        <div className="text-xs mt-1">
          {isCheckedIn ? 'Checked In' : 'Pending'}
        </div>
      </div>
    );
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                placeholder="Select date"
              />
            </div>
            
            <div>
              <Label htmlFor="search">Search Players</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Player name..."
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
                <p className="text-sm text-gray-600">Total Tee Times</p>
                <p className="text-2xl font-bold">{totalSlots}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold">{checkedInPlayers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Slots</p>
                <p className="text-2xl font-bold">{availableSlots}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tee Time Sheet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tee Time Sheet for {formatDate(selectedDate)}</span>
            <span className="text-sm font-normal text-gray-500">
              {filteredSlots.length} tee time(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading tee time sheet...</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tee times found for the selected date and filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Tee Time</TableHead>
                    <TableHead>Slot 1</TableHead>
                    <TableHead>Slot 2</TableHead>
                    <TableHead>Slot 3</TableHead>
                    <TableHead>Slot 4</TableHead>
                    <TableHead className="w-32">Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlots.map((slot) => {
                    const playersCount = [slot.slot1, slot.slot2, slot.slot3, slot.slot4].filter(Boolean).length;
                    const checkedInCount = [
                      slot.slot1_status, 
                      slot.slot2_status, 
                      slot.slot3_status, 
                      slot.slot4_status
                    ].filter(Boolean).length;
                    
                    return (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            {formatTeeTime(slot.tee_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderPlayerSlot(slot.slot1, slot.slot1_status, 1)}
                        </TableCell>
                        <TableCell>
                          {renderPlayerSlot(slot.slot2, slot.slot2_status, 2)}
                        </TableCell>
                        <TableCell>
                          {renderPlayerSlot(slot.slot3, slot.slot3_status, 3)}
                        </TableCell>
                        <TableCell>
                          {renderPlayerSlot(slot.slot4, slot.slot4_status, 4)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium">
                              {playersCount}/4 players
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">{checkedInCount} checked in</span>
                            </div>
                            {playersCount > 0 && checkedInCount === playersCount && (
                              <Badge className="bg-green-100 text-green-800">Complete</Badge>
                            )}
                          </div>
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