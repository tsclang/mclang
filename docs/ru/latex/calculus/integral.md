# \int{a}{b} expr dx

---

## Синтаксис

```latex
\int{a}{b} f(x) dx
```

---

## Трансляция

Метод Симпсона, 1000 шагов:

```mc
area = \int{0}{1} x^2 dx   // → 0.3333...
```

---

## Примеры

```mc
// Работа переменной силы
work(F_func, a, b) = \int{a}{b} F_func(x) dx

// Длина дуги
arc_len(a, b) = \int{a}{b} sqrt(1 + (\frac{d}{dx} f(x))^2) dx
```

---

## Смотри aussi

- [integral](../../functions/calculus/integral.md)
- [\frac{d}{dx}](derivative.md) · [\lim](limit.md)
