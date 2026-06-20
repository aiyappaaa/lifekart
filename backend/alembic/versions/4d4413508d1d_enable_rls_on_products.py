"""enable_rls_on_products

Revision ID: 4d4413508d1d
Revises: 
Create Date: 2026-06-09 00:55:41.790967

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d4413508d1d'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Setup Row-Level Security (RLS) for the products table
    op.execute("ALTER TABLE products ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE products FORCE ROW LEVEL SECURITY;")
    op.execute("DROP POLICY IF EXISTS manufacturer_isolation ON products;")
    
    # Policy: If we are in the 'manufacturer' portal context, strictly enforce isolation.
    # Otherwise, allow public catalog viewing.
    op.execute("""
    CREATE POLICY manufacturer_isolation ON products
    USING (
      current_setting('app.portal_context', true) IS DISTINCT FROM 'manufacturer'
      OR manufacturer_id = NULLIF(current_setting('app.current_manufacturer_id', true), '')::uuid
    );
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS manufacturer_isolation ON products;")
    op.execute("ALTER TABLE products NO FORCE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE products DISABLE ROW LEVEL SECURITY;")
