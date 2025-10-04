import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from "@expo/vector-icons";
import Head from 'expo-router/head';
import { useAuth } from '../util/auth-context';
import { api} from '../util/api';
import { format } from 'date-fns';
import { User, PendingUser, Role } from '../util/types';

interface EventAssignment {
  id: string;
  status: string;
  registeredAt: string;
  event: {
    id: string;
    title: string;
    eventType: string;
    startDate: string;
    endDate: string;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPendingUser, setSelectedPendingUser] = useState<PendingUser | null>(null);
  const [userEventAssignments, setUserEventAssignments] = useState<EventAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'pending' | 'assignments'>('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditVolunteerModal, setShowEditVolunteerModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newRole, setNewRole] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'UNREVIEWED' | 'CONTACTED' | 'APPROVED' | 'REJECTED'>('UNREVIEWED');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREVIEWED' | 'CONTACTED' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [responseMessage, setResponseMessage] = useState<{success: boolean, message: string} | null>(null);
  
  // Volunteer edit form data
  const [volunteerEditData, setVolunteerEditData] = useState({
    socialMediaHandle: '',
    isBritishCitizen: undefined as boolean | undefined,
    livesInUK: undefined as boolean | undefined,
    briefBio: '',
    briefCV: '',
    otherAffiliations: '',
    interestedIn: [] as string[],
    canContribute: [] as string[],
    signedNDA: false,
    gdprConsent: false,
  });
  
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated (but wait for loading to complete)
  React.useEffect(() => {
    const isAdmin = (user?.roles && (user.roles.includes('ADMIN') || user.roles.includes('ONBOARDING')));
    if (!isLoading && (!isAuthenticated || !user || !isAdmin)) {
      Alert.alert('Access Denied', 'You must be an admin to access this page.');
      router.push('/');
      return;
    }
    loadData();
  }, [isAuthenticated, isLoading, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadPendingUsers(),
        loadEvents(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await api.getAllUsers();
      setUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const response = await api.getAllPendingApplications();
      setPendingUsers(response.applications);
    } catch (error) {
      console.error('Error loading pending users:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await api.getAllEvents();
      setEvents(response.events);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await api.getUserManagementStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserEventAssignments = async (userId: string) => {
    try {
      const assignments = await api.getUserEventAssignments(userId);
      setUserEventAssignments(assignments);
    } catch (error) {
      console.error('Error loading user event assignments:', error);
    }
  };

  const handleUserClick = async (user: User) => {
    setSelectedUser(user);
    setNewRole(user.roles && user.roles.length > 0 ? user.roles : [user.role]);
    await loadUserEventAssignments(user.id);
    setShowUserModal(true);
  };

  const handlePendingUserClick = (pendingUser: PendingUser) => {
    setSelectedPendingUser(pendingUser);
    setReviewNotes('');
    setShowPendingModal(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser || newRole.length === 0) return;

    try {
      const response = await api.updateUserRole(selectedUser.id, newRole as Role[]);
      setResponseMessage({
        success: true,
        message: 'User roles updated successfully'
      });
      setShowRoleModal(false);
      setShowUserModal(false);
      loadUsers();
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user roles'
      });
    }
  };

  const approvePendingUser = async () => {
    if (!selectedPendingUser) return;

    try {
      const response = await api.approveApplication(selectedPendingUser.id, { reviewNotes });
      setResponseMessage({
        success: true,
        message: `Application approved successfully! Access code: ${response.data.accessCode}`
      });
      setShowPendingModal(false);
      loadPendingUsers();
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve application'
      });
    }
  };

  const rejectPendingUser = async () => {
    if (!selectedPendingUser) return;

    try {
      await api.rejectApplication(selectedPendingUser.id, { reviewNotes });
      setResponseMessage({
        success: true,
        message: 'Application rejected successfully'
      });
      setShowPendingModal(false);
      loadPendingUsers();
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject application'
      });
    }
  };

  const updateApplicationStatus = async () => {
    if (!selectedPendingUser) return;

    try {
      const response = await api.updateApplicationStatus(selectedPendingUser.id, {
        status: selectedStatus,
        reviewNotes: statusNotes
      });
      
      let successMessage = `Application status updated to ${selectedStatus.toLowerCase()}`;
      if (selectedStatus === 'APPROVED' && response.data.accessCode) {
        successMessage += `! Access code: ${response.data.accessCode}`;
      }
      
      setResponseMessage({
        success: true,
        message: successMessage
      });
      setShowStatusModal(false);
      setStatusNotes('');
      loadPendingUsers();
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update application status'
      });
    }
  };

  const getFilteredPendingUsers = () => {
    if (statusFilter === 'ALL') {
      return pendingUsers;
    }
    return pendingUsers.filter(user => user.status === statusFilter);
  };

  const assignUserToEvent = async () => {
    if (!selectedUser || !selectedEvent) return;

    try {
      await api.assignUserToEvent(selectedUser.id, selectedEvent);
      setResponseMessage({
        success: true,
        message: 'User assigned to event successfully'
      });
      setShowAssignModal(false);
      loadUserEventAssignments(selectedUser.id);
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign user to event'
      });
    }
  };

  const unassignUserFromEvent = async (eventId: string) => {
    if (!selectedUser) return;

    try {
      await api.unassignUserFromEvent(selectedUser.id, eventId);
      setResponseMessage({
        success: true,
        message: 'User unassigned from event successfully'
      });
      loadUserEventAssignments(selectedUser.id);
    } catch (error) {
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unassign user from event'
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#dc2626';
      case 'WRITER': return '#d946ef';
      case 'EVENT_MANAGER': return '#7c3aed';
      case 'ONBOARDING': return '#f97316';
      case 'VOLUNTEER': return '#059669';
      case 'MEMBER': return '#0ea5e9';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNREVIEWED': return '#f59e0b';
      case 'CONTACTED': return '#3b82f6';
      case 'APPROVED': return '#059669';
      case 'REJECTED': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Volunteer data arrays
  const volunteerInterests = [
    'Policy Research',
    'Campaign Management',
    'Event Organization',
    'Community Outreach',
    'Digital Marketing',
    'Data Analysis',
    'Fundraising',
    'Content Creation',
    'Local Organizing',
    'Media Relations'
  ];

  const contributionAreas = [
    'Strategic Planning',
    'Writing & Communications',
    'Design & Creative',
    'Technology & Development',
    'Event Management',
    'Research & Analysis',
    'Social Media',
    'Public Speaking',
    'Administrative Support',
    'Leadership & Management'
  ];

  // Helper functions for volunteer data
  const openEditVolunteerModal = (pendingUser: PendingUser) => {
    setSelectedPendingUser(pendingUser);
    setVolunteerEditData({
      socialMediaHandle: pendingUser.socialMediaHandle || '',
      isBritishCitizen: pendingUser.isBritishCitizen,
      livesInUK: pendingUser.livesInUK,
      briefBio: pendingUser.briefBio || '',
      briefCV: pendingUser.briefCV || '',
      otherAffiliations: pendingUser.otherAffiliations || '',
      interestedIn: pendingUser.interestedIn || [],
      canContribute: pendingUser.canContribute || [],
      signedNDA: pendingUser.signedNDA || false,
      gdprConsent: pendingUser.gdprConsent || false,
    });
    setShowEditVolunteerModal(true);
  };

  const updateVolunteerField = (field: string, value: any) => {
    setVolunteerEditData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVolunteerInterest = (interest: string) => {
    setVolunteerEditData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(interest)
        ? prev.interestedIn.filter(i => i !== interest)
        : [...prev.interestedIn, interest]
    }));
  };

  const toggleContribution = (contribution: string) => {
    setVolunteerEditData(prev => ({
      ...prev,
      canContribute: prev.canContribute.includes(contribution)
        ? prev.canContribute.filter(c => c !== contribution)
        : [...prev.canContribute, contribution]
    }));
  };

  const saveVolunteerDetails = async () => {
    if (!selectedPendingUser) return;

    try {
      // Call API to update volunteer details
      await api.updatePendingUserVolunteerDetails(selectedPendingUser.id, volunteerEditData);
      
      setResponseMessage({
        success: true,
        message: 'Volunteer details updated successfully'
      });
      setShowEditVolunteerModal(false);
      
      // Refresh the pending users data
      await loadPendingUsers();
    } catch (error) {
      console.error('Error updating volunteer details:', error);
      setResponseMessage({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update volunteer details'
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: '#6b7280' }}>Loading...</Text>
          </View>
        </View>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, color: '#6b7280' }}>Loading...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>User Management - Progress UK</title>
        <meta name="description" content="Admin panel for managing Progress UK members, pending users, and member verification" />
      </Head>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        
        <ScrollView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ padding: 20, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
              User Management
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280' }}>
              Manage users, approve applications, and assign roles
            </Text>
          </View>

          {/* Response Message Banner */}
          {responseMessage && (
            <View style={{
              marginHorizontal: 20,
              marginBottom: 20,
              padding: 16,
              borderRadius: 12,
              backgroundColor: responseMessage.success ? '#d1fae5' : '#fee2e2',
              borderWidth: 1,
              borderColor: responseMessage.success ? '#a7f3d0' : '#fecaca',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name={responseMessage.success ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={responseMessage.success ? '#059669' : '#dc2626'} 
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: responseMessage.success ? '#059669' : '#dc2626',
                    marginBottom: 2
                  }}>
                    {responseMessage.success ? 'Success' : 'Error'}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: responseMessage.success ? '#065f46' : '#991b1b',
                    lineHeight: 20
                  }}>
                    {responseMessage.message}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setResponseMessage(null)}
                style={{ padding: 4 }}
              >
                <Ionicons name="close" size={16} color={responseMessage.success ? '#059669' : '#dc2626'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Stats Cards */}
          <View style={{ 
            flexDirection: Platform.OS === 'web' ? 'row' : 'column', 
            gap: 16, 
            padding: 20,
            flexWrap: 'wrap'
          }}>
            <View style={{ 
              flex: 1, 
              minWidth: 200,
              backgroundColor: '#ffffff', 
              padding: 20, 
              borderRadius: 12, 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Total Users</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
                {Object.values(stats.usersByRole || {}).reduce((sum: number, count: any) => sum + count, 0)}
              </Text>
            </View>
            
            <View style={{ 
              flex: 1, 
              minWidth: 200,
              backgroundColor: '#ffffff', 
              padding: 20, 
              borderRadius: 12, 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>New Applications</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>
                {pendingUsers.filter(u => u.status === 'UNREVIEWED').length}
              </Text>
            </View>
            
            <View style={{ 
              flex: 1, 
              minWidth: 200,
              backgroundColor: '#ffffff', 
              padding: 20, 
              borderRadius: 12, 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}>
              <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Recent Registrations</Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#059669' }}>
                {stats.recentRegistrations || 0}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: '#ffffff', 
            borderBottomWidth: 1, 
            borderBottomColor: '#e5e7eb',
            marginHorizontal: 20,
            borderRadius: 8,
            marginBottom: 20
          }}>
            {[
              { key: 'users', label: 'Users', icon: 'people' },
              { key: 'pending', label: 'All Applications', icon: 'hourglass' },
              { key: 'assignments', label: 'Event Assignments', icon: 'calendar' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  backgroundColor: activeTab === tab.key ? '#d946ef' : 'transparent',
                  borderRadius: 8,
                  ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                }}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={18} 
                  color={activeTab === tab.key ? '#ffffff' : '#6b7280'} 
                  style={{ marginRight: 8 }}
                />
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#ffffff' : '#6b7280'
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {activeTab === 'users' && (
              <View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                  All Users
                </Text>
                
                {/* Search Bar */}
                <View style={{ marginBottom: 16 }}>
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search by name, email, or constituency..."
                    style={{
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      fontSize: 14,
                      backgroundColor: '#ffffff',
                    }}
                  />
                </View>
                
                {users
                  .filter(user => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                    const email = user.email.toLowerCase();
                    const constituency = (user.constituency || '').toLowerCase();
                    return fullName.includes(searchLower) || email.includes(searchLower) || constituency.includes(searchLower);
                  })
                  .map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => handleUserClick(user)}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          {user.email}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, index) => (
                              <View key={index} style={{
                                backgroundColor: getRoleColor(role),
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4
                              }}>
                                <Text style={{ fontSize: 10, fontWeight: '600', color: '#ffffff' }}>
                                  {role.replace('_', ' ')}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <View style={{
                              backgroundColor: getRoleColor(user.role),
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                                {user.role}
                              </Text>
                            </View>
                          )}
                          {user.constituency && (
                            <View style={{
                              backgroundColor: '#e0f2fe',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 12, color: '#0ea5e9' }}>
                                {user.constituency}
                              </Text>
                            </View>
                          )}
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'pending' && (
              <View>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                  All Applications
                </Text>
                
                {/* Status Filter */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                    Filter by Status:
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {(['ALL', 'UNREVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED'] as const).map((status) => (
                        <TouchableOpacity
                          key={status}
                          onPress={() => setStatusFilter(status)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            backgroundColor: statusFilter === status ? '#3b82f6' : '#f3f4f6',
                            borderWidth: 1,
                            borderColor: statusFilter === status ? '#3b82f6' : '#d1d5db',
                            minWidth: 80,
                            alignItems: 'center'
                          }}
                        >
                          <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: statusFilter === status ? '#ffffff' : '#374151'
                          }}>
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  
                  {/* Status counts */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      Showing {getFilteredPendingUsers().length} of {pendingUsers.length} applications
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#f59e0b' }}>
                      {pendingUsers.filter(u => u.status === 'UNREVIEWED').length} Unreviewed
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#3b82f6' }}>
                      {pendingUsers.filter(u => u.status === 'CONTACTED').length} Contacted
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#059669' }}>
                      {pendingUsers.filter(u => u.status === 'APPROVED').length} Approved
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>•</Text>
                    <Text style={{ fontSize: 12, color: '#dc2626' }}>
                      {pendingUsers.filter(u => u.status === 'REJECTED').length} Rejected
                    </Text>
                  </View>
                </View>

                {getFilteredPendingUsers().map((pendingUser) => (
                  <TouchableOpacity
                    key={pendingUser.id}
                    onPress={() => handlePendingUserClick(pendingUser)}
                    style={{
                      backgroundColor: '#ffffff',
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                      ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                          {pendingUser.firstName} {pendingUser.lastName}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                          {pendingUser.email}
                        </Text>
                        {pendingUser.status === 'APPROVED' && pendingUser.accessCode && (
                          <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600', marginBottom: 4 }}>
                            Access Code: {pendingUser.accessCode}
                          </Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <View style={{
                            backgroundColor: getStatusColor(pendingUser.status),
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6
                          }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                              {pendingUser.status}
                            </Text>
                          </View>
                          {pendingUser.volunteer && (
                            <View style={{
                              backgroundColor: '#059669',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                                VOLUNTEER
                              </Text>
                            </View>
                          )}
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            Applied {format(new Date(pendingUser.createdAt), 'MMM d, yyyy')}
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* User Details Modal */}
        <Modal
          visible={showUserModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUserModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '90%', 
              maxWidth: 500,
              maxHeight: '80%'
            }}>
              <ScrollView>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                  User Details
                </Text>
                
                {selectedUser && (
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      {selectedUser.firstName && selectedUser.lastName ? 
                        `${selectedUser.firstName} ${selectedUser.lastName}` : selectedUser.email}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                      {selectedUser.email}
                    </Text>
                    
                    {selectedUser.constituency && (
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                        Constituency: {selectedUser.constituency}
                      </Text>
                    )}
                    
                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                      <TouchableOpacity
                        onPress={() => setShowRoleModal(true)}
                        style={{
                          backgroundColor: '#d946ef',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Change Roles</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => setShowAssignModal(true)}
                        style={{
                          backgroundColor: '#059669',
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Assign Event</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
                      Event Assignments
                    </Text>
                    {userEventAssignments.map((assignment) => (
                      <View key={assignment.id} style={{ 
                        backgroundColor: '#f9fafb', 
                        padding: 12, 
                        borderRadius: 8, 
                        marginBottom: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                            {assignment.event.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#6b7280' }}>
                            {assignment.event.eventType} • {format(new Date(assignment.event.startDate), 'MMM d, yyyy')}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => unassignUserFromEvent(assignment.event.id)}
                          style={{ padding: 8 }}
                        >
                          <Ionicons name="remove-circle" size={20} color="#dc2626" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity
                onPress={() => setShowUserModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 16
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Pending User Details Modal */}
        <Modal
          visible={showPendingModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPendingModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '90%', 
              maxWidth: 500,
              maxHeight: '80%'
            }}>
              <ScrollView>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                  Application Review
                </Text>
                
                {selectedPendingUser && (
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                      {selectedPendingUser.firstName} {selectedPendingUser.lastName}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                      {selectedPendingUser.email}
                    </Text>
                    
                    {selectedPendingUser.phone && (
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                        Phone: {selectedPendingUser.phone}
                      </Text>
                    )}
                    
                    {selectedPendingUser.constituency && (
                      <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                        Constituency: {selectedPendingUser.constituency}
                      </Text>
                    )}
                    
                    {selectedPendingUser.interests.length > 0 && (
                      <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                          Interests:
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {selectedPendingUser.interests.map((interest, index) => (
                            <View key={index} style={{
                              backgroundColor: '#e0f2fe',
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              borderRadius: 6
                            }}>
                              <Text style={{ fontSize: 12, color: '#0ea5e9' }}>{interest}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {selectedPendingUser.volunteer && (
                      <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, color: '#059669', marginBottom: 12, fontWeight: '600' }}>
                          ✓ Wants to volunteer
                        </Text>
                        
                        {/* Volunteer-specific fields */}
                        <View style={{ 
                          backgroundColor: '#f0fdf4', 
                          padding: 16, 
                          borderRadius: 12, 
                          borderLeftWidth: 4, 
                          borderLeftColor: '#059669',
                          marginBottom: 8
                        }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                              Volunteer Application Details
                            </Text>
                            <TouchableOpacity
                              onPress={() => openEditVolunteerModal(selectedPendingUser)}
                              style={{
                                backgroundColor: '#0ea5e9',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 6,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                              }}
                            >
                              <Ionicons name="pencil" size={14} color="#ffffff" />
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                                Edit
                              </Text>
                            </TouchableOpacity>
                          </View>
                          
                          {selectedPendingUser.socialMediaHandle && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Social Media:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>{selectedPendingUser.socialMediaHandle}</Text>
                            </View>
                          )}

                          {selectedPendingUser.constituency && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Constituency:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>{selectedPendingUser.constituency}</Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.isBritishCitizen !== undefined && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>British Citizen:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                {selectedPendingUser.isBritishCitizen ? 'Yes' : 'No'}
                              </Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.livesInUK !== undefined && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Lives in UK:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                {selectedPendingUser.livesInUK ? 'Yes' : 'No'}
                              </Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.briefBio && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Bio:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 16 }}>
                                {selectedPendingUser.briefBio}
                              </Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.briefCV && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>CV:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 16 }}>
                                {selectedPendingUser.briefCV}
                              </Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.otherAffiliations && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>Other Affiliations:</Text>
                              <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 16 }}>
                                {selectedPendingUser.otherAffiliations}
                              </Text>
                            </View>
                          )}
                          
                          {selectedPendingUser.interestedIn && selectedPendingUser.interestedIn.length > 0 && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                                Interested In:
                              </Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                {selectedPendingUser.interestedIn.map((interest, index) => (
                                  <View key={index} style={{
                                    backgroundColor: '#dbeafe',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4
                                  }}>
                                    <Text style={{ fontSize: 10, color: '#1d4ed8' }}>{interest}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          
                          {selectedPendingUser.canContribute && selectedPendingUser.canContribute.length > 0 && (
                            <View style={{ marginBottom: 8 }}>
                              <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                                Can Contribute:
                              </Text>
                              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                {selectedPendingUser.canContribute.map((contribution, index) => (
                                  <View key={index} style={{
                                    backgroundColor: '#dcfce7',
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    borderRadius: 4
                                  }}>
                                    <Text style={{ fontSize: 10, color: '#166534' }}>{contribution}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          
                          <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                            {selectedPendingUser.signedNDA && (
                              <Text style={{ fontSize: 11, color: '#059669', fontWeight: '500' }}>
                                ✓ NDA Signed
                              </Text>
                            )}
                            {selectedPendingUser.gdprConsent && (
                              <Text style={{ fontSize: 11, color: '#059669', fontWeight: '500' }}>
                                ✓ GDPR Consent
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    )}

                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                      Review Notes (Optional):
                    </Text>
                    <TextInput
                      value={reviewNotes}
                      onChangeText={setReviewNotes}
                      placeholder="Add notes about this application..."
                      multiline
                      numberOfLines={3}
                      style={{
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 20,
                        textAlignVertical: 'top'
                      }}
                    />

                    {/* Status Change Button */}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedStatus(selectedPendingUser.status);
                        setStatusNotes('');
                        setShowStatusModal(true);
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: 'center',
                        marginBottom: 16
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontWeight: '600' }}>Change Status</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        onPress={approvePendingUser}
                        style={{
                          backgroundColor: '#059669',
                          paddingVertical: 12,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Approve</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={rejectPendingUser}
                        style={{
                          backgroundColor: '#dc2626',
                          paddingVertical: 12,
                          borderRadius: 8,
                          flex: 1,
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
              
              <TouchableOpacity
                onPress={() => setShowPendingModal(false)}
                style={{
                  backgroundColor: '#6b7280',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 16
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Role Change Modal */}
        <Modal
          visible={showRoleModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRoleModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '80%', 
              maxWidth: 400 
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                Change User Roles
              </Text>
              
              {['ADMIN', 'ONBOARDING', 'EVENT_MANAGER', 'WRITER', 'VOLUNTEER', 'MEMBER'].map((role) => (
                <TouchableOpacity
                  key={role}
                  onPress={() => {
                    setNewRole(prev => 
                      prev.includes(role) 
                        ? prev.filter(r => r !== role) 
                        : [...prev, role]
                    );
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: newRole.includes(role) ? '#d946ef20' : 'transparent',
                    marginBottom: 8
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: newRole.includes(role) ? '#d946ef' : '#d1d5db',
                    backgroundColor: newRole.includes(role) ? '#d946ef' : 'transparent',
                    marginRight: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {newRole.includes(role) && (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    )}
                  </View>
                  <Text style={{ fontSize: 16, color: '#111827', fontWeight: '600' }}>
                    {role.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={updateUserRole}
                  style={{
                    backgroundColor: '#d946ef',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Update Roles</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowRoleModal(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Event Assignment Modal */}
        <Modal
          visible={showAssignModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAssignModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '80%', 
              maxWidth: 400 
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                Assign to Event
              </Text>
              
              <ScrollView style={{ maxHeight: 300 }}>
                {events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => setSelectedEvent(event.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: selectedEvent === event.id ? '#d946ef20' : 'transparent',
                      marginBottom: 8
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: selectedEvent === event.id ? '#d946ef' : '#d1d5db',
                      backgroundColor: selectedEvent === event.id ? '#d946ef' : 'transparent',
                      marginRight: 12,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedEvent === event.id && (
                        <View style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: '#ffffff' 
                        }} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                        {event.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        {event.eventType} • {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={assignUserToEvent}
                  disabled={!selectedEvent}
                  style={{
                    backgroundColor: selectedEvent ? '#059669' : '#9ca3af',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Assign</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    setShowAssignModal(false);
                    setSelectedEvent('');
                  }}
                  style={{
                    backgroundColor: '#6b7280',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Volunteer Details Modal */}
        <Modal
          visible={showEditVolunteerModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowEditVolunteerModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '90%', 
              maxWidth: 600,
              maxHeight: '90%'
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                  Edit Volunteer Details
                </Text>
                
                {selectedPendingUser && (
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
                      {selectedPendingUser.firstName} {selectedPendingUser.lastName}
                    </Text>

                    {/* Social Media Handle */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Social Media Handle
                      </Text>
                      <TextInput
                        value={volunteerEditData.socialMediaHandle}
                        onChangeText={(value) => updateVolunteerField('socialMediaHandle', value)}
                        placeholder="e.g. @username"
                        style={{
                          borderWidth: 1,
                          borderColor: '#d1d5db',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </View>

                    {/* British Citizen */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        British Citizen
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateVolunteerField('isBritishCitizen', true)}
                          style={{
                            backgroundColor: volunteerEditData.isBritishCitizen === true ? '#0ea5e9' : '#f3f4f6',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14,
                            color: volunteerEditData.isBritishCitizen === true ? '#ffffff' : '#374151'
                          }}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateVolunteerField('isBritishCitizen', false)}
                          style={{
                            backgroundColor: volunteerEditData.isBritishCitizen === false ? '#0ea5e9' : '#f3f4f6',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14,
                            color: volunteerEditData.isBritishCitizen === false ? '#ffffff' : '#374151'
                          }}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Lives in UK */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Lives in UK
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                          onPress={() => updateVolunteerField('livesInUK', true)}
                          style={{
                            backgroundColor: volunteerEditData.livesInUK === true ? '#0ea5e9' : '#f3f4f6',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14,
                            color: volunteerEditData.livesInUK === true ? '#ffffff' : '#374151'
                          }}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateVolunteerField('livesInUK', false)}
                          style={{
                            backgroundColor: volunteerEditData.livesInUK === false ? '#0ea5e9' : '#f3f4f6',
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 6,
                            ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                          }}
                        >
                          <Text style={{ 
                            fontSize: 14,
                            color: volunteerEditData.livesInUK === false ? '#ffffff' : '#374151'
                          }}>
                            No
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Brief Bio */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Brief Bio
                      </Text>
                      <TextInput
                        value={volunteerEditData.briefBio}
                        onChangeText={(value) => updateVolunteerField('briefBio', value)}
                        placeholder="Brief bio..."
                        multiline
                        numberOfLines={4}
                        style={{
                          borderWidth: 1,
                          borderColor: '#d1d5db',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: '#ffffff',
                          minHeight: 80,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* Brief CV */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Brief CV
                      </Text>
                      <TextInput
                        value={volunteerEditData.briefCV}
                        onChangeText={(value) => updateVolunteerField('briefCV', value)}
                        placeholder="Brief CV..."
                        multiline
                        numberOfLines={4}
                        style={{
                          borderWidth: 1,
                          borderColor: '#d1d5db',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: '#ffffff',
                          minHeight: 80,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* Other Affiliations */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Other Affiliations
                      </Text>
                      <TextInput
                        value={volunteerEditData.otherAffiliations}
                        onChangeText={(value) => updateVolunteerField('otherAffiliations', value)}
                        placeholder="Other affiliations..."
                        multiline
                        numberOfLines={3}
                        style={{
                          borderWidth: 1,
                          borderColor: '#d1d5db',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          backgroundColor: '#ffffff',
                          minHeight: 60,
                          textAlignVertical: 'top',
                        }}
                      />
                    </View>

                    {/* Interested In */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Interested In
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {volunteerInterests.map((interest) => (
                          <TouchableOpacity
                            key={interest}
                            onPress={() => toggleVolunteerInterest(interest)}
                            style={{
                              backgroundColor: volunteerEditData.interestedIn.includes(interest) ? '#0ea5e9' : '#f3f4f6',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 6,
                              ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                            }}
                          >
                            <Text style={{ 
                              fontSize: 12,
                              color: volunteerEditData.interestedIn.includes(interest) ? '#ffffff' : '#374151'
                            }}>
                              {interest}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Can Contribute */}
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                        Can Contribute
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {contributionAreas.map((area) => (
                          <TouchableOpacity
                            key={area}
                            onPress={() => toggleContribution(area)}
                            style={{
                              backgroundColor: volunteerEditData.canContribute.includes(area) ? '#059669' : '#f3f4f6',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 6,
                              ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                            }}
                          >
                            <Text style={{ 
                              fontSize: 12,
                              color: volunteerEditData.canContribute.includes(area) ? '#ffffff' : '#374151'
                            }}>
                              {area}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Checkboxes */}
                    <View style={{ marginBottom: 20 }}>
                      <TouchableOpacity
                        onPress={() => updateVolunteerField('signedNDA', !volunteerEditData.signedNDA)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 12,
                          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 2,
                            borderColor: volunteerEditData.signedNDA ? '#059669' : '#d1d5db',
                            borderRadius: 4,
                            backgroundColor: volunteerEditData.signedNDA ? '#059669' : '#ffffff',
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {volunteerEditData.signedNDA && (
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          )}
                        </View>
                        <Text style={{ fontSize: 14, color: '#111827' }}>
                          NDA Signed
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateVolunteerField('gdprConsent', !volunteerEditData.gdprConsent)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          ...(Platform.OS === 'web' && { cursor: 'pointer' } as any)
                        }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderWidth: 2,
                            borderColor: volunteerEditData.gdprConsent ? '#059669' : '#d1d5db',
                            borderRadius: 4,
                            backgroundColor: volunteerEditData.gdprConsent ? '#059669' : '#ffffff',
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {volunteerEditData.gdprConsent && (
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          )}
                        </View>
                        <Text style={{ fontSize: 14, color: '#111827' }}>
                          GDPR Consent
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={saveVolunteerDetails}
                  style={{
                    backgroundColor: '#059669',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Save Changes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowEditVolunteerModal(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Status Update Modal */}
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <View style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              padding: 24, 
              width: '90%', 
              maxWidth: 400
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
                Update Application Status
              </Text>
              
              {selectedPendingUser && (
                <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>
                  {selectedPendingUser.firstName} {selectedPendingUser.lastName} ({selectedPendingUser.email})
                </Text>
              )}

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Current Status: {selectedPendingUser?.status}
              </Text>

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                New Status:
              </Text>
              
              <View style={{ marginBottom: 16 }}>
                {(['UNREVIEWED', 'CONTACTED', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setSelectedStatus(status)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      marginBottom: 4,
                      borderRadius: 8,
                      backgroundColor: selectedStatus === status ? '#e0f2fe' : 'transparent',
                      borderWidth: 1,
                      borderColor: selectedStatus === status ? '#0891b2' : '#e5e7eb'
                    }}
                  >
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: getStatusColor(status),
                      marginRight: 8
                    }} />
                    <Text style={{ 
                      fontSize: 14, 
                      color: selectedStatus === status ? '#0891b2' : '#111827',
                      fontWeight: selectedStatus === status ? '600' : '400'
                    }}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                Notes (Optional):
              </Text>
              <TextInput
                value={statusNotes}
                onChangeText={setStatusNotes}
                placeholder="Add notes about this status change..."
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  textAlignVertical: 'top'
                }}
              />

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={updateApplicationStatus}
                  style={{
                    backgroundColor: '#3b82f6',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Update Status</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowStatusModal(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    paddingVertical: 12,
                    borderRadius: 8,
                    flex: 1,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
