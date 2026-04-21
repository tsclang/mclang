# Оператор != (неравенство)

---

## Синтаксис

```mc
a != b
a <> b     // синоним
a \neq b   // LaTeX
a \ne b    // LaTeX краткая форма
a ≠ b      // Unicode
```

---

## Пример

```mc
not_zero(x) = x != 0
```

```c
mc_num not_zero(mc_num x) { return (x != 0.0) ? 1.0 : 0.0; }
```

---

## В guard-условиях

```mc
safe_div(a, b) =
    a / b
    where
        b != 0   // guard: b не должен быть нулём
```

---

## nan != nan

```mc
// Два nan не равны (IEEE 754)
f(x) = x != nan   // всегда 1 (true) — даже если x = nan
```

Это стандартное поведение IEEE. Для корректной проверки:

```mc
check(x) = is_nan(x)
```

---

## Смотри aussi

- [Равенство](eq.md)
- [Guards](../../language/where/guards.md)
