# det — определитель матрицы

---

## Сигнатура

```mc
det(A: num[][]) → num
\det(A)               // LaTeX
```

---

## Поддерживаемые размеры

- 1×1, 2×2, 3×3 — точные формулы
- Больше 3×3 → `NAN`

---

## Пример

```mc
d(A: num[][]) = det(A)
```

```c
static inline mc_num mc_det(const mc_num* m, int n) {
    if (n == 1) return m[0];
    if (n == 2) return m[0]*m[3] - m[1]*m[2];
    if (n == 3) return mc_det3(m);
    return NAN;
}
```

---

## Применение

```mc
// Проверка обратимости
is_invertible(A: num[][]) = det(A) != 0

// Площадь треугольника через определитель
triangle_area(x1, y1, x2, y2, x3, y3) =
    abs(det([[x1, y1, 1],
             [x2, y2, 1],
             [x3, y3, 1]])) / 2
```

---

## Ошибки

### Матрица размером > 3

```mc
A: num[][]   // 4×4
d = det(A)   // → nan
```

---

## Смотри aussi

- [inv](inv.md) · [transpose](transpose.md)
