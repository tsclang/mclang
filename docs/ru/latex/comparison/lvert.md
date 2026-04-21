# \lvert x \rvert — модуль

---

## Синтаксис

```latex
\lvert x \rvert
\lvert expr \rvert
```

---

## Трансляция

```mc
\lvert x \rvert   →   abs(x)   →   fabs(x)
```

---

## Примеры

```mc
dist(a, b) = \lvert a - b \rvert
norm_inf(v: num[]) = max(\lvert v[i] \rvert)   // ∞-норма
```

---

## Смотри aussi

- [\abs](../arithmetic/abs.md) · [abs](../../functions/rounding/abs.md)
