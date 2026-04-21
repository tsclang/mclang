# A^{-1}

---

## Синтаксис

```latex
A^{-1}
```

---

## Трансляция

```mc
A^{-1}   →   inv(A)   →   mc_inv(A, out, n)
```

---

## Примеры

```mc
inv_mat(A: num[][]) = A^{-1}
solve(A: num[][], b: num[]) = A^{-1} \cdot b
```

---

## Смотри aussi

- [inv](../../functions/matrix/inv.md) · [det](../../functions/matrix/det.md)
