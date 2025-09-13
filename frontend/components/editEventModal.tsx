import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../util/api';
import { Event } from '../util/types';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
  onEventDeleted?: () => void;
  event: Event | null;
}

export const EditEventModal = ({ visible, onClose, onEventUpdated, onEventDeleted, event }: EditEventModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<'RALLY' | 'MEETING' | 'FUNDRAISER' | 'CAMPAIGN' | 'VOLUNTEER' | 'TRAINING' | 'CONFERENCE' | 'SOCIAL'>('RALLY');
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState('');
    const [capacity, setCapacity] = useState('');
    const [isVirtual, setIsVirtual] = useState(false);
    const [virtualLink, setVirtualLink] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours later
    const [updating, setUpdating] = useState(false);
    
    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startTime, setStartTime] = useState<string>('10:00');
    const [endTime, setEndTime] = useState<string>('12:00');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // Validation error states
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [startTimeError, setStartTimeError] = useState('');
    const [endTimeError, setEndTimeError] = useState('');
    const [virtualLinkError, setVirtualLinkError] = useState('');
    const [dateTimeError, setDateTimeError] = useState('');

    const eventTypes = [
        { id: 'RALLY', label: 'Rallies', icon: 'megaphone' },
        { id: 'MEETING', label: 'Meetings', icon: 'people' },
        { id: 'FUNDRAISER', label: 'Fundraisers', icon: 'heart' },
        { id: 'CAMPAIGN', label: 'Campaigns', icon: 'flag' },
        { id: 'VOLUNTEER', label: 'Volunteer', icon: 'hand-left' },
        { id: 'TRAINING', label: 'Training', icon: 'school' },
        { id: 'CONFERENCE', label: 'Conferences', icon: 'business' },
        { id: 'SOCIAL', label: 'Social', icon: 'happy' }
    ];

    // Populate form when event prop changes
    useEffect(() => {
        if (event) {
            setTitle(event.title);
            setDescription(event.description);
            setEventType(event.eventType);
            setLocation(event.location || '');
            setAddress(event.address || '');
            setCapacity(event.capacity ? event.capacity.toString() : '');
            setIsVirtual(event.isVirtual);
            setVirtualLink(event.virtualLink || '');
            
            const startDateTime = new Date(event.startDate);
            const endDateTime = new Date(event.endDate);
            setStartDate(startDateTime);
            setEndDate(endDateTime);
            setStartTime(startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
            setEndTime(endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        }
    }, [event]);

    const formatDateTime = (date: Date, time: string) => {
        const [hours, minutes] = time.split(':');
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours), parseInt(minutes));
        return newDate.toISOString();
    };

    // Validation functions
    const validateTitle = (value: string) => {
        if (!value.trim()) {
            setTitleError('Event title is required');
            return false;
        }
        setTitleError('');
        return true;
    };

    const validateDescription = (value: string) => {
        if (!value.trim()) {
            setDescriptionError('Event description is required');
            return false;
        }
        setDescriptionError('');
        return true;
    };

    const validateTime = (time: string, fieldName: string, setError: (error: string) => void) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!time.trim()) {
            setError(`${fieldName} time is required`);
            return false;
        }
        if (!timeRegex.test(time)) {
            setError(`${fieldName} time must be in HH:MM format (e.g., 14:30)`);
            return false;
        }
        setError('');
        return true;
    };

    const validateVirtualLink = (value: string) => {
        if (isVirtual && !value.trim()) {
            setVirtualLinkError('Virtual link is required for virtual events');
            return false;
        }
        setVirtualLinkError('');
        return true;
    };

    const validateDateTime = () => {
        const startDateTime = formatDateTime(startDate, startTime);
        const endDateTime = formatDateTime(endDate, endTime);
        
        if (new Date(startDateTime) >= new Date(endDateTime)) {
            setDateTimeError('End date and time must be after start date and time');
            return false;
        }
        setDateTimeError('');
        return true;
    };

    const validateAll = () => {
        const titleValid = validateTitle(title);
        const descriptionValid = validateDescription(description);
        const startTimeValid = validateTime(startTime, 'Start', setStartTimeError);
        const endTimeValid = validateTime(endTime, 'End', setEndTimeError);
        const virtualLinkValid = validateVirtualLink(virtualLink);
        const dateTimeValid = validateDateTime();

        return titleValid && descriptionValid && startTimeValid && endTimeValid && virtualLinkValid && dateTimeValid;
    };

    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            setStartDate(date);
        }
        setShowStartDatePicker(false);
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            setEndDate(date);
        }
        setShowEndDatePicker(false);
    };

    const handleUpdate = async () => {
        if (!event || !validateAll()) {
            Alert.alert('Error', 'Please fix the errors in the form.');
            return;
        }

        try {
            setUpdating(true);
            await api.updateEvent(event.id, {
                title: title.trim(),
                description: description.trim(),
                eventType,
                location: location.trim() || undefined,
                address: address.trim() || undefined,
                capacity: capacity ? parseInt(capacity) : undefined,
                isVirtual,
                virtualLink: virtualLink.trim() || undefined,
                startDate: formatDateTime(startDate, startTime),
                endDate: formatDateTime(endDate, endTime),
            });

            Alert.alert('Success', 'Event updated successfully!');
            onClose();
            onEventUpdated();
        } catch (error) {
            console.error('Error updating event:', error);
            Alert.alert('Error', 'Failed to update event. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = () => {
        if (Platform.OS === 'web') {
            setShowDeleteConfirmation(true);
        } else {
            Alert.alert(
                'Cancel Event',
                `Are you sure you want to cancel "${event?.title}"? This will notify all registered participants and the event cannot be reactivated.`,
                [
                    {
                        text: 'No, Keep Event',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes, Cancel Event',
                        style: 'destructive',
                        onPress: performDelete,
                    },
                ]
            );
        }
    };

    const performDelete = async () => {
        if (!event) return;
        
        try {
            setDeleting(true);
            await api.updateEvent(event.id, {
                status: 'CANCELLED'
            });
            Alert.alert('Success', 'Event cancelled successfully! All participants have been notified.');
            onClose();
            if (onEventDeleted) {
                onEventDeleted();
            } else {
                onEventUpdated(); // Fallback to refresh
            }
        } catch (error: any) {
            console.error('Error cancelling event:', error);
            Alert.alert('Error', error.message || 'Failed to cancel event. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (!event) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                <View style={{
                    backgroundColor: '#ffffff',
                    paddingTop: Platform.OS === 'ios' ? 60 : 40,
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb'
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ padding: 8 }}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                            Edit Event
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={handleDelete}
                                disabled={deleting || updating}
                                style={{
                                    backgroundColor: deleting || updating ? '#9CA3AF' : '#f59e0b',
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    marginRight: 8,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}
                            >
                                <Ionicons 
                                    name={deleting ? "hourglass-outline" : "close-circle-outline"} 
                                    size={16} 
                                    color="#ffffff" 
                                    style={{ marginRight: 4 }} 
                                />
                                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                                    {deleting ? 'Cancelling...' : 'Cancel Event'}
                                </Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                onPress={handleUpdate}
                                disabled={updating || deleting || !title.trim() || !description.trim()}
                                style={{
                                    backgroundColor: updating || deleting || !title.trim() || !description.trim() ? '#9CA3AF' : '#d946ef',
                                    borderRadius: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                }}
                            >
                                <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                                    {updating ? 'Updating...' : 'Update Event'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <ScrollView style={{ flex: 1, padding: 20 }}>
                    {/* Title */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            Event Title *
                        </Text>
                        <TextInput
                            value={title}
                            onChangeText={(value) => {
                                setTitle(value);
                                validateTitle(value);
                            }}
                            placeholder="Enter event title..."
                            style={{
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                fontSize: 16,
                                backgroundColor: '#ffffff'
                            }}
                        />
                        {titleError ? <Text style={{ color: 'red', marginTop: 4 }}>{titleError}</Text> : null}
                    </View>

                    {/* Description */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            Description *
                        </Text>
                        <TextInput
                            value={description}
                            onChangeText={(value) => {
                                setDescription(value);
                                validateDescription(value);
                            }}
                            placeholder="Enter event description..."
                            multiline
                            numberOfLines={4}
                            style={{
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                fontSize: 16,
                                backgroundColor: '#ffffff',
                                height: 100,
                                textAlignVertical: 'top'
                            }}
                        />
                        {descriptionError ? <Text style={{ color: 'red', marginTop: 4 }}>{descriptionError}</Text> : null}
                    </View>

                    {/* Event Type */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            Event Type *
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                                {eventTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        onPress={() => setEventType(type.id as any)}
                                        style={{
                                            backgroundColor: eventType === type.id ? '#d946ef' : '#ffffff',
                                            borderWidth: 2,
                                            borderColor: eventType === type.id ? '#d946ef' : '#e5e7eb',
                                            borderRadius: 8,
                                            paddingHorizontal: 16,
                                            paddingVertical: 8,
                                            marginRight: 12,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={16}
                                            color={eventType === type.id ? '#ffffff' : '#6b7280'}
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: '600',
                                                color: eventType === type.id ? '#ffffff' : '#374151'
                                            }}
                                        >
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Virtual Event Toggle */}
                    <View style={{ marginBottom: 20 }}>
                        <TouchableOpacity
                            onPress={() => setIsVirtual(!isVirtual)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#ffffff',
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                        >
                            <Ionicons
                                name={isVirtual ? "checkmark-circle" : "ellipse-outline"}
                                size={24}
                                color={isVirtual ? '#d946ef' : '#9CA3AF'}
                                style={{ marginRight: 12 }}
                            />
                            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '500' }}>
                                This is a virtual event
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Virtual Link (if virtual) */}
                    {isVirtual && (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                                Virtual Link *
                            </Text>
                            <TextInput
                                value={virtualLink}
                                onChangeText={(value) => {
                                    setVirtualLink(value);
                                    validateVirtualLink(value);
                                }}
                                placeholder="Enter meeting link (Zoom, Teams, etc.)..."
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#D1D5DB',
                                    borderRadius: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    fontSize: 16,
                                    backgroundColor: '#ffffff'
                                }}
                            />
                            {virtualLinkError ? <Text style={{ color: 'red', marginTop: 4 }}>{virtualLinkError}</Text> : null}
                        </View>
                    )}

                    {/* Location (if not virtual) */}
                    {!isVirtual && (
                        <>
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                                    Location
                                </Text>
                                <TextInput
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Enter location name..."
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 8,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 16,
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </View>

                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                                    Address
                                </Text>
                                <TextInput
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter full address..."
                                    multiline
                                    numberOfLines={2}
                                    style={{
                                        borderWidth: 1,
                                        borderColor: '#D1D5DB',
                                        borderRadius: 8,
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 16,
                                        backgroundColor: '#ffffff',
                                        height: 60,
                                        textAlignVertical: 'top'
                                    }}
                                />
                            </View>
                        </>
                    )}

                    {/* Capacity */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            Capacity (Optional)
                        </Text>
                        <TextInput
                            value={capacity}
                            onChangeText={setCapacity}
                            placeholder="Enter maximum number of participants..."
                            keyboardType="numeric"
                            style={{
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                fontSize: 16,
                                backgroundColor: '#ffffff'
                            }}
                        />
                    </View>

                    {/* Date & Time */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            Start Date & Time *
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => setShowStartDatePicker(true)}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: '#D1D5DB',
                                    borderRadius: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    backgroundColor: '#ffffff',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Text style={{ fontSize: 16, color: '#374151' }}>
                                    {startDate.toLocaleDateString()}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                            </TouchableOpacity>
                            
                            <View style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: startTimeError ? 'red' : '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#ffffff',
                                ...(Platform.OS === 'web' && {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: 8
                                })
                            }}>
                                <TextInput
                                    value={startTime}
                                    onChangeText={(value) => {
                                        setStartTime(value);
                                        validateTime(value, 'Start', setStartTimeError);
                                    }}
                                    placeholder="HH:MM"
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 16,
                                    }}
                                />
                            </View>
                        </View>
                        {startTimeError ? <Text style={{ color: 'red', marginTop: 4 }}>{startTimeError}</Text> : null}
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                            End Date & Time *
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                onPress={() => setShowEndDatePicker(true)}
                                style={{
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: '#D1D5DB',
                                    borderRadius: 8,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    backgroundColor: '#ffffff',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Text style={{ fontSize: 16, color: '#374151' }}>
                                    {endDate.toLocaleDateString()}
                                </Text>
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                            </TouchableOpacity>
                            
                            <View style={{
                                flex: 1,
                                borderWidth: 1,
                                borderColor: endTimeError ? 'red' : '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#ffffff',
                                ...(Platform.OS === 'web' && {
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingHorizontal: 8
                                })
                            }}>
                                <TextInput
                                    value={endTime}
                                    onChangeText={(value) => {
                                        setEndTime(value);
                                        validateTime(value, 'End', setEndTimeError);
                                    }}
                                    placeholder="HH:MM"
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 12,
                                        fontSize: 16,
                                    }}
                                />
                            </View>
                        </View>
                        {endTimeError ? <Text style={{ color: 'red', marginTop: 4 }}>{endTimeError}</Text> : null}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>

            {/* Date Picker Modals */}
            {showStartDatePicker && Platform.OS === 'web' && (
                <Modal
                    visible={showStartDatePicker}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20
                    }}>
                        <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: 20,
                                textAlign: 'center'
                            }}>
                                Select Start Date
                            </Text>
                            
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                minDate={new Date()}
                                inline
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {showEndDatePicker && Platform.OS === 'web' && (
                <Modal
                    visible={showEndDatePicker}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20
                    }}>
                        <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            padding: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8
                        }}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#111827',
                                marginBottom: 20,
                                textAlign: 'center'
                            }}>
                                Select End Date
                            </Text>
                            
                            <DatePicker
                                selected={endDate}
                                onChange={handleEndDateChange}
                                minDate={startDate}
                                inline
                            />
                        </View>
                    </View>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <Modal
                    visible={showDeleteConfirmation}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20
                    }}>
                        <View style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 16,
                            padding: 24,
                            maxWidth: 400,
                            width: '100%',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 16,
                            elevation: 8
                        }}>
                            <View style={{ marginBottom: 16 }}>
                                <Ionicons
                                    name="warning"
                                    size={48}
                                    color="#f59e0b"
                                    style={{ alignSelf: 'center', marginBottom: 16 }}
                                />
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    color: '#111827',
                                    textAlign: 'center',
                                    marginBottom: 8
                                }}>
                                    Cancel Event
                                </Text>
                                <Text style={{
                                    fontSize: 16,
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    lineHeight: 24
                                }}>
                                    Are you sure you want to cancel "{event?.title}"? This will notify all registered participants and the event cannot be reactivated.
                                </Text>
                            </View>
                            
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                gap: 12
                            }}>
                                <TouchableOpacity
                                    onPress={() => setShowDeleteConfirmation(false)}
                                    disabled={deleting}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: 8,
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        alignItems: 'center'
                                    }}
                                >
                                    <Text style={{
                                        color: '#374151',
                                        fontWeight: '600',
                                        fontSize: 16
                                    }}>
                                        Keep Event
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowDeleteConfirmation(false);
                                        performDelete();
                                    }}
                                    disabled={deleting}
                                    style={{
                                        flex: 1,
                                        backgroundColor: deleting ? '#9CA3AF' : '#f59e0b',
                                        borderRadius: 8,
                                        paddingVertical: 12,
                                        paddingHorizontal: 16,
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {deleting && (
                                        <Ionicons 
                                            name="hourglass-outline" 
                                            size={16} 
                                            color="#ffffff" 
                                            style={{ marginRight: 8 }} 
                                        />
                                    )}
                                    <Text style={{
                                        color: '#ffffff',
                                        fontWeight: '600',
                                        fontSize: 16
                                    }}>
                                        {deleting ? 'Cancelling...' : 'Cancel Event'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </Modal>
    );
};
