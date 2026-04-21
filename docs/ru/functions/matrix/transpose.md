# transpose — транспонирование матрицы

---

## Сигнатура

```mc
transpose(A: num[][]) → num[][]
A^\top                           // LaTeX
```

---

## Пример

```mc
T(A: num[][]) = transpose(A)
```

```c
static inline void mc_transpose(const mc_num* A, mc_num* B, int rows, int cols) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++)
            B[j * rows + i] = A[i * cols + j];
}
```

---

## Применение

```mc
// A^T * A (матрица Грама)
gram(A: num[][]) = transpose(A) ⋅ A

// Транспонирование вектора-столбца в строку
row_vec(v: num[]) = transpose([[v]])
```

---

## Смотри aussi

- [det](det.md) · [inv](inv.md) · [matmul](matmul.md)
