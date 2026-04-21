# \sin, \cos, \tan, \cot

---

## Синтаксис

```latex
\sin{x}    \cos{x}    \tan{x}    \cot{x}
\sin(x)    \cos(x)    \tan(x)    \cot(x)
```

---

## Трансляция

| LaTeX | mclang | Си |
|-------|--------|----|
| `\sin{x}` | `sin(x)` | `sin(x)` |
| `\cos{x}` | `cos(x)` | `cos(x)` |
| `\tan{x}` | `tan(x)` | `tan(x)` |
| `\cot{x}` | `cot(x)` | `1.0/tan(x)` |

---

## Примеры

```mc
f(θ) = \sin{θ}^2 + \cos{θ}^2   // → 1 (тождество)
g(x) = \tan{x} / \cos{x}
```

---

## Смотри aussi

- [sin](../../functions/trig/sin.md) · [arcsin/arccos/arctan](arcsin.md)
