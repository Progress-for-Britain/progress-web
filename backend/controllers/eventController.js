const prisma = require('../utils/prisma');

// Get all events with pagination and filtering
const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      eventType, 
      status = 'UPCOMING',
      search,
      startDate,
      endDate 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      ...(eventType && { eventType }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(startDate && endDate && {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          participants: {
            where: {
              status: {
                not: 'CANCELLED'
              }
            },
            select: {
              id: true,
              status: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          startDate: 'asc'
        }
      }),
      prisma.event.count({ where })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        participants: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            registeredAt: 'asc'
          }
        },
        volunteerHours: {
          where: {
            approved: true
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      location,
      address,
      latitude,
      longitude,
      capacity,
      isVirtual,
      virtualLink,
      startDate,
      endDate,
      imageUrl,
      tags
    } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        eventType,
        location,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        capacity: capacity ? parseInt(capacity) : null,
        isVirtual: Boolean(isVirtual),
        virtualLink,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl,
        tags: tags || [],
        createdById: req.user.userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if event exists and is open for registration
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'UPCOMING') {
      return res.status(400).json({
        success: false,
        message: 'Event is not open for registration'
      });
    }

    if (event.capacity && event._count.participants >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity'
      });
    }

    // Check if user is already registered
    const existingParticipation = await prisma.eventParticipant.findFirst({
      where: {
        userId: userId,
        eventId: id
      }
    });

    if (existingParticipation) {
      // If user was previously cancelled, allow them to rejoin by updating status
      if (existingParticipation.status === 'CANCELLED') {
        const updatedParticipation = await prisma.eventParticipant.update({
          where: {
            id: existingParticipation.id
          },
          data: {
            status: 'REGISTERED',
            registeredAt: new Date() // Update registration time
          },
          include: {
            event: {
              select: {
                title: true,
                startDate: true
              }
            }
          }
        });

        return res.json({
          success: true,
          message: 'Successfully re-registered for event',
          data: updatedParticipation
        });
      }

      // If user is actively registered (not cancelled), prevent duplicate registration
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Register user for event (new registration)
    const participation = await prisma.eventParticipant.create({
      data: {
        userId,
        eventId: id,
        status: 'REGISTERED'
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully registered for event',
      data: participation
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    });
  }
};

// Cancel event registration
const cancelEventRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const participation = await prisma.eventParticipant.findFirst({
      where: {
        userId: userId,
        eventId: id
      }
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    if (participation.status === 'ATTENDED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for an event you have already attended'
      });
    }

    await prisma.eventParticipant.update({
      where: {
        id: participation.id
      },
      data: {
        status: 'CANCELLED'
      }
    });

    res.json({
      success: true,
      message: 'Event registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling event registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel event registration',
      error: error.message
    });
  }
};

// Log volunteer hours
const logVolunteerHours = async (req, res) => {
  try {
    const { hours, description, date, eventId } = req.body;
    const userId = req.user.userId;

    const volunteerEntry = await prisma.volunteerHours.create({
      data: {
        userId,
        hours: parseFloat(hours),
        description,
        date: new Date(date),
        eventId: eventId || null
      },
      include: {
        event: {
          select: {
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Volunteer hours logged successfully',
      data: volunteerEntry
    });
  } catch (error) {
    console.error('Error logging volunteer hours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log volunteer hours',
      error: error.message
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      eventType,
      location,
      address,
      latitude,
      longitude,
      capacity,
      isVirtual,
      virtualLink,
      startDate,
      endDate,
      imageUrl,
      tags,
      status
    } = req.body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to update this event
    if (req.user.role !== 'ADMIN' && existingEvent.createdById !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this event'
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(eventType && { eventType }),
        ...(location !== undefined && { location }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
        ...(isVirtual !== undefined && { isVirtual: Boolean(isVirtual) }),
        ...(virtualLink !== undefined && { virtualLink }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(tags && { tags: tags || [] }),
        ...(status && { status })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user has permission to delete this event
    if (req.user.role !== 'ADMIN' && existingEvent.createdById !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this event'
      });
    }

    // Check if event has participants and is upcoming
    if (existingEvent._count.participants > 0 && existingEvent.status === 'UPCOMING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an upcoming event with registered participants. Cancel the event instead.'
      });
    }

    // Delete the event (this will cascade delete related records due to Prisma schema)
    await prisma.event.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Generate iCal feed for user's events
const generateUserICal = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch events where user is a participant
    const userEvents = await prisma.eventParticipant.findMany({
      where: {
        userId: userId,
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        event: {
          include: {
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'asc'
        }
      }
    });

    // Generate iCal content
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Progress Web//Events Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Progress Events
X-WR-TIMEZONE:UTC
`;

    userEvents.forEach((participation) => {
      const event = participation.event;
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // Format dates for iCal (YYYYMMDDTHHMMSS)
      const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };

      const eventLocation = event.isVirtual 
        ? (event.virtualLink || 'Virtual Event')
        : (event.location || event.address || 'TBD');

      const organizerName = event.createdBy ? `${event.createdBy.firstName} ${event.createdBy.lastName}` : 'Organizer';
      const organizerEmail = event.createdBy?.email || 'organizer@example.com';

      icalContent += `BEGIN:VEVENT
UID:${event.id}@progress-web
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
DTSTAMP:${formatDate(new Date())}
SUMMARY:${event.title.replace(/[,;\\]/g, '\\$&')}
DESCRIPTION:${(event.description || '').replace(/[,;\\]/g, '\\$&')}
LOCATION:${eventLocation.replace(/[,;\\]/g, '\\$&')}
ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder - 15 minutes before
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Reminder - 1 hour before
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:Reminder - 1 day before
ACTION:DISPLAY
END:VALARM
END:VEVENT
`;
    });

    icalContent += 'END:VCALENDAR';

    // Set headers for iCal download
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="progress-events-${userId}.ics"`);
    
    res.send(icalContent);
  } catch (error) {
    console.error('Error generating iCal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate calendar feed',
      error: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  logVolunteerHours,
  generateUserICal
};
