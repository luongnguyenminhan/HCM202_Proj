"""
Report service for handling user reports and content moderation.
"""

import asyncio
from datetime import datetime
from sqlmodel import Session
from app.core.database import engine
from app.models import Report, ReportCreate
from app.schemas.common_types import ChatReportResponse


class ReportService:
	"""Service for handling user reports"""

	async def create_report(self, reference_id: str, reason: str, source: str = 'chat_message') -> ChatReportResponse:
		"""Create a new report"""
		await asyncio.sleep(0.05)

		with Session(engine) as session:
			report_data = ReportCreate(source=source, reference_id=reference_id, reason=reason, resolved=False)

			report = Report.model_validate(report_data.model_dump())
			session.add(report)
			session.commit()
			session.refresh(report)

		return ChatReportResponse(status='ok', report_id=report.id)
