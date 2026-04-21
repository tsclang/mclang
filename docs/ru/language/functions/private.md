# Приватные функции

Функции с именем, начинающимся на `_`, являются приватными: они компилируются в `.c`-файл, но **не попадают** в заголовочный `.h`-файл и недоступны извне.

---

## Синтаксис

```mc
_helper(x) = x * 2   // приватная

public_fn(x) = _helper(x) + 1   // публичная
```

---

## Что генерируется

```c
// math.h — только публичные функции
mc_num public_fn(mc_num x);

// math.c — все функции
static mc_num _helper(mc_num x) {
    return (x * 2.0);
}

mc_num public_fn(mc_num x) {
    return (_helper(x) + 1.0);
}
```

Приватные функции объявляются как `static` в `.c`-файле.

---

## Пример использования

```mc
// physics.mc

_kinetic_energy(m, v) = 0.5 * m * v^2
_potential_energy(m, h) = m * 9.81 * h

total_energy(m, v, h) =
    _kinetic_energy(m, v) + _potential_energy(m, h)
```

Снаружи виден только `total_energy`.

---

## Вспомогательные функции для рекурсии

```mc
_factorial_tail(n, acc) =
    if (n <= 1) acc
    else _factorial_tail(n - 1, acc * n)

factorial(n) = _factorial_tail(n, 1)
```

---

## mclang eval

Команда `mclang eval` тоже не показывает приватные функции:

```bash
mclang eval physics.mc
# → total_energy(m, v, h)
# _helper-функции не показываются
```

---

## Ошибки

### Вызов приватной функции из другого файла

Если `_helper` определена в `utils.mc`, а другой файл её импортирует — ошибка линковки на уровне Си. mclang не выдаёт ошибку на уровне компилятора (это может быть исправлено в v2).

---

## Смотри также

- [Объявление функций](declaration.md)
- [Импорты](../imports/basic.md)
