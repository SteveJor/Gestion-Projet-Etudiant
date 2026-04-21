"""Schémas communs : pagination, messages, tokens."""
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None


class Message(BaseModel):
    message: str


class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int
