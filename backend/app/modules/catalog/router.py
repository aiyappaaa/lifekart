import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.modules.users.dependencies import get_current_user, require_role
from app.modules.users.models import User, UserRole
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.catalog.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    ManufacturerCreate,
    ManufacturerResponse,
    ManufacturerUpdate,
    ManufacturerUpdateStatus,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ProgressionRuleCreate,
    ProgressionRuleResponse,
    SubstitutionCreate,
    SubstitutionResponse,
)
from app.modules.catalog.service import CatalogService

router = APIRouter(prefix="/catalog")


# ═══════════════════════════ CATEGORIES ═══════════════════════════

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.create_category(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    return await service.get_categories(skip=skip, limit=limit)


@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    category = await service.get_category_by_id_rich(category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.get("/categories/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    category = await service.get_category_by_slug_rich(slug)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.update_category(category_id, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        await service.delete_category(category_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ═══════════════════════════ MANUFACTURERS ═══════════════════════════




@router.get("/manufacturers", response_model=list[ManufacturerResponse])
async def list_manufacturers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    return await service.get_manufacturers(skip=skip, limit=limit)





@router.get("/manufacturers/{manufacturer_id}", response_model=ManufacturerResponse)
async def get_manufacturer(
    manufacturer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    try:
        return await service.get_manufacturer_by_id(manufacturer_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))





@router.post("/manufacturers/{manufacturer_id}/verify", response_model=ManufacturerResponse)
async def verify_manufacturer(
    manufacturer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.verify_manufacturer(manufacturer_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.patch("/manufacturers/{manufacturer_id}/status", response_model=ManufacturerResponse)
async def update_manufacturer_status(
    manufacturer_id: uuid.UUID,
    data: ManufacturerUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.update_manufacturer_status(manufacturer_id, data.is_verified)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# ═══════════════════════════ PRODUCTS ═══════════════════════════




@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    category_id: uuid.UUID | None = Query(None),
    manufacturer_id: uuid.UUID | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    return await service.get_products(
        category_id=category_id,
        manufacturer_id=manufacturer_id,
        skip=skip,
        limit=limit,
    )


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    try:
        return await service.get_product_by_id(product_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))





# ═══════════════════════════ SUBSTITUTIONS ═══════════════════════════



@router.post("/product-substitutes", response_model=SubstitutionResponse, status_code=status.HTTP_201_CREATED)
async def add_substitute(
    data: SubstitutionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.add_substitute(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/product-substitutes/{substitution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_substitute(
    substitution_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        await service.remove_substitute(substitution_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/products/{product_id}/substitutes", response_model=list[SubstitutionResponse])
async def get_substitutes(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    return await service.get_substitutes(product_id)





# ═══════════════════════════ PROGRESSION RULES ═══════════════════════════




@router.get("/categories/{category_id}/progression-rules", response_model=list[ProgressionRuleResponse])
async def get_progression_rules(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CatalogService(db)
    return await service.get_progression_rules(category_id)


@router.post("/progression-rules", response_model=ProgressionRuleResponse, status_code=status.HTTP_201_CREATED)
async def add_progression_rule(
    data: ProgressionRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        return await service.add_progression_rule(data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/progression-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_progression_rule(
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.SUPERADMIN)),
):
    service = CatalogService(db)
    try:
        await service.remove_progression_rule(rule_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

