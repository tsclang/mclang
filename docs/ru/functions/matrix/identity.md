# I — единичная матрица

---

## Сигнатура

```mc
I(n: int) → num[][]
```

Создаёт единичную матрицу n×n.

---

## Пример

```mc
Id = I(3)   // 3×3 единичная матрица
```

```c
static inline mc_num* mc_identity(mc_num* out, int n) {
    for (int i = 0; i < n * n; i++) out[i] = 0.0;
    for (int i = 0; i < n; i++) out[i * n + i] = 1.0;
    return out;
}
```

---

## Применение

```mc
// Проверка обратной матрицы: A * inv(A) ≈ I(n)
check_inv(A: num[][]) = A ⋅ inv(A)

// Диагональная матрица
diag(d: num[]) =
    n = d.length
    M = zeros(n, n)
    // заполнить диагональ...
```

---

## Смотри aussi

- [zeros](zeros.md) · [ones](ones.md)
