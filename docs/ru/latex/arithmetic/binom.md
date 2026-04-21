# \binom{n}{k}

---

## Синтаксис

```latex
\binom{n}{k}
```

---

## Трансляция

```mc
\binom{n}{k}   →   binom(n, k)   →   mc_binom((int)n, (int)k)
```

---

## Примеры

```mc
pascal(n, k) = \binom{n}{k}
binom_prob(n, k, p) = \binom{n}{k} * p^k * (1-p)^(n-k)
```

---

## Смотри aussi

- [binom](../../functions/combinatorics/binom.md)
