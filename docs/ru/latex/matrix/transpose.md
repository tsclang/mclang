# A^\top / A^{\top}

---

## Синтаксис

```latex
A^\top
A^{\top}
A^T        // неформальная запись
```

---

## Трансляция

```mc
A^\top   →   transpose(A)   →   mc_transpose(A, B, rows, cols)
```

---

## Примеры

```mc
gram(A: num[][]) = A^\top \cdot A
sym(A: num[][]) = (A + A^\top) / 2
```

---

## Смотри aussi

- [transpose](../../functions/matrix/transpose.md)
