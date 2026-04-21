# A^{\top} — транспонирование

---

## Синтаксис

```latex
A^{\top}   // LaTeX-стиль
A^{T}      // краткая форма
transpose(A)  // вызов функции
```

---

## Трансляция

```mc
A^{\top}   →   transpose(A)   →   mc_transpose(A, B, rows, cols)
A^{T}      →   transpose(A)   →   mc_transpose(A, B, rows, cols)
```

---

## Примеры

```mc
gram(A: num[][]) = A^{\top} \cdot A
sym(A: num[][]) = (A + A^{\top}) / 2
```

---

## Смотри aussi

- [transpose](../../functions/matrix/transpose.md)
