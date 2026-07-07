import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.users.dependencies import get_current_user, require_role
from app.modules.users.models import User, UserRole
from app.modules.gifting.schemas import GiftOrderCreate, GiftOrderResponse, PublicGiftResponse, GiftClaimCreate
from app.modules.calculator.schemas import SubscriptionResponse
from app.modules.scheduling.schemas import DeliveryEventResponse
from app.modules.gifting.service import GiftingService

router = APIRouter(prefix="/gifting")


@router.post("/", response_model=GiftOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_gift_order(
    data: GiftOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
):
    service = GiftingService(db)
    try:
        return await service.create_gift_order(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/public/{gift_order_id}", response_model=PublicGiftResponse)
async def get_public_gift_info(
    gift_order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = GiftingService(db)
    try:
        return await service.get_public_gift_info(gift_order_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{gift_order_id}/claim")
async def claim_gift(
    gift_order_id: uuid.UUID,
    data: GiftClaimCreate,
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
    db: AsyncSession = Depends(get_db),
):
    service = GiftingService(db)
    try:
        return await service.claim_gift(gift_order_id, data, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=list[GiftOrderResponse])
async def list_gift_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
):
    service = GiftingService(db)
    return await service.get_my_gift_orders(current_user.id)


@router.get("/received", response_model=list[GiftOrderResponse])
async def list_received_gifts(
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
    db: AsyncSession = Depends(get_db),
):
    service = GiftingService(db)
    return await service.list_received_gifts(current_user.id)


@router.get("/received/subscriptions", response_model=list[SubscriptionResponse])
async def list_received_subscriptions(
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
    db: AsyncSession = Depends(get_db),
):
    service = GiftingService(db)
    return await service.get_received_subscriptions(current_user.id)


@router.get("/received/deliveries", response_model=list[DeliveryEventResponse])
async def list_received_deliveries(
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
    db: AsyncSession = Depends(get_db),
):
    service = GiftingService(db)
    return await service.get_received_deliveries(current_user.id)


@router.get("/{gift_order_id}", response_model=GiftOrderResponse)
async def get_gift_order(
    gift_order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
):
    service = GiftingService(db)
    try:
        gift = await service.get_gift_order(gift_order_id)
        await service._verify_ownership(current_user.id, gift)
        return gift
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{gift_order_id}/activate")
async def activate_gift_order(
    gift_order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
):
    service = GiftingService(db)
    try:
        return await service.activate_gift_order(current_user.id, gift_order_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{gift_order_id}", response_model=GiftOrderResponse)
async def cancel_gift_order(
    gift_order_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CUSTOMER)),
):
    service = GiftingService(db)
    try:
        return await service.cancel_gift_order(current_user.id, gift_order_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))