from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import Budget, Category, Transaction


class CategorySerializer(serializers.ModelSerializer):
    color = serializers.RegexField(
        regex=r"^#[0-9A-Fa-f]{6}$",
        max_length=7,
        error_messages={"invalid": "Use a valid hex color like #2563eb."},
    )

    class Meta:
        model = Category
        fields = ("id", "name", "type", "color", "is_default", "created_at")
        read_only_fields = ("id", "is_default", "created_at")

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Category name cannot be blank.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context["request"]
        name = attrs.get("name", getattr(self.instance, "name", None))
        if name:
            exists = Category.objects.filter(user=request.user, name__iexact=name)
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            if exists.exists():
                raise serializers.ValidationError({"name": "You already have a category with this name."})
        return attrs


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))

    class Meta:
        model = Transaction
        fields = (
            "id",
            "type",
            "amount",
            "category",
            "category_name",
            "category_color",
            "note",
            "date",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "category_name", "category_color", "created_at", "updated_at")

    def validate_category(self, category):
        request = self.context["request"]
        if category.user != request.user:
            raise serializers.ValidationError("Invalid category.")
        return category

    def validate(self, attrs):
        tx_type = attrs.get("type", getattr(self.instance, "type", None))
        category = attrs.get("category", getattr(self.instance, "category", None))
        if category and category.type not in (tx_type, "both"):
            raise serializers.ValidationError({"category": "Category type does not match transaction type."})
        return attrs


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    usage_percent = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = (
            "id",
            "category",
            "category_name",
            "category_color",
            "amount",
            "month",
            "spent",
            "remaining",
            "usage_percent",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "spent", "remaining", "usage_percent", "status", "created_at", "updated_at")
        validators = [
            UniqueTogetherValidator(
                queryset=Budget.objects.all(),
                fields=("category", "month"),
                message="A budget already exists for this category and month.",
            )
        ]

    def validate_category(self, category):
        request = self.context["request"]
        if category.user != request.user:
            raise serializers.ValidationError("Invalid category.")
        if category.type == "income":
            raise serializers.ValidationError("Budgets are only for expense categories.")
        return category

    def validate_month(self, value):
        return date(value.year, value.month, 1)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context["request"]
        category = attrs.get("category", getattr(self.instance, "category", None))
        month = attrs.get("month", getattr(self.instance, "month", None))
        if category and month:
            exists = Budget.objects.filter(user=request.user, category=category, month=month)
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            if exists.exists():
                raise serializers.ValidationError({"month": "A budget already exists for this category and month."})
        return attrs

    def _spent(self, obj):
        if hasattr(obj, "_spent_cache"):
            return obj._spent_cache
        last_day = monthrange(obj.month.year, obj.month.month)[1]
        end = date(obj.month.year, obj.month.month, last_day)
        value = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            type="expense",
            date__gte=obj.month,
            date__lte=end,
        ).aggregate(total=Sum("amount"))["total"]
        obj._spent_cache = value or Decimal("0")
        return obj._spent_cache

    def get_spent(self, obj):
        return self._spent(obj)

    def get_remaining(self, obj):
        return obj.amount - self._spent(obj)

    def get_usage_percent(self, obj):
        if obj.amount == 0:
            return 0
        return round(float((self._spent(obj) / obj.amount) * 100), 1)

    def get_status(self, obj):
        usage = self.get_usage_percent(obj)
        if usage >= 100:
            return "exceeded"
        if usage >= 80:
            return "warning"
        return "healthy"
