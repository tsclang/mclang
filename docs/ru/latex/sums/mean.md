# \bar{v} — среднее по массиву

```latex
\bar{v}
```

Транслируется в вызов `mean(v)`.

## Синтаксис

| Форма | Трансляция |
|-------|-----------|
| `\bar{v}` | `mean(v)` |
| `mean(v)` | `mean(v)` |

## Трансляция

```mc
\bar{v}
```

```c
mc_mean(v, v_len)
```

## Пример

```mc
normalize(v: num[]) = v / \bar{v}
```

## Смотри также

- [std: \sigma](std.md)
- [\sum по массиву](sum-array.md)
- [functions: mean](../../functions/stats/mean.md)
