const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to verify Stripe webhook signature
const verifyStripeWebhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  req.stripeEvent = event;
  next();
};

// Create subscription checkout session
router.post('/create-checkout', async (req, res) => {
  try {
    const { planId, billingInterval, metadata } = req.body;

    // Validate required fields
    if (!planId || !billingInterval) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and billing interval are required'
      });
    }

    // Validate that email is provided in metadata
    if (!metadata?.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required in metadata'
      });
    }

    // Define products - only need product IDs now
    const plans = {
      'basic': {
        productId: process.env.STRIPE_BASIC_PRODUCT_ID
      },
      'premium': {
        productId: process.env.STRIPE_PREMIUM_PRODUCT_ID
      }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.productId, // Use product ID to enable plan selection at checkout
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/donate?canceled=true`,
      metadata: {
        email: metadata.email, // Use email as identifier since user doesn't exist yet
        planId,
        billingInterval,
        ...metadata
      },
      customer_email: metadata.email, // Set customer email for Stripe
      allow_promotion_codes: true,
    });

    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id
      }
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
});

// Get subscription details
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const payment = await prisma.payment.findFirst({
      where: { userId: userId, type: "subscription" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!payment) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const payment = await prisma.payment.findFirst({
      where: { userId: userId, type: "subscription", status: 'ACTIVE' }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel in Stripe
    await stripe.subscriptions.update(payment.subscriptionId, {
      cancel_at_period_end: true
    });

    // Update local database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLING',
        cancelledAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Reactivate subscription
router.post('/reactivate', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const payment = await prisma.payment.findFirst({
      where: { userId: userId, type: "subscription", status: 'CANCELLING' }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No cancelling subscription found'
      });
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(payment.subscriptionId, {
      cancel_at_period_end: false
    });

    // Update local database
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'ACTIVE',
        cancelledAt: null
      }
    });

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription'
    });
  }
});

// Update payment method
router.post('/update-payment-method', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const payment = await prisma.payment.findFirst({
      where: { userId: userId, type: "subscription", status: 'ACTIVE' }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: payment.customerId,
      return_url: `${process.env.FRONTEND_URL}/account`,
    });

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });

  } catch (error) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer portal session'
    });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), verifyStripeWebhook, async (req, res) => {
  const event = req.stripeEvent;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session) {
  const { email, firstName, lastName, phone, constituency, interests, volunteer, newsletter } = session.metadata;

  try {
    // Validate required fields
    if (!email) {
      console.error('No email found in session metadata');
      return;
    }

    // Get the selected price from the session
    const lineItem = session.line_items?.data?.[0] || await stripe.checkout.sessions.listLineItems(session.id).then(res => res.data[0]);
    const priceId = lineItem?.price?.id;

    if (!priceId) {
      console.error('No price ID found in session');
      return;
    }

    // Fetch the price details to get product and billing information
    const price = await stripe.prices.retrieve(priceId, { expand: ['product'] });
    
    if (!price) {
      console.error('Price not found:', priceId);
      return;
    }

    // Determine plan type from product ID
    const productId = price.product.id;
    let planId;
    if (productId === process.env.STRIPE_BASIC_PRODUCT_ID) {
      planId = 'basic';
    } else if (productId === process.env.STRIPE_PREMIUM_PRODUCT_ID) {
      planId = 'premium';
    } else {
      console.error('Unknown product ID:', productId);
      return;
    }

    // Determine billing interval
    const billingInterval = price.recurring?.interval || 'monthly'; // fallback to monthly
    
    // Convert amount from cents to pounds
    const amount = price.unit_amount / 100;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email }
    });

    // If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName || null,
          lastName: lastName || null,
          phone: phone || null,
          constituency: constituency || null,
          role: volunteer === 'true' ? 'VOLUNTEER' : 'MEMBER',
          interests: interests ? interests.split(',') : [],
          newsletter: newsletter === 'true',
          address: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('User created:', user.id);
    }

    // Create or update payment record
    let payment = await prisma.payment.findFirst({
      where: { userId: user.id, type: "subscription" }
    });

    const paymentData = {
      userId: user.id,
      subscriptionId: session.subscription,
      customerId: session.customer,
      status: 'ACTIVE',
      planId: planId,
      billingInterval: billingInterval,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingInterval === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
      type: "subscription",
      subPlatform: 'stripe',
      startDate: new Date(),
      amount: amount,
      currency: 'gbp',
      totalDonated: 0,
      updatedAt: new Date()
    };

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: paymentData
      });
    } else {
      await prisma.payment.create({
        data: paymentData
      });
    }

    console.log('Payment created/updated:', payment ? payment.id : 'new');
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { subscriptionId: invoice.subscription }
    });

    if (payment) {
      // Update payment period
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          currentPeriodStart: new Date(invoice.period_start * 1000),
          currentPeriodEnd: new Date(invoice.period_end * 1000),
          updatedAt: new Date()
        }
      });

      console.log('Payment succeeded:', payment.id);
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { subscriptionId: invoice.subscription }
    });

    if (payment) {
      // Mark payment as past due
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAST_DUE',
          updatedAt: new Date()
        }
      });

      console.log('Payment failed:', payment.id);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { subscriptionId: subscription.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: subscription.status.toUpperCase(),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelledAt: subscription.cancel_at_period_end ? new Date(subscription.current_period_end * 1000) : null,
          updatedAt: new Date()
        }
      });

      console.log('Payment updated:', payment.id);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { subscriptionId: subscription.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('Payment cancelled:', payment.id);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

module.exports = router;