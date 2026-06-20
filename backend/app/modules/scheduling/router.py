from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.users.dependencies import require_role
from app.modules.users.models import User, UserRole
from app.modules.scheduling.schemas import DeliveryEventResponse
from app.modules.scheduling.service import SchedulingService

router = APIRouter(prefix="/scheduling")

@router.get("/deliveries", response_model=list[DeliveryEventResponse])
async def get_my_deliveries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER))
):
    service = SchedulingService(db)
    return await service.get_my_deliveries(current_user.id)

@router.post("/force-deliveries", status_code=status.HTTP_202_ACCEPTED)
async def force_deliveries_and_billing(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    """Demo Override endpoint: Dispatches a Celery task to instantly update deliveries and generate invoices."""
    from app.tasks.delivery_tasks import process_bulk_deliveries_task
    process_bulk_deliveries_task.delay()
    return {"message": "Background task initiated: Force Run Deliveries & Billing"}

@router.post("/force-daily-deliveries", status_code=status.HTTP_202_ACCEPTED)
async def force_daily_deliveries(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    from app.tasks.delivery_tasks import process_daily_deliveries
    process_daily_deliveries.delay()
    return {"message": "Background task initiated: Process Daily Deliveries"}

@router.post("/force-auto-substitute", status_code=status.HTTP_202_ACCEPTED)
async def force_auto_substitute(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    from app.tasks.price_monitor import check_stock_availability
    check_stock_availability.delay()
    return {"message": "Background task initiated: Auto-Substitution Engine"}

@router.post("/force-payments", status_code=status.HTTP_202_ACCEPTED)
async def force_payments(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    from app.tasks.payment_tasks import process_due_payments
    process_due_payments.delay()
    return {"message": "Background task initiated: Process Due Payments"}

@router.post("/force-grace-periods", status_code=status.HTTP_202_ACCEPTED)
async def force_grace_periods(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    from app.tasks.business_tasks import enforce_grace_periods
    enforce_grace_periods.delay()
    return {"message": "Background task initiated: Enforce Grace Periods"}

@router.post("/force-analytics", status_code=status.HTTP_202_ACCEPTED)
async def force_analytics(
    current_user: User = Depends(require_role(UserRole.SUPERADMIN))
):
    from app.tasks.analytics_tasks import calculate_weekly_snapshot
    calculate_weekly_snapshot.delay()
    return {"message": "Background task initiated: Calculate Analytics Snapshot"}
