# \frac{d}{dx}

---

## Синтаксис

```latex
\frac{d}{dx} expr
```

---

## Трансляция

Разностная схема с `h = 1e-7`:

```mc
d_sin = \frac{d}{dx} sin(x)   // ≈ cos(x)
```

```c
mc_num _h = 1e-7;
mc_num _result = (sin(x + _h) - sin(x)) / _h;
```

---

## Примеры

```mc
tangent_slope(f, x) = \frac{d}{dx} f(x)
newton_step(f, x) = x - f(x) / \frac{d}{dx} f(x)
```

---

## Смотри aussi

- [derivative](../../functions/calculus/derivative.md) · [\int](integral.md)
