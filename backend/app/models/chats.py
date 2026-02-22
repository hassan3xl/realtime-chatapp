import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from ..database import Base

class Thread(Base):
    __tablename__ = "chat_thread"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE"))
    second_person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE"))
    updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    first_person = relationship("User", foreign_keys=[first_person_id])
    second_person = relationship("User", foreign_keys=[second_person_id])
    messages: Mapped[list["ChatMessage"]] = relationship(back_populates="thread", cascade="all, delete-orphan", order_by="ChatMessage.timestamp.asc()")

class ChatMessage(Base):
    __tablename__ = "chat_chatmessage"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("chat_thread.id", ondelete="CASCADE"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("core_user.id", ondelete="CASCADE"))
    message: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    thread: Mapped["Thread"] = relationship(back_populates="messages")
    user = relationship("User")
