import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Button, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '../util/auth-context';
import {
  getAllUsers,
  getPendingUsers,
  updateUser,
  approvePending,
  denyPending,
  addUserToEvent,
  removeUserFromEvent,
  User,
  PendingUser
} from '../util/api';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const [u, p] = await Promise.all([getAllUsers(), getPendingUsers()]);
      setUsers(u);
      setPending(p);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user]);

  const handleRoleChange = async (id: string) => {
    const role = roles[id];
    if (!role) return;
    try {
      await updateUser(id, { role: role as any });
      Alert.alert('Success', 'Role updated');
      loadData();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleAssign = async (id: string) => {
    const eventId = events[id];
    if (!eventId) return;
    try {
      await addUserToEvent(eventId, id);
      Alert.alert('Success', 'User assigned to event');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleUnassign = async (id: string) => {
    const eventId = events[id];
    if (!eventId) return;
    try {
      await removeUserFromEvent(eventId, id);
      Alert.alert('Success', 'User removed from event');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const code = await approvePending(id);
      Alert.alert('Approved', `Access code: ${code}`);
      loadData();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await denyPending(id);
      Alert.alert('Denied');
      loadData();
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Access denied</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'User Management' }} />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Pending Users</Text>
        {pending.map(p => (
          <View key={p.id} style={{ marginBottom: 12, padding: 8, borderWidth: 1, borderColor: '#ccc' }}>
            <Text>{p.firstName} {p.lastName} ({p.email})</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <Button title="Approve" onPress={() => handleApprove(p.id)} />
              <View style={{ width: 8 }} />
              <Button title="Deny" onPress={() => handleDeny(p.id)} />
            </View>
          </View>
        ))}

        <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 16 }}>Users</Text>
        {users.map(u => (
          <View key={u.id} style={{ marginBottom: 16, padding: 8, borderWidth: 1, borderColor: '#ccc' }}>
            <Text>{u.firstName} {u.lastName} ({u.email}) - {u.role}</Text>
            <TextInput
              placeholder="Role"
              value={roles[u.id]}
              onChangeText={t => setRoles({ ...roles, [u.id]: t })}
              style={{ borderWidth: 1, borderColor: '#999', padding: 4, marginTop: 4 }}
            />
            <Button title="Update Role" onPress={() => handleRoleChange(u.id)} />
            <TextInput
              placeholder="Event ID"
              value={events[u.id]}
              onChangeText={t => setEvents({ ...events, [u.id]: t })}
              style={{ borderWidth: 1, borderColor: '#999', padding: 4, marginTop: 8 }}
            />
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <Button title="Assign" onPress={() => handleAssign(u.id)} />
              <View style={{ width: 8 }} />
              <Button title="Unassign" onPress={() => handleUnassign(u.id)} />
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
