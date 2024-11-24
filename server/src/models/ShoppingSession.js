// server/models/ShoppingSession.js
const mongoose = require('mongoose');

const shoppingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  cart: {
    items: [{
      productId: String,
      variantId: String,
      quantity: Number,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    total: Number
  },
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
}, {
  timestamps: true
});

const ShoppingSession = mongoose.model('ShoppingSession', shoppingSessionSchema);