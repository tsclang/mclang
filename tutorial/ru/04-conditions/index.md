# Урок 4 — Условия и ветвление

В mclang нет `if-else` в привычном смысле — только выражение, которое возвращает значение. Это соответствует математическому стилю кусочных функций.

---

## 4.1 Инлайн if-else

```mc
abs_val(x) = if (x >= 0) x else -x

sign(x) = if (x > 0) 1 else if (x < 0) -1 else 0
```

`if (условие) значение_да else значение_нет` — это выражение. Оба варианта должны быть числами. Вложенные `if` работают через `else if`.

Сгенерированный Си-код:

```c
mc_num abs_val(mc_num x) {
    return (x >= 0.0) ? x : -x;
}
```

---

## 4.2 Кусочные функции

Классическое определение:

$$f(x) = \begin{cases} x^2 & x < 0 \\ x & 0 \le x \le 1 \\ 1 & x > 1 \end{cases}$$

```mc
piecewise(x) =
    if (x < 0)      x^2
    else if (x <= 1) x
    else             1.0
```

Реальный пример — функция активации ReLU из нейросетей:

$$\text{ReLU}(x) = \max(0, x)$$

```mc
relu(x)        = if (x > 0) x else 0.0
leaky_relu(x)  = if (x > 0) x else 0.01 * x
elu(x, α = 1.0) = if (x > 0) x else α * (exp(x) - 1.0)
```

---

## 4.3 Clamp — ограничение диапазона

```mc
clamp(x, lo, hi) = if (x < lo) lo else if (x > hi) hi else x

// Нормализация в [0, 1]
saturate(x) = clamp(x, 0.0, 1.0)

// Ограничение яркости пикселя [0, 255]
clamp_byte(x) = clamp(x, 0.0, 255.0)
```

---

## 4.4 if без else — guard в теле функции

Guard без `else` возвращает `NaN` при нарушении условия:

```mc
safe_log(x) = if (x > 0) ln(x) else nan

safe_inv(x) = if (x != 0) 1.0 / x else nan
```

Это альтернатива guard-у в `where`. Используйте `where`-guard, когда условие относится к параметрам; используйте `if` в теле, когда ветвление — часть алгоритма.

---

## 4.5 Сравнение с физическим смыслом

Модель сопротивления среды. При малых скоростях — линейное (Стокс), при больших — квадратичное:

```mc
// Режим определяется числом Рейнольдса Re = ρ·v·d/η
reynolds(ρ, v, d, η) = ρ * v * d / η

// Сила лобового сопротивления
drag(ρ, v, d, η, A) =
    if (Re < 1.0)
        // Стоксово (ламинарное): F = 3πηdv
        3.0 * π * η * d * v
    else
        // Ньютоново (турбулентное): F = ½ρCdAv²
        0.5 * ρ * 0.47 * A * v^2
    where
        Re = reynolds(ρ, v, d, η)
```

---

## 4.6 Ступенчатые и сглаженные функции

Функция Хевисайда:

$$H(x) = \begin{cases} 0 & x < 0 \\ 1 & x \ge 0 \end{cases}$$

```mc
heaviside(x) = if (x >= 0) 1.0 else 0.0

// Прямоугольный импульс шириной w
rect_pulse(x, w) = if (|x| <= w/2.0) 1.0 else 0.0

// Сглаженный step (smoothstep из GLSL)
smoothstep(lo, hi, x) =
    if (x <= lo) 0.0
    else if (x >= hi) 1.0
    else t^2 * (3.0 - 2.0*t)
    where
        t = (x - lo) / (hi - lo)
```

`smoothstep` — стандартная функция в графических шейдерах, теперь доступна в вашем `.mc`.

---

## 4.7 Тепловая модель: три режима теплообмена

Закон Стефана-Больцмана, Ньютона и теплопроводности:

```mc
ε_steel = 0.8    // степень черноты стали

// Лучистый тепловой поток (Стефан-Больцман), Вт/м²
radiation(T) = ε_steel * σ_sb * T^4
    // σ_sb = 5.67e-8 — встроенная константа

// Конвективный: q = h·ΔT
convection(h, T_surface, T_fluid) =
    h * (T_surface - T_fluid)

// Кондуктивный: q = k·ΔT/L
conduction(k, T_hot, T_cold, L) =
    k * (T_hot - T_cold) / L

// Режим в зависимости от разности температур:
// ΔT > 100°C — радиация доминирует
// 10°C < ΔT ≤ 100°C — конвекция
// ΔT ≤ 10°C — теплопроводность
heat_transfer(T_hot, T_cold, h, k, L, A) =
    if (dT > 100.0)
        radiation(T_hot) * A
    else if (dT > 10.0)
        convection(h, T_hot, T_cold) * A
    else
        conduction(k, T_hot, T_cold, L) * A
    where
        dT = T_hot - T_cold
        dT > 0
```

---

## Задачи

**Задача 1.** Напишите `step(x, threshold)` — 0.0 если `x < threshold`, иначе 1.0. Затем `pulse(x, a, b)` — 1.0 если `a <= x <= b`, иначе 0.0. Реализуйте `pulse` через `step`.

**Задача 2.** Кусочно-линейная апроксимация `sin(x)` на `[0, π]`:

$$\hat{s}(x) \approx \begin{cases} x & 0 \le x \le \pi/2 \\ \pi - x & \pi/2 < x \le \pi \end{cases}$$

Нормируйте так, чтобы максимум был 1.0.

**Задача 3.** Модель диода (упрощённая):

$$I(V) = \begin{cases} 0 & V < 0 \\ I_s (e^{V/V_T} - 1) & V \ge 0 \end{cases}$$

где $V_T = 0.026$ В (тепловое напряжение при комнатной температуре), $I_s = 1\text{e-}12$ А. Напишите `diode_current(V)`.

**Задача 4 (★).** Функция `smootherstep` (улучшенная версия smoothstep Кена Перлина):

$$f(t) = 6t^5 - 15t^4 + 10t^3$$

Напишите `smootherstep(lo, hi, x)` аналогично примеру с `smoothstep`. Сравните поведение обеих функций при `lo=0, hi=1, x=0.5`.

---

## Решения

<details>
<summary>Показать решения</summary>

**Задача 1:**
```mc
step(x, threshold) = if (x >= threshold) 1.0 else 0.0

pulse(x, a, b) = step(x, a) - step(x, b)
```

**Задача 2:**
```mc
sin_approx(x) =
    if (x <= π/2.0) x / (π/2.0)
    else (π - x) / (π/2.0)
```

**Задача 3:**
```mc
V_T = 0.026
I_s = 1e-12

diode_current(V) =
    if (V < 0) 0.0
    else I_s * (exp(V / V_T) - 1.0)
```

**Задача 4:**
```mc
smootherstep(lo, hi, x) =
    if (x <= lo) 0.0
    else if (x >= hi) 1.0
    else 6.0*t^5 - 15.0*t^4 + 10.0*t^3
    where
        t = (x - lo) / (hi - lo)
```

При `x=0.5`: `smoothstep → 0.5`, `smootherstep → 0.5` (совпадают в середине). Разница на краях: smootherstep имеет нулевые первую И вторую производные на краях — плавнее входит и выходит.

</details>

---

[← Урок 3: LaTeX](../03-latex/index.md) · [Урок 5: Векторы →](../05-vectors/index.md)
