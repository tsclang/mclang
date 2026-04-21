# mclang — Тестовые проекты

Реальные программы на mclang, которые компилируются в C и запускаются.
Каждый проект в `examples/<name>/` содержит:
- `<name>.mc` — исходник на mclang
- `<name>.c` / `<name>.h` — сгенерированный C-код (результат `mclang`)
- `main.c` — драйвер, который вызывает функции и печатает результаты
- `run.sh` — сборка и запуск одной командой

---

## Как запустить

### Всё сразу
```bash
cd examples
bash run_all.sh
```

### Один проект
```bash
cd examples/ballistics
bash run.sh
```

### Вручную
```bash
# 1. Скомпилировать .mc → .c + .h
node ../../dist/cli/index.js ballistics.mc

# 2. Собрать C-код с драйвером
gcc ballistics.c main.c -lm -o demo

# 3. Запустить
./demo
```

> **Требования:** Node.js 18+, gcc (MSYS2/MinGW на Windows)

---

## Проекты

### 1. `ballistics` — Баллистика снаряда

**Задача:** вычислить дальность, максимальную высоту, время полёта и траекторию снаряда.

**Формулы:**
```
range(v0, angle)         = v0² · sin(2·angle) / g
max_height(v0, angle)    = v0² · sin²(angle) / (2g)
time_of_flight(v0, angle)= 2·v0·sin(angle) / g
height_at(v0, angle, x)  = x·tan(angle) − g·x²/(2·v0²·cos²(angle))
```

**Фичи mclang:** типизированные параметры, `where`-guard, `\sin`/`\cos`/`\tan`, `^`, `\pi`

**Ожидаемый вывод:**
```
Projectile: v0=50.0 m/s, angle=45°
  Range:          254.84 m
  Max height:     63.71 m
  Time of flight: 7.21 s
  Height at x=50: 40.19 m
```

---

### 2. `statistics` — Описательная статистика

**Задача:** mean, std, z-score, нормализация массива данных.

**Формулы:**
```
mean(v)         = Σv[i] / n
std_dev(v)      = √(Σ(v[i] − mean(v))² / n)
z_score(x, v)   = (x − mean(v)) / std_dev(v)
cv(v)           = std_dev(v) / mean(v) · 100
normalize(x, v) = (x − min(v)) / (max(v) − min(v))
```

**Фичи mclang:** `num[]`-параметры, `\sum`, `\sqrt`, встроенные `min`/`max`/`mean`/`std`, `where`-guard

**Ожидаемый вывод:**
```
Data: [2, 4, 4, 4, 5, 5, 7, 9]
  Mean:    5.0000
  Std dev: 2.0000
  CV:      40.00%
```

---

### 3. `geometry` — 2D/3D геометрия

**Задача:** расстояние, угол, площадь треугольника; dot/cross product; срезы матрицы.

**Формулы:**
```
dist2d(x1,y1,x2,y2)  = √((x2−x1)² + (y2−y1)²)
angle2d(...)          = arccos(dot / (|v1|·|v2|))
triangle_area(...)    = |cross2d| / 2
dot3(v, w)            = dot(v, w)
cross3(v, w)          = cross(v, w)
matrix_col(m, j)      = m[:, j]
matrix_row(m, i)      = m[i, :]
```

**Фичи mclang:** 2D/3D vectors, `dot()`, `cross()`, `m[:, j]`, `m[i, :]`, `\arccos`, `num[][]`

**Ожидаемый вывод:**
```
2D geometry:
  dist (0,0)→(3,4):    5.0000
  angle (1,0)∠(0,1):   1.5708 rad = 90.0°
3D vectors:
  dot([1,2,3],[4,5,6]):  32.0
  cross: [-3.000, 6.000, -3.000]
Matrix col 1: [2.000, 5.000, 8.000]
```

---

### 4. `number_theory` — Теория чисел

**Задача:** НОД, НОК, делимость, принадлежность к множествам, рекурсия, цифровой корень.

**Формулы:**
```
gcd(a, b)        = if (b == 0) a else gcd(b, a mod b)
lcm(a, b)        = a * b / gcd(a, b)
is_even(n)       = n mod 2 == 0
is_integer(x)    = x ∈ ℤ
is_natural(x)    = x ∈ ℕ
triangular(n)    = n * (n + 1) / 2
digital_root(n)  = if (n == 0) 0 else 1 + (n − 1) mod 9
```

**Фичи mclang:** рекурсия, `mod`, `x ∈ ℕ`, `x ∈ ℤ`, `where`-guard, взаимная рекурсия

**Ожидаемый вывод:**
```
gcd(48, 18) = 6
lcm(4, 6) = 12
is_integer(3.0) = 1
is_natural(5.0) = 1
```

---

## Матрица покрытия фич

| Фича                        | ballistics | statistics | geometry | number_theory |
|-----------------------------|:----------:|:----------:|:--------:|:-------------:|
| Базовая арифметика          | ✓          | ✓          | ✓        | ✓             |
| `where` guard               | ✓          |            | ✓        | ✓             |
| `num[]` параметры           |            | ✓          | ✓        |               |
| `num[][]` параметры         |            |            | ✓        |               |
| `\sum` агрегатор            |            | ✓          |          |               |
| Тригонометрия               | ✓          |            | ✓        |               |
| `dot` / `cross`             |            |            | ✓        |               |
| `m[:, j]` / `m[i, :]`      |            |            | ✓        |               |
| Рекурсия                    |            |            |          | ✓             |
| `mod`                       |            |            |          | ✓             |
| `x ∈ ℕ` / `x ∈ ℤ`         |            |            |          | ✓             |
| `min`/`max`/`mean`/`std`   |            | ✓          |          |               |

---

## Добавить новый проект

1. Создать папку `examples/<name>/`
2. Написать `<name>.mc`
3. Скомпилировать: `node ../../dist/cli/index.js <name>.mc`
4. Написать `main.c` — вызвать функции, напечатать результаты
5. Написать `run.sh` (скопировать из соседнего проекта)
6. Добавить запись в этот файл
