# \arcsin, \arccos, \arctan

---

## Синтаксис

```latex
\arcsin{x}    \arccos{x}    \arctan{x}

// Русский синоним арктангенса
\arctg{x}
```

---

## Трансляция

| LaTeX | mclang | Си |
|-------|--------|----|
| `\arcsin{x}` | `arcsin(x)` | `asin(x)` |
| `\arccos{x}` | `arccos(x)` | `acos(x)` |
| `\arctan{x}`, `\arctg{x}` | `arctan(x)` | `atan(x)` |

---

## Примеры

```mc
f(x) = \arcsin{x}°     // арксинус в градусах
g(y, x) = \arctan{y/x} // угол по координатам (лучше arctan2)
```

---

## Смотри aussi

- [arcsin](../../functions/trig/arcsin.md) · [arctan](../../functions/trig/arctan.md)
