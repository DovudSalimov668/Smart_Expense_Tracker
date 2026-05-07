from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from expenses.models import Budget, Category, Transaction
from expenses.views import ensure_default_categories


class Command(BaseCommand):
    help = "Create demo user, categories, transactions, and budgets."

    def handle(self, *args, **options):
        User = get_user_model()
        user, created = User.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@example.com"},
        )
        if created:
            user.set_password("DemoPass123!")
            user.save()
        ensure_default_categories(user)

        categories = {category.name: category for category in Category.objects.filter(user=user)}
        today = date.today()
        current_month = date(today.year, today.month, 1)
        samples = [
            ("income", "Salary", Decimal("4200"), "Monthly salary", today.replace(day=1)),
            ("income", "Freelance", Decimal("850"), "Landing page project", today - timedelta(days=8)),
            ("expense", "Food", Decimal("84.35"), "Groceries", today - timedelta(days=1)),
            ("expense", "Transport", Decimal("32.50"), "Metro card", today - timedelta(days=3)),
            ("expense", "Subscriptions", Decimal("19.99"), "Design tools", today - timedelta(days=5)),
            ("expense", "Education", Decimal("120"), "Course subscription", today - timedelta(days=10)),
            ("expense", "Shopping", Decimal("210.45"), "Work desk accessories", today - timedelta(days=14)),
            ("expense", "Gaming", Decimal("59.99"), "New release", today - timedelta(days=18)),
        ]
        for tx_type, category_name, amount, note, tx_date in samples:
            Transaction.objects.get_or_create(
                user=user,
                category=categories[category_name],
                type=tx_type,
                amount=amount,
                note=note,
                date=tx_date,
            )

        budgets = [("Food", "500"), ("Transport", "180"), ("Subscriptions", "90"), ("Shopping", "350")]
        for category_name, amount in budgets:
            Budget.objects.update_or_create(
                user=user,
                category=categories[category_name],
                month=current_month,
                defaults={"amount": Decimal(amount)},
            )

        self.stdout.write(self.style.SUCCESS("Demo data ready: demo / DemoPass123!"))
