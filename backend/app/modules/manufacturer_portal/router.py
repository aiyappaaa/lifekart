import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func

from app.db.session import get_db
from app.modules.users.models import User, UserRole
from app.modules.users.dependencies import require_role
from app.modules.catalog.service import CatalogService
from app.modules.catalog.schemas import (
    ManufacturerCreate,
    ManufacturerResponse,
    ManufacturerUpdate,
    ManufacturerAnalyticsResponse,
    ProductResponse,
    ProductCreate,
    ProductUpdate,
    SubstitutionCreate,
    SubstitutionResponse,
    ProgressionRuleCreate,
    ProgressionRuleResponse,
)

from app.modules.agreements.models import WholesaleAgreement
from app.modules.catalog.models import Product

router = APIRouter(prefix="/portal/manufacturer", tags=["Manufacturer Portal"])
async def setup_portal_rls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.MANUFACTURER, UserRole.SUPERADMIN))
):
    """
    Global dependency for this router.
    Extracts the manufacturer profile, then sets the PostgreSQL
    session variables to strictly enforce Row-Level Security for all queries.
    """
    service = CatalogService(db)
    try:
        manufacturer = await service.get_manufacturer_by_user(current_user.id)
        
        # Inject context into PostgreSQL session for RLS to enforce
        await db.execute(text("SET LOCAL app.portal_context = 'manufacturer';"))
        await db.execute(text(f"SET LOCAL app.current_manufacturer_id = '{manufacturer.id}';"))
        
        return manufacturer
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

async def require_verified_manufacturer(manufacturer = Depends(setup_portal_rls)):
    if not manufacturer.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Your account must be verified by an admin before you can manage products."
        )
    return manufacturer


@router.get("/profile", response_model=ManufacturerResponse)
async def get_portal_profile(
    manufacturer = Depends(setup_portal_rls),
):
    return manufacturer


@router.post("/profile", response_model=ManufacturerResponse, status_code=status.HTTP_201_CREATED)
async def create_portal_profile(
    data: ManufacturerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.MANUFACTURER, UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        # We don't use setup_portal_rls here because the profile doesn't exist yet
        return await service.create_manufacturer(current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.patch("/profile", response_model=ManufacturerResponse)
async def update_portal_profile(
    data: ManufacturerUpdate,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(setup_portal_rls),
):
    service = CatalogService(db)
    try:
        return await service.update_manufacturer(manufacturer.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/analytics", response_model=ManufacturerAnalyticsResponse)
async def get_portal_analytics(
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(setup_portal_rls)
):
    # Total active products
    result_prod = await db.execute(
        select(func.count(Product.id)).where(
            Product.manufacturer_id == manufacturer.id,
            Product.is_active == True
        )
    )
    total_products = result_prod.scalar() or 0

    # Active agreements & Total Contracted Revenue
    result_agr = await db.execute(
        select(
            func.count(WholesaleAgreement.id.distinct()).label("active_agreements"),
            func.sum(WholesaleAgreement.total_contract_value).label("total_revenue")
        ).where(
            WholesaleAgreement.manufacturer_id == manufacturer.id,
            WholesaleAgreement.status == "active"
        )
    )
    row = result_agr.fetchone()
    active_agreements = row.active_agreements if row and row.active_agreements else 0
    total_revenue = row.total_revenue if row and row.total_revenue else 0

    return ManufacturerAnalyticsResponse(
        active_agreements=active_agreements,
        contracted_revenue=total_revenue,
        total_products=total_products
    )


@router.get("/products", response_model=list[ProductResponse])
async def get_portal_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(setup_portal_rls),
):
    service = CatalogService(db)
    return await service.get_products(manufacturer_id=manufacturer.id, skip=skip, limit=limit)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_portal_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(require_verified_manufacturer),
):
    service = CatalogService(db)
    try:
        return await service.create_product(manufacturer.id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.patch("/products/{product_id}", response_model=ProductResponse)
async def update_portal_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(require_verified_manufacturer),
):
    service = CatalogService(db)
    try:
        return await service.update_product(product_id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portal_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(require_verified_manufacturer),
):
    service = CatalogService(db)
    try:
        await service.delete_product(product_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/progression-rules", response_model=ProgressionRuleResponse, status_code=status.HTTP_201_CREATED)
async def add_portal_progression_rule(
    data: ProgressionRuleCreate,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(setup_portal_rls),
):
    service = CatalogService(db)
    try:
        return await service.add_progression_rule(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/progression-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_portal_progression_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    manufacturer = Depends(setup_portal_rls),
):
    service = CatalogService(db)
    try:
        await service.remove_progression_rule(rule_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
