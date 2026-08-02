import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.community.models import CommunityGroup, CommunityMembership, CommunityOrder
from app.modules.community.schemas import CommunityGroupCreate
from app.modules.profiling.models import Household


class CommunityService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_group(self, user_id: uuid.UUID, data: CommunityGroupCreate) -> CommunityGroup:
        result = await self.db.execute(select(Household).where(Household.user_id == user_id))
        household = result.scalar_one_or_none()
        if not household:
            raise ValueError("Create your household first")

        if data.pincode:
            duplicate = await self.db.execute(
                select(CommunityGroup).where(
                    CommunityGroup.name == data.name,
                    CommunityGroup.pincode == data.pincode
                )
            )
            if duplicate.scalar_one_or_none():
                raise ValueError(f"A group named '{data.name}' already exists in this pincode.")

        group = CommunityGroup(
            name=data.name,
            locality=data.locality,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            admin_household_id=household.id,
            min_households_for_pooling=data.min_households_for_pooling,
            is_private=data.is_private,
        )
        self.db.add(group)
        await self.db.flush()

        membership = CommunityMembership(group_id=group.id, household_id=household.id)
        self.db.add(membership)
        await self.db.commit()
        return await self.get_group(group.id)

    async def get_groups(self, pincode: str | None = None) -> list[CommunityGroup]:
        query = select(CommunityGroup).options(selectinload(CommunityGroup.memberships)).where(
            CommunityGroup.status.in_(["active", "forming"]),
            CommunityGroup.is_private == False
        )
        if pincode:
            query = query.where(CommunityGroup.pincode == pincode)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_group(self, group_id: uuid.UUID) -> CommunityGroup:
        query = select(CommunityGroup).options(selectinload(CommunityGroup.memberships)).where(
            CommunityGroup.id == group_id
        )
        result = await self.db.execute(query)
        group = result.scalar_one_or_none()
        if not group:
            raise ValueError("Group not found")
        return group

    async def get_my_groups(self, user_id: uuid.UUID) -> list[CommunityGroup]:
        result = await self.db.execute(select(Household).where(Household.user_id == user_id))
        household = result.scalar_one_or_none()
        if not household:
            return []
            
        result = await self.db.execute(
            select(CommunityGroup).options(selectinload(CommunityGroup.memberships))
            .join(CommunityMembership, CommunityMembership.group_id == CommunityGroup.id)
            .where(CommunityMembership.household_id == household.id)
        )
        return list(result.scalars().all())

    async def get_community_config(self) -> dict:
        from app.core.settings_loader import load_setting
        return await load_setting(self.db, "community_discount_tiers")

    async def join_group(self, user_id: uuid.UUID, group_id: uuid.UUID) -> CommunityMembership:
        result = await self.db.execute(select(Household).where(Household.user_id == user_id))
        household = result.scalar_one_or_none()
        if not household:
            raise ValueError("Create your household first")

        result = await self.db.execute(
            select(CommunityGroup).where(CommunityGroup.id == group_id)
        )
        group = result.scalar_one_or_none()
        if not group:
            raise ValueError("Group not found")

        existing = await self.db.execute(
            select(CommunityMembership).where(
                CommunityMembership.group_id == group_id,
                CommunityMembership.household_id == household.id,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Already a member of this group")

        membership = CommunityMembership(group_id=group_id, household_id=household.id)
        self.db.add(membership)
        await self.db.flush()

        count_result = await self.db.execute(
            select(func.count(CommunityMembership.id)).where(
                CommunityMembership.group_id == group_id
            )
        )
        member_count = count_result.scalar_one()
        if member_count >= group.min_households_for_pooling and group.status == "forming":
            group.status = "active"

        await self.db.commit()
        await self.db.refresh(membership)
        return membership

    async def leave_group(self, user_id: uuid.UUID, group_id: uuid.UUID) -> None:
        result = await self.db.execute(select(Household).where(Household.user_id == user_id))
        household = result.scalar_one_or_none()
        if not household:
            raise ValueError("Household not found")

        existing = await self.db.execute(
            select(CommunityMembership).where(
                CommunityMembership.group_id == group_id,
                CommunityMembership.household_id == household.id,
            )
        )
        membership = existing.scalar_one_or_none()
        if not membership:
            raise ValueError("Not a member of this group")

        group_res = await self.db.execute(select(CommunityGroup).where(CommunityGroup.id == group_id))
        group = group_res.scalar_one_or_none()
        
        if group and group.admin_household_id == household.id:
            # Admin is leaving. Find the next oldest member to take over.
            other_members_res = await self.db.execute(
                select(CommunityMembership).where(
                    CommunityMembership.group_id == group_id,
                    CommunityMembership.household_id != household.id
                ).order_by(CommunityMembership.joined_at.asc())
            )
            next_admin_membership = other_members_res.scalars().first()
            
            if next_admin_membership:
                group.admin_household_id = next_admin_membership.household_id
            else:
                # No one else is in the group. Safely delete it.
                await self.db.delete(membership)
                await self.db.delete(group)
                await self.db.commit()
                return

        await self.db.delete(membership)
        
        # Check if we drop below threshold
        count_result = await self.db.execute(
            select(func.count(CommunityMembership.id)).where(CommunityMembership.group_id == group_id)
        )
        member_count = count_result.scalar_one()
        if group and member_count < group.min_households_for_pooling and group.status == "active":
            group.status = "forming"

        await self.db.commit()

    async def delete_group(self, user_id: uuid.UUID, group_id: uuid.UUID) -> None:
        result = await self.db.execute(select(Household).where(Household.user_id == user_id))
        household = result.scalar_one_or_none()
        if not household:
            raise ValueError("Household not found")

        group_res = await self.db.execute(select(CommunityGroup).where(CommunityGroup.id == group_id))
        group = group_res.scalar_one_or_none()
        if not group:
            raise ValueError("Group not found")

        if group.admin_household_id != household.id:
            raise ValueError("Only the group admin can delete the group")

        # Delete all memberships first
        await self.db.execute(
            CommunityMembership.__table__.delete().where(CommunityMembership.group_id == group_id)
        )
        # Delete group
        await self.db.delete(group)
        await self.db.commit()