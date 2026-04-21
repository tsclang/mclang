# \sqrt[n]{x}

---

## Синтаксис

```latex
\sqrt[n]{x}
```

---

## Трансляция

```mc
\sqrt[n]{x}   →   sqrt(n, x)   →   pow(x, 1.0/n)
```

---

## Примеры

```mc
cube_root(x) = \sqrt[3]{x}    // pow(x, 1/3)
nth_root(x, n) = \sqrt[n]{x}  // pow(x, 1/n)
geomean(a, b) = \sqrt[2]{a*b} // sqrt(a*b)
```

---

## Смотри aussi

- [\sqrt](sqrt.md) · [sqrt-n](../../functions/exp-log/sqrt-n.md)
