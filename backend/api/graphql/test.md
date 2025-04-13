# Get current user info
query {
  me {
    id
    email
    username
    credits
  }
}

# Get my gamification progress
query {
  myGamification {
    eventTypeId
    points
    badgeId
  }
}

# Register an event
mutation {
  registerEvent(input: {eventTypeId: 1}) {
    id
    timestamp
  }
}

# Update my profile
mutation {
  updateMe(input: {username: "newusername"}) {
    id
    username
  }
}


# Get site settings (admin only)
query {
  settings {
    key
    value
    description
  }
}

# Update a setting (admin only)
mutation {
  updateSetting(key: "log_level", value: "DEBUG") {
    key
    value
  }
}

# Purchase credits
mutation {
  purchaseCredits(input: {credits: 100, paymentAmount: 9.99}) {
    transactionId
    creditsAdded
    newBalance
  }
}

# Get payment providers (admin only)
query {
  paymentProviders {
    id
    name
    active
  }
}

# Create a coupon (admin only)
mutation {
  createCoupon(input: {
    name: "Summer Discount",
    credits: 50,
    expiresAt: "2023-12-31T23:59:59"
  }) {
    id
    uniqueIdentifier
  }
}

# Redeem a coupon
mutation {
  redeemCoupon(couponId: 1) {
    id
    credits
    status
  }
}