import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Table, Column
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base

# Many-to-Many table for contacts
contact_table = Table(
    "chat_contact",
    Base.metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE")),
    Column("friend_id", UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE")),
    Column("added_on", DateTime, default=datetime.utcnow),
)

class User(Base):
    __tablename__ = "core_user"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(150), unique=True)
    phone_number: Mapped[str] = mapped_column(String(17), unique=True)
    display_name: Mapped[str] = mapped_column(String(100), default="")
    password: Mapped[str] = mapped_column(String(128))
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_staff: Mapped[bool] = mapped_column(Boolean, default=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    date_joined: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    # Contacts - using a manual join for now or relationship
    # This is a bit tricky in SQLAlchemy with M2M on self, but let's keep it simple first
    friends: Mapped[List["User"]] = relationship(
        "User",
        secondary=contact_table,
        primaryjoin=id == contact_table.c.user_id,
        secondaryjoin=id == contact_table.c.friend_id,
        backref="added_by"
    )

class Profile(Base):
    __tablename__ = "core_profile"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE"), unique=True)
    avatar: Mapped[str] = mapped_column(String(255), default="default_avatar.png")
    bio: Mapped[str] = mapped_column(String(150), default="Hey there! I am using WhatsApp.")
    is_online: Mapped[bool] = mapped_column(Boolean, default=False)
    last_seen: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="profile")
