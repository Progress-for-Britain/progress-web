const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeEvents() {
  try {
    console.log('Starting event completion process...');

    // Find events that have ended but are not yet completed
    const eventsToComplete = await prisma.event.findMany({
      where: {
        endDate: {
          lt: new Date()
        },
        status: {
          not: 'COMPLETED'
        }
      },
      include: {
        participants: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          },
          include: {
            user: true
          }
        }
      }
    });

    console.log(`Found ${eventsToComplete.length} events to complete`);

    for (const event of eventsToComplete) {
      console.log(`Processing event: ${event.title}`);

      // Calculate event duration in hours
      const durationMs = new Date(event.endDate) - new Date(event.startDate);
      const durationHours = durationMs / (1000 * 60 * 60);

      console.log(`Event duration: ${durationHours} hours`);

      // Process each participant
      for (const participant of event.participants) {
        // Check if volunteer hours already exist for this user and event
        const existingHours = await prisma.volunteerHours.findFirst({
          where: {
            userId: participant.userId,
            eventId: event.id
          }
        });

        if (!existingHours) {
          // Create volunteer hours entry
          await prisma.volunteerHours.create({
            data: {
              userId: participant.userId,
              eventId: event.id,
              hours: durationHours,
              description: `Auto-logged hours for event: ${event.title}`,
              date: new Date(event.endDate), // Use event end date
              approved: true // Auto-approve since it's based on participation
            }
          });

          console.log(`Logged ${durationHours} hours for user: ${participant.user.firstName} ${participant.user.lastName}`);
        } else {
          console.log(`Hours already logged for user: ${participant.user.firstName} ${participant.user.lastName}`);
        }
      }

      // Update event status to COMPLETED
      await prisma.event.update({
        where: { id: event.id },
        data: { status: 'COMPLETED' }
      });

      console.log(`Marked event as completed: ${event.title}`);
    }

    console.log('Event completion process finished successfully');
  } catch (error) {
    console.error('Error in event completion process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export the function for use in server.js
module.exports = { completeEvents };

// Run the function if this script is executed directly
if (require.main === module) {
  completeEvents();
}