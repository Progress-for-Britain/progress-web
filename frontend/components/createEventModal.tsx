import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../util/api';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateEventModal = ({ visible, onClose, onEventCreated }: CreateEventModalProps) => {
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
    const [creating, setCreating] = useState(false);
    
    // Date picker states
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [startTime, setStartTime] = useState<string>('10:00');
    const [endTime, setEndTime] = useState<string>('12:00');

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

    const handleCreate = async () => {
        if (!validateAll()) {
            return;
        }

        try {
            setCreating(true);
            await api.createEvent({
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

            Alert.alert('Success', 'Event created successfully!');
            onClose();

            // Reset form
            setTitle('');
            setDescription('');
            setEventType('RALLY');
            setLocation('');
            setAddress('');
            setCapacity('');
            setIsVirtual(false);
            setVirtualLink('');
            setStartDate(new Date());
            setEndDate(new Date(Date.now() + 2 * 60 * 60 * 1000));
            setStartTime('10:00');
            setEndTime('12:00');

            // Notify parent to reload events
            onEventCreated();
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Error', 'Failed to create event. Please try again.');
        } finally {
            setCreating(false);
        }
    };

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
                            Create New Event
                        </Text>

                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={creating || !title.trim() || !description.trim()}
                            style={{
                                backgroundColor: creating || !title.trim() || !description.trim() ? '#9CA3AF' : '#d946ef',
                                borderRadius: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                            }}
                        >
                            <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                                {creating ? 'Creating...' : 'Create Event'}
                            </Text>
                        </TouchableOpacity>
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
                                borderColor: titleError ? 'red' : '#D1D5DB',
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
                                borderColor: descriptionError ? 'red' : '#D1D5DB',
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
                                    borderColor: virtualLinkError ? 'red' : '#D1D5DB',
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
                                {Platform.OS === 'web' ? (
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
                                ) : (
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
                                )}
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
                                {Platform.OS === 'web' ? (
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
                                ) : (
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
                                )}
                            </View>
                        </View>
                        {endTimeError ? <Text style={{ color: 'red', marginTop: 4 }}>{endTimeError}</Text> : null}
                    </View>

                    {dateTimeError ? (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: 'red', fontSize: 14 }}>{dateTimeError}</Text>
                        </View>
                    ) : null}

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
        </Modal>
    );
};