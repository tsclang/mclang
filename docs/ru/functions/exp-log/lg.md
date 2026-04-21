# lg — десятичный логарифм

---

## Сигнатура

```mc
lg(x: num) → num
log10(x: num) → num   // синоним
\lg{x}                // LaTeX
```

---

## Пример

```mc
f(x) = lg(x)
```

```c
mc_num f(mc_num x) { return log10(x); }
```

---

## Применение

```mc
// Децибелы
db(power_ratio) = 10 * lg(power_ratio)
spl(p, p_ref)   = 20 * lg(p / p_ref)

// Порядок числа
magnitude(x) = floor(lg(abs(x)))
```

---

## Смотри aussi

- [ln](ln.md) · [log-base](log-base.md)
