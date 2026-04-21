# \lim{x \to a}

---

## Синтаксис

```latex
\lim{x \to a} expr
```

---

## Трансляция

Вычисление в точке `a + 1e-9`:

```mc
L = \lim{x \to 0} sin(x) / x   // → 1.0
```

---

## Примеры

```mc
sinc(x) = \lim{t \to 0} sin(t * x) / (t * x)
deriv(f, x) = \lim{h \to 0} (f(x + h) - f(x)) / h
```

---

## Смотри aussi

- [limit](../../functions/calculus/limit.md) · [\int](integral.md)
