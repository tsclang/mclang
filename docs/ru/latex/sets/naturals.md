# \mathbb{N} — натуральные числа

---

## Синтаксис

```latex
x \in \mathbb{N}
x \in ℕ            // Unicode-синоним
x in \mathbb{N}    // словесный синоним
```

---

## Трансляция

```c
(x >= 0.0) && (fmod(x, 1.0) == 0.0)
```

---

## Пример

```mc
is_natural(x) = x ∈ ℕ

factorial(n) =
    n!
    where n ∈ ℕ   // guard: только натуральные
```

---

## Смотри aussi

- [\mathbb{Z}](integers.md) · [\mathbb{R}](reals.md) · [\in](in.md)
