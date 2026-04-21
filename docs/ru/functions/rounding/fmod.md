# fmod — остаток с плавающей точкой

---

## Сигнатура

```mc
fmod(x: num, y: num) → num
```

---

## Эквивалент оператора

`fmod(x, y)` = `x % y` = `x mod y` — функциональная форма оператора остатка.

---

## Пример

```mc
f(x, y) = fmod(x, y)
```

```c
mc_num f(mc_num x, mc_num y) { return fmod(x, y); }
```

---

## Смотри aussi

- [Оператор %](../../operators/arithmetic/mod.md)
