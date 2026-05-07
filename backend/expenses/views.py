import csv
from calendar import monthrange
from datetime import date, datetime
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.http import HttpResponse
from rest_framework.exceptions import ValidationError
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Budget, Category, Transaction
from .serializers import BudgetSerializer, CategorySerializer, TransactionSerializer


DEFAULT_CATEGORIES = [
    ("Food", "expense", "#ef4444"),
    ("Transport", "expense", "#f97316"),
    ("Education", "expense", "#8b5cf6"),
    ("Gaming", "expense", "#ec4899"),
    ("Subscriptions", "expense", "#06b6d4"),
    ("Shopping", "expense", "#10b981"),
    ("Salary", "income", "#22c55e"),
    ("Freelance", "income", "#2563eb"),
]


def ensure_default_categories(user):
    for name, category_type, color in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(
            user=user,
            name=name,
            defaults={"type": category_type, "color": color, "is_default": True},
        )


def parse_month_filter(value):
    try:
        return datetime.strptime(value[:7], "%Y-%m").date().replace(day=1)
    except (TypeError, ValueError) as exc:
        raise ValidationError({"month": "Use YYYY-MM format."}) from exc


def parse_date_filter(value, field_name):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError) as exc:
        raise ValidationError({field_name: "Use YYYY-MM-DD format."}) from exc


def parse_id_filter(value, field_name):
    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError({field_name: "Use a numeric id."}) from exc


def decimal_to_float(value):
    return float(value or Decimal("0"))


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        ensure_default_categories(self.request.user)
        queryset = Category.objects.filter(user=self.request.user)
        category_type = self.request.query_params.get("type")
        if category_type in ("income", "expense", "both"):
            queryset = queryset.filter(type__in=[category_type, "both"])
        elif category_type:
            raise ValidationError({"type": "Use income, expense, or both."})
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["note", "category__name"]
    ordering_fields = ["date", "amount", "created_at"]

    def get_queryset(self):
        queryset = Transaction.objects.select_related("category").filter(user=self.request.user)
        category = self.request.query_params.get("category")
        tx_type = self.request.query_params.get("type")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        if category:
            queryset = queryset.filter(category_id=parse_id_filter(category, "category"))
        if tx_type and tx_type not in ("income", "expense"):
            raise ValidationError({"type": "Use income or expense."})
        if tx_type in ("income", "expense"):
            queryset = queryset.filter(type=tx_type)
        if start_date:
            queryset = queryset.filter(date__gte=parse_date_filter(start_date, "start_date"))
        if end_date:
            queryset = queryset.filter(date__lte=parse_date_filter(end_date, "end_date"))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="transactions.csv"'
        writer = csv.writer(response)
        writer.writerow(["Date", "Type", "Category", "Amount", "Note"])
        for tx in self.get_queryset():
            writer.writerow([tx.date, tx.type, tx.category.name, tx.amount, tx.note])
        return response

    @action(detail=False, methods=["get"], url_path="export-pdf")
    def export_pdf(self, request):
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
        except ImportError:
            return Response({"detail": "PDF export dependency is not installed."}, status=status.HTTP_501_NOT_IMPLEMENTED)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="transactions.pdf"'
        pdf = canvas.Canvas(response, pagesize=letter)
        _, height = letter
        y = height - 48
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(48, y, "Smart Expense Tracker - Transactions")
        y -= 32
        pdf.setFont("Helvetica", 10)
        for tx in self.get_queryset()[:80]:
            line = f"{tx.date} | {tx.type.title()} | {tx.category.name} | ${tx.amount} | {tx.note[:40]}"
            pdf.drawString(48, y, line)
            y -= 18
            if y < 48:
                pdf.showPage()
                pdf.setFont("Helvetica", 10)
                y = height - 48
        pdf.save()
        return response


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ["category__name"]
    ordering_fields = ["month", "amount", "created_at"]

    def get_queryset(self):
        queryset = Budget.objects.select_related("category").filter(user=self.request.user)
        month = self.request.query_params.get("month")
        category = self.request.query_params.get("category")
        if month:
            queryset = queryset.filter(month=parse_month_filter(month))
        if category:
            queryset = queryset.filter(category_id=parse_id_filter(category, "category"))
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def _sum(queryset, tx_type):
    return queryset.filter(type=tx_type).aggregate(total=Sum("amount"))["total"] or Decimal("0")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    today = date.today()
    start_month = date(today.year, today.month, 1)
    end_month = date(today.year, today.month, monthrange(today.year, today.month)[1])
    transactions = Transaction.objects.select_related("category").filter(user=request.user)
    month_transactions = transactions.filter(date__gte=start_month, date__lte=end_month)

    total_income = _sum(transactions, "income")
    total_expenses = _sum(transactions, "expense")
    monthly_income = _sum(month_transactions, "income")
    monthly_expenses = _sum(month_transactions, "expense")

    category_breakdown = (
        month_transactions.filter(type="expense")
        .values("category__name", "category__color")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )
    monthly_trends = (
        transactions.annotate(month=TruncMonth("date"))
        .values("month", "type")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )
    trends = {}
    for item in monthly_trends:
        label = item["month"].strftime("%b %Y")
        trends.setdefault(label, {"month": label, "income": 0, "expense": 0})
        trends[label][item["type"]] = float(item["total"])

    budgets = Budget.objects.select_related("category").filter(user=request.user, month=start_month)
    budget_data = BudgetSerializer(budgets, many=True, context={"request": request}).data

    return Response(
        {
            "totals": {
                "income": total_income,
                "expenses": total_expenses,
                "balance": total_income - total_expenses,
                "monthly_income": monthly_income,
                "monthly_expenses": monthly_expenses,
                "monthly_balance": monthly_income - monthly_expenses,
            },
            "recent_transactions": TransactionSerializer(transactions[:6], many=True, context={"request": request}).data,
            "category_breakdown": [
                {
                    "name": item["category__name"],
                    "color": item["category__color"],
                    "value": decimal_to_float(item["total"]),
                }
                for item in category_breakdown
            ],
            "monthly_trends": list(trends.values()),
            "budgets": budget_data,
        }
    )
