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