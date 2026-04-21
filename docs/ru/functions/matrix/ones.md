# ones — матрица из единиц

---

## Сигнатура

```mc
ones(rows: int, cols: int) → num[][]
```

---

## Пример

```mc
O = ones(2, 4)   // 2×4 матрица, все элементы = 1
```

```c
static inline mc_num* mc_ones(mc_num* out, int r, int c) {
    for (int i = 0; i < r * c; i++) out[i] = 1.0;
    return out;
}
```

---

## Применение

```mc
// Прибавить к матрице константу
shift(A: num[][], c) = A + c * ones(A.rows, A.cols)
```

---

## Смотри aussi

- [zeros](zeros.md) · [identity](identity.md)
