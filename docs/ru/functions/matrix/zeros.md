# zeros — нулевая матрица

---

## Сигнатура

```mc
zeros(rows: int, cols: int) → num[][]
```

---

## Пример

```mc
Z = zeros(3, 3)   // 3×3 нулевая матрица
```

```c
static inline mc_num* mc_zeros(mc_num* out, int r, int c) {
    for (int i = 0; i < r * c; i++) out[i] = 0.0;
    return out;
}
```

---

## Смотри aussi

- [ones](ones.md) · [identity](identity.md)
