# backend/api/v1/graphql/schema/__init__.py
import strawberry
from .auth import AuthQueries, AuthMutations
from .user import UserQueries, UserMutations
from .gamification import GamificationQueries, GamificationMutations

@strawberry.type
class Query(AuthQueries, UserQueries):
    pass

@strawberry.type
class Mutation(AuthMutations, UserMutations):
    pass


@strawberry.type
class Query(UserQueries, GamificationQueries):
    pass

@strawberry.type
class Mutation(UserMutations, GamificationMutations):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)
