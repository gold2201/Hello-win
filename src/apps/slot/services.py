import random
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, TypedDict

from django.db import transaction

from ..users.models import PlayerProfile
from .models import SlotSpin


class SymbolConfig(TypedDict):
    symbol: str
    weight: int
    multipliers: dict[int, Decimal]


SYMBOLS: list[SymbolConfig] = [
    {"symbol": "🍒", "weight": 30, "multipliers": {3: Decimal("2.0"), 4: Decimal("8.0")}},
    {"symbol": "🍋", "weight": 25, "multipliers": {3: Decimal("2.5"), 4: Decimal("10.0")}},
    {"symbol": "🔔", "weight": 20, "multipliers": {3: Decimal("3.0"), 4: Decimal("12.0")}},
    {"symbol": "💎", "weight": 15, "multipliers": {3: Decimal("5.0"), 4: Decimal("20.0")}},
    {"symbol": "7️⃣", "weight": 10, "multipliers": {3: Decimal("7.0"), 4: Decimal("30.0")}},
]

TWO_IN_ROW_MULTIPLIER = Decimal("0.5")
BET_OPTIONS = [1, 5, 10, 25, 50]


def generate_matrix() -> list[list[str]]:
    symbols: list[str] = [item["symbol"] for item in SYMBOLS]
    weights: list[int] = [item["weight"] for item in SYMBOLS]
    return [random.choices(symbols, weights=weights, k=4) for _ in range(4)]


def _get_multiplier(symbol: str, length: int) -> Decimal:
    if length == 2:
        return TWO_IN_ROW_MULTIPLIER
    for item in SYMBOLS:
        if item["symbol"] == symbol:
            return item["multipliers"].get(length, Decimal("0"))
    return Decimal("0")


def _find_runs(line: list[str]) -> list[tuple[str, int, int]]:
    runs: list[tuple[str, int, int]] = []
    if not line:
        return runs

    current_symbol: str = line[0]
    start_idx: int = 0
    current_length: int = 1

    for i in range(1, len(line)):
        if line[i] == current_symbol:
            current_length += 1
        else:
            if current_length >= 2:
                runs.append((current_symbol, current_length, start_idx))
            current_symbol = line[i]
            start_idx = i
            current_length = 1

    if current_length >= 2:
        runs.append((current_symbol, current_length, start_idx))

    return runs


def calculate_win(matrix: list[list[str]], bet: int) -> dict[str, Any]:
    combinations: list[dict[str, Any]] = []
    total_win_decimal = Decimal("0")
    total_multiplier = Decimal("0")

    # Горизонтали
    for row_idx, row in enumerate(matrix):
        runs = _find_runs(row)
        for symbol, length, start_idx in runs:
            multiplier = _get_multiplier(symbol, length)
            win_decimal = Decimal(bet) * multiplier
            combinations.append(
                {
                    "direction": "horizontal",
                    "index": row_idx,
                    "start_index": start_idx,
                    "symbol": symbol,
                    "length": length,
                    "multiplier": float(multiplier),
                    "win_amount": float(win_decimal),
                }
            )
            total_win_decimal += win_decimal
            total_multiplier += multiplier

    # Вертикали
    for col_idx in range(4):
        column = [matrix[row_idx][col_idx] for row_idx in range(4)]
        runs = _find_runs(column)
        for symbol, length, start_idx in runs:
            multiplier = _get_multiplier(symbol, length)
            win_decimal = Decimal(bet) * multiplier
            combinations.append(
                {
                    "direction": "vertical",
                    "index": col_idx,
                    "start_index": start_idx,
                    "symbol": symbol,
                    "length": length,
                    "multiplier": float(multiplier),
                    "win_amount": float(win_decimal),
                }
            )
            total_win_decimal += win_decimal
            total_multiplier += multiplier

    return {
        "combinations": combinations,
        "total_win": total_win_decimal,
        "total_multiplier": total_multiplier,
    }


@transaction.atomic
def process_spin(user, bet: int) -> dict[str, Any]:
    profile = PlayerProfile.objects.select_for_update().get(user=user)
    if profile.balance < bet:
        raise ValueError("Недостаточно монет для ставки")

    matrix = generate_matrix()
    result = calculate_win(matrix, bet)

    raw_total_win = result["total_win"]
    rounded_total_win = int(raw_total_win.quantize(Decimal("1"), rounding=ROUND_HALF_UP))

    if rounded_total_win > 0:
        actual_multiplier = (Decimal(rounded_total_win) / Decimal(bet)).quantize(Decimal("0.01"))
    else:
        actual_multiplier = Decimal("0.00")

    profile.balance = profile.balance - bet + rounded_total_win
    profile.total_spins += 1
    profile.save()

    SlotSpin.objects.create(
        user=user,
        bet=bet,
        win_amount=rounded_total_win,
    )

    return {
        "matrix": matrix,
        "win_amount": rounded_total_win,
        "total_win_multiplier": actual_multiplier,
        "balance": profile.balance,
        "total_spins": profile.total_spins,
        "combinations": result["combinations"],
    }
