# inv — обратная матрица

---

## Сигнатура

```mc
inv(A: num[][]) → num[][]
A^{-1}                     // LaTeX-форма
```

---

## Поддерживаемые размеры

- 2×2, 3×3 — точные формулы
- Больше → не реализовано в MVP

---

## Пример

```mc
A_inv(A: num[][]) = inv(A)
```

```c
// Для 3×3 через матрицу алгебраических дополнений
static inline void mc_inv3(const mc_num* m, mc_num* out) {
    mc_num d = mc_det3(m);
    if (fabs(d) < 1e-15) { for (int i=0;i<9;i++) out[i]=NAN; return; }
    // ... формулы
}
```

---

## Применение

```mc
// Решение системы Ax = b
solve_system(A: num[][], b: num[]) =
    inv(A) ⋅ b
```

---

## Ошибки

### Вырожденная матрица

При `det(A) ≈ 0` — все элементы `NAN`.

---

## Смотри aussi

- [det](det.md) · [matmul](matmul.md)
