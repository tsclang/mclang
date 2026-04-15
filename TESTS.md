# MClang — Корпус тестов

## Формат записи

```
### T-XXX: Название
**Вход:**  mclang-код
**Выход:** ожидаемый Си-код или сообщение об ошибке
```

## Формат сообщений об ошибках

```
Error [EXXX]: <краткое описание>
  --> file.mc:<line>:<col>
   |
 N | <строка с ошибкой>
   |         ^^^ <указатель на место>
   |
  = Hint: <как исправить>
```

---

## 1. Лексер

### T-001: Целое число
```
f() = 42
```
```c
mc_num f() { return 42; }
```

### T-002: Дробное число
```
f() = 3.14
```
```c
mc_num f() { return 3.14; }
```

### T-003: Научная нотация
```
f() = 1.5e-10
```
```c
mc_num f() { return 1.5e-10; }
```

### T-004: Unicode-идентификатор
```
α = 0.5
f(β) = α * β
```
```c
static const mc_num __uni_alpha = 0.5;
mc_num f(mc_num __uni_beta) { return __uni_alpha * __uni_beta; }
```

### T-005: Встроенная константа π
```
f(r) = π * r^2
```
```c
mc_num f(mc_num r) { return 3.14159265358979 * pow(r, 2); }
```

### T-006: LaTeX-команда как идентификатор `\alpha`
```
f(\alpha) = \alpha + 1
```
```c
mc_num f(mc_num __uni_alpha) { return __uni_alpha + 1; }
```

### T-007: Символ градуса
```
f() = 90°
```
```c
mc_num f() { return 90 * (3.14159265358979 / 180); }
```

### T-008: Постфиксный факториал
```
f(n: int) = n!
```
```c
mc_num f(int n) {
    mc_num _acc = 1;
    for (int _i = 1; _i <= n; _i++) _acc *= _i;
    return _acc;
}
```

### T-009: Комментарий игнорируется
```
// это комментарий
f(x) = x + 1 // и этот тоже
```
```c
mc_num f(mc_num x) { return x + 1; }
```

### T-010: Лексер — `|x|` vs `||`
```
f(x, y) = |x| || |y|
g(x, y) = ||x| - |y||
```
```c
mc_num f(mc_num x, mc_num y) { return fabs(x) || fabs(y); }
mc_num g(mc_num x, mc_num y) { return fabs(fabs(x) - fabs(y)); }
```

---

## 2. Функции и константы

### T-020: Простая функция
```
f(x) = x + 1
```
```c
mc_num f(mc_num x) { return x + 1; }
```

### T-021: Несколько параметров
```
add(x, y) = x + y
```
```c
mc_num add(mc_num x, mc_num y) { return x + y; }
```

### T-022: Глобальная константа
```
G = 6.67430e-11
force(m1, m2, r) = G * m1 * m2 / r^2
```
```c
static const mc_num G = 6.67430e-11;
mc_num force(mc_num m1, mc_num m2, mc_num r) {
    return G * m1 * m2 / pow(r, 2);
}
```

### T-023: Параметр по умолчанию
```
circle_x(r, t, cx = 0) = cx + r * cos(t)
```
```c
mc_num circle_x(mc_num r, mc_num t, mc_num cx) {
    return cx + r * cos(t);
}
// В .h: mc_num circle_x(mc_num r, mc_num t, mc_num cx /* = 0 */);
```

### T-024: Приватная функция не попадает в .h
```
_helper(x) = x * 2
pub(x) = _helper(x) + 1
```
```c
static mc_num _helper(mc_num x) { return x * 2; }
mc_num pub(mc_num x) { return _helper(x) + 1; }
// В .h: только pub()
```

### T-025: Переопределение встроенной константы на уровне модуля
```
π = 3.14
f(r) = π * r^2
```
```c
// Warning: π redefined at module level (was 3.14159..., now 3.14)
static const mc_num __uni_pi = 3.14;
mc_num f(mc_num r) { return __uni_pi * pow(r, 2); }
```

### T-026: Многострочная функция
```
energy(m, v, h) =
    E_kin + E_pot
    where
        E_kin = \frac{m * v^2}{2}
        E_pot = m * 9.81 * h
```
```c
mc_num energy(mc_num m, mc_num v, mc_num h) {
    mc_num E_kin = (m * pow(v, 2)) / 2.0;
    mc_num E_pot = m * 9.81 * h;
    return E_kin + E_pot;
}
```

---

## 3. Математика и LaTeX

### T-030: Дробь `\frac`
```
f(a, b) = \frac{a + 1}{b - 1}
```
```c
mc_num f(mc_num a, mc_num b) { return ((a + 1) / (b - 1)); }
```

### T-031: Квадратный корень
```
f(x) = \sqrt{x^2 + 1}
```
```c
mc_num f(mc_num x) { return sqrt(pow(x, 2) + 1); }
```

### T-032: Корень n-й степени
```
f(x) = \sqrt[3]{x}
```
```c
mc_num f(mc_num x) { return pow(x, 1.0/3.0); }
```

### T-033: Неявное умножение
```
f(x) = 2x^2 + 3x + 1
g(r) = 2πr
```
```c
mc_num f(mc_num x) { return 2 * pow(x, 2) + 3 * x + 1; }
mc_num g(mc_num r) { return 2 * 3.14159265358979 * r; }
```

### T-034: Тригонометрия — все варианты записи
```
f(x) = sin(x) + \cos{x} + tg(x) + ctg(x)
```
```c
mc_num f(mc_num x) {
    return sin(x) + cos(x) + tan(x) + (1.0 / tan(x));
}
```

### T-035: Гиперболические функции (русская традиция)
```
f(x) = sh(x) + ch(x) + th(x) + cth(x)
```
```c
mc_num f(mc_num x) {
    return sinh(x) + cosh(x) + tanh(x) + (1.0 / tanh(x));
}
```

### T-036: Логарифмы
```
f(x, a) = ln(x) + log10(x) + log{a}{x}
```
```c
mc_num f(mc_num x, mc_num a) {
    return log(x) + log10(x) + (log(x) / log(a));
}
```

### T-037: Гауссова функция (сложный LaTeX)
```
gauss(x, μ, σ) = \frac{1}{\sqrt{2π * σ^2}} * exp(-\frac{(x - μ)^2}{2 * σ^2})
```
```c
mc_num gauss(mc_num x, mc_num __uni_mu, mc_num __uni_sigma) {
    return (1.0 / sqrt(2 * 3.14159265358979 * pow(__uni_sigma, 2)))
         * exp(-(pow(x - __uni_mu, 2) / (2 * pow(__uni_sigma, 2))));
}
```

### T-038: Модуль — вложенный
```
f(x, y) = |x - |y||
```
```c
mc_num f(mc_num x, mc_num y) { return fabs(x - fabs(y)); }
```

### T-039: Цепочка сравнений
```
in_range(x) = 0 < x < 100
```
```c
mc_num in_range(mc_num x) { return (0 < x && x < 100) ? 1.0 : 0.0; }
```

### T-040: Символы `≤`, `≥`, `≠`
```
check(x) = x ≥ 0 and x ≤ 1
```
```c
mc_num check(mc_num x) { return (x >= 0 && x <= 1) ? 1.0 : 0.0; }
```

### T-041: `\lfloor`, `\lceil`
```
f(x) = \lfloor x \rfloor + \lceil x \rceil
```
```c
mc_num f(mc_num x) { return floor(x) + ceil(x); }
```

### T-042: Принадлежность к множеству
```
is_nat(x) = x ∈ ℕ
is_range(x) = x ∈ [0, 1]
is_open(x) = x ∈ (0, 1)
```
```c
mc_num is_nat(mc_num x)   { return (x > 0 && floor(x) == x) ? 1.0 : 0.0; }
mc_num is_range(mc_num x) { return (x >= 0 && x <= 1) ? 1.0 : 0.0; }
mc_num is_open(mc_num x)  { return (x > 0 && x < 1) ? 1.0 : 0.0; }
```

### T-043: Constant folding
```
f(x) = 2 * π * x
```
```c
mc_num f(mc_num x) { return 6.28318530717959 * x; }
```

### T-044: `sgn`, `\gcd`, `n!`, `\binom`
```
a(x) = sgn(x)
b(n: int) = n!
c(n: int, k: int) = \binom{n}{k}
d(a: int, b: int) = \gcd(a, b)
```
```c
mc_num a(mc_num x) { return (x > 0) - (x < 0); }
mc_num b(int n) {
    mc_num _acc = 1;
    for (int _i = 1; _i <= n; _i++) _acc *= _i;
    return _acc;
}
mc_num c(int n, int k) {
    // b(n) / (b(k) * b(n-k))
}
mc_num d(int a, int b) {
    while (b != 0) { int _t = b; b = a % b; a = _t; }
    return a;
}
```

### T-045: `\pm` — множественный возврат
```
roots(a, b, c) = \pm \sqrt{b^2 - 4*a*c} / (2*a)
```
```c
mc_num* roots(mc_num a, mc_num b, mc_num c) {
    static mc_num _result[2];
    mc_num _d = sqrt(pow(b, 2) - 4 * a * c);
    _result[0] = (+_d) / (2 * a);
    _result[1] = (-_d) / (2 * a);
    return _result;
}
```

### T-046: `\sigma{v}` как функция vs `σ` как переменная
```
a(v: num[]) = \sigma{v}
b(σ) = σ + 1
```
```c
mc_num a(mc_num* v, int v_len) { /* std(v) */ }
mc_num b(mc_num __uni_sigma) { return __uni_sigma + 1; }
```

---

## 4. Управляющие конструкции

### T-050: Инлайн `if/else`
```
abs_val(x) = if (x < 0) -x else x
```
```c
mc_num abs_val(mc_num x) { return (x < 0) ? -x : x; }
```

### T-051: Блочный `if/else`
```
step(x) =
    if x < 0
        -1
    else if x == 0
        0
    else
        1
```
```c
mc_num step(mc_num x) {
    if (x < 0)  return -1;
    if (x == 0) return 0;
    return 1;
}
```

### T-052: Guard clause без `else`
```
sgn(x) =
    if (x > 0) 1
    if (x < 0) -1
    0
```
```c
mc_num sgn(mc_num x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
}
```

### T-053: `\begin{cases}`
```
f(x) = \begin{cases}
    x^2      & x < 0 \\
    0        & x == 0 \\
    \sqrt{x}
\end{cases}
```
```c
mc_num f(mc_num x) {
    if (x < 0)  return pow(x, 2);
    if (x == 0) return 0;
    return sqrt(x);
}
```

### T-054: `for..in` диапазон
```
sum_sq(n: int) =
    res = 0
    for i in 1..n
        res = res + i^2
    res
```
```c
mc_num sum_sq(int n) {
    mc_num res = 0;
    for (int i = 1; i <= n; i++) res = res + pow(i, 2);
    return res;
}
```

### T-055: `for..in` с шагом
```
sum_even(n: int) =
    res = 0
    for i in 0..n step 2
        res = res + i
    res
```
```c
mc_num sum_even(int n) {
    mc_num res = 0;
    for (int i = 0; i <= n; i += 2) res = res + i;
    return res;
}
```

### T-056: `while`
```
sqrt_newton(val) =
    x = val / 2
    while |x^2 - val| > 1e-9
        x = (x + val / x) / 2
    x
```
```c
mc_num sqrt_newton(mc_num val) {
    mc_num x = val / 2;
    while (fabs(pow(x, 2) - val) > 1e-9)
        x = (x + val / x) / 2;
    return x;
}
```

### T-057: `∑` по диапазону
```
s(n: int) = \sum_{i=1}^{n} i^2
```
```c
mc_num s(int n) {
    mc_num _acc = 0;
    for (int i = 1; i <= n; i++) _acc += pow(i, 2);
    return _acc;
}
```

### T-058: `∑` по массиву
```
sum_sq_arr(v: num[]) = \sum_{x \in v} x^2
```
```c
mc_num sum_sq_arr(mc_num* v, int v_len) {
    mc_num _acc = 0;
    for (int _i = 0; _i < v_len; _i++) {
        mc_num x = v[_i];
        _acc += pow(x, 2);
    }
    return _acc;
}
```

### T-059: Агрегаторы массива
```
stats(v: num[]) = mean(v) + std(v) + min(v) + max(v)
```
```c
mc_num stats(mc_num* v, int v_len) {
    return mc_mean(v, v_len)
         + mc_std(v, v_len)
         + mc_min(v, v_len)
         + mc_max(v, v_len);
}
```

---

## 5. Блок `where`

### T-060: Определения с топосортом (обратный порядок)
```
f(m, x) =
    E
    where
        E = k * x^2
        k = m * 9.81
```
```c
mc_num f(mc_num m, mc_num x) {
    mc_num k = m * 9.81;   // сначала k (нужна для E)
    mc_num E = k * pow(x, 2);
    return E;
}
```

### T-061: Guard в `where`
```
force(m1, m2, r) = G * m1 * m2 / r^2
    where
        m1 > 0
        m2 > 0
        r > 0
```
```c
mc_num force(mc_num m1, mc_num m2, mc_num r) {
    if (!(m1 > 0)) return NAN;
    if (!(m2 > 0)) return NAN;
    if (!(r > 0))  return NAN;
    return G * m1 * m2 / pow(r, 2);
}
```

### T-062: Guard смешан с определениями
```
f(m, x) = E + offset
    where
        m > 0
        E = k * x^2
        k = m * 9.81
        E > 0
```
```c
mc_num f(mc_num m, mc_num x) {
    if (!(m > 0)) return NAN;
    mc_num k = m * 9.81;
    mc_num E = k * pow(x, 2);
    if (!(E > 0)) return NAN;
    return E + offset;
}
```

### T-063: Локальное переопределение константы (Warning)
```
f(x) = x * π
    where
        π = 3.14
```
```
Warning [W001]: π is a built-in constant (3.14159...) and is being redefined in where block
  --> file.mc:3:9
   |
 3 |         π = 3.14
   |         ^ redefinition here
   |
  = Note: This affects only this function.
          Use a different name to suppress this warning.
```
```c
mc_num f(mc_num x) {
    mc_num __uni_pi_local = 3.14;
    return x * __uni_pi_local;
}
```

---

## 6. Массивы и матрицы

### T-070: Передача массива — неявный `_len`
```
total(v: num[]) = \sum_{x \in v} x
```
```c
mc_num total(mc_num* v, int v_len) {
    mc_num _acc = 0;
    for (int _i = 0; _i < v_len; _i++) _acc += v[_i];
    return _acc;
}
```

### T-071: Статический массив — нет `_len`
```
norm3(v: num[3]) = \sqrt{v[0]^2 + v[1]^2 + v[2]^2}
```
```c
mc_num norm3(mc_num v[3]) {
    return sqrt(pow(v[0], 2) + pow(v[1], 2) + pow(v[2], 2));
}
```

### T-072: Матрица — `_rows` и `_cols`
```
trace(m: num[][]) =
    \sum_{i=0}^{m.rows - 1} m[i][i]
```
```c
mc_num trace(mc_num* m, int m_rows, int m_cols) {
    mc_num _acc = 0;
    for (int i = 0; i <= m_rows - 1; i++)
        _acc += m[i * m_cols + i];
    return _acc;
}
```

### T-073: Guard на совпадение длин массивов
```
dot(a: num[], b: num[]) = \sum_{i=0}^{a.length - 1} a[i] * b[i]
```
```c
mc_num dot(mc_num* a, int a_len, mc_num* b, int b_len) {
    if (a_len != b_len) return NAN;
    mc_num _acc = 0;
    for (int i = 0; i <= a_len - 1; i++) _acc += a[i] * b[i];
    return _acc;
}
```

---

## 7. Численные методы

### T-080: Интеграл
```
area = \int{0}{π} sin(x) dx
```
```c
// Ожидаемый результат вызова: ~2.0
mc_num area = mc_integrate(/* sin lambda */, 0, 3.14159265358979);
```

### T-081: Производная
```
slope(x) = \frac{d}{dx} x^2
```
```c
// В точке x=3: ~6.0
mc_num slope(mc_num x) {
    const mc_num _h = 1e-7;
    return (pow(x + _h, 2) - pow(x, 2)) / _h;
}
```

### T-082: Предел
```
L = \lim{x \to 0} \frac{sin(x)}{x}
```
```c
// Ожидаемый результат: ~1.0
mc_num _lim_x = 0.0 + 1e-9;
mc_num L = sin(_lim_x) / _lim_x;
```

### T-083: `solve`
```
root = solve(x, 0, 10) { x^2 - 2 == 0 }
```
```c
// Ожидаемый результат: ~1.41421
mc_num root = mc_solve(/* lambda x^2-2 */, 0, 10, 1e-9);
```

---

## 8. Ошибки компилятора

### E-001: Переназначение параметра
```
f(x) =
    x = x + 1
    x
```
```
Error [E001]: Cannot reassign parameter 'x'
  --> file.mc:2:5
   |
 1 | f(x) =
 2 |     x = x + 1
   |     ^ parameter 'x' is immutable
   |
  = Hint: Create a local variable instead:
          y = x + 1
          y
```

### E-002: Переназначение глобальной константы внутри функции
```
G = 6.67e-11
f(x) =
    G = 1
    G * x
```
```
Error [E002]: Cannot reassign constant 'G'
  --> file.mc:3:5
   |
 3 |     G = 1
   |     ^ 'G' is defined as a global constant at line 1
   |
  = Hint: Use a local variable with a different name:
          G_local = 1
```

### E-003: Использование неинициализированной переменной
```
f(x) =
    y = z + 1
    y
```
```
Error [E003]: Variable 'z' used before initialization
  --> file.mc:2:9
   |
 2 |     y = z + 1
   |         ^ 'z' is not defined
   |
  = Hint: Did you mean a parameter? Available: x
          Or declare it: z = <expression>
```

### E-004: Циклическая зависимость в `where`
```
f(x) =
    a + b
    where
        a = b + 1
        b = a + 1
```
```
Error [E004]: Circular dependency in where block: a → b → a
  --> file.mc:4:9
   |
 4 |         a = b + 1
   |             ^ 'b' depends on 'a'
 5 |         b = a + 1
   |             ^ 'a' depends on 'b'
   |
  = Hint: Circular definitions cannot be resolved.
          Break the cycle by using a parameter or external value.
```

### E-005: `.length` для матрицы
```
f(m: num[][]) = m.length
```
```
Error [E005]: '.length' is not valid for matrix type 'num[][]'
  --> file.mc:1:17
   |
 1 | f(m: num[][]) = m.length
   |                 ^^^^^^^^ matrices have no .length
   |
  = Hint: Use '.rows' or '.cols' instead:
          m.rows  — number of rows
          m.cols  — number of columns
```

### E-006: Несовместимые единицы измерения
```
gravity(m: kg, r: m) = m + r
```
```
Error [E006]: Incompatible units: cannot add 'kg' and 'm'
  --> file.mc:1:25
   |
 1 | gravity(m: kg, r: m) = m + r
   |                          ^ cannot add kg + m
   |
  = Hint: Unit mismatch. Ensure both operands have the same unit.
          If intentional, cast explicitly: num(m) + num(r)
```

### E-007: Неизвестная LaTeX-команда
```
f(x) = \unknown{x}
```
```
Error [E007]: Unknown LaTeX command '\unknown'
  --> file.mc:1:8
   |
 1 | f(x) = \unknown{x}
   |         ^^^^^^^^ not in the supported LaTeX table
   |
  = Hint: Supported commands: \frac, \sqrt, \sin, \cos, \int, \sum, ...
          See LATEX.md for the full list.
```

### E-008: Незакрытая скобка
```
f(x) = (x + 1 * 2
```
```
Error [E008]: Unclosed parenthesis
  --> file.mc:1:8
   |
 1 | f(x) = (x + 1 * 2
   |         ^ opened here, never closed
   |
  = Hint: Add closing ')' at the end of the expression.
```

### E-009: Несогласованный отступ
```
f(x) =
    if x > 0
        x
      -x
```
```
Error [E009]: Inconsistent indentation
  --> file.mc:4:7
   |
 3 |         x
 4 |       -x
   |       ^ expected 8 spaces (matching 'if' block), got 6
   |
  = Hint: All lines in a block must have the same indentation.
```

### E-010: Деление на ноль (compile-time)
```
f() = 1 / 0
```
```
Warning [W002]: Division by zero detected at compile time
  --> file.mc:1:7
   |
 1 | f() = 1 / 0
   |       ^^^^^ result will be 'inf'
   |
  = Note: mclang follows IEEE 754: 1/0 = inf, -1/0 = -inf, 0/0 = nan
          This is a warning, not an error.
```

### E-011: Переопределение встроенной константы внутри функции (не в where)
```
f(x) =
    π = 3.14
    x * π
```
```
Error [E002]: Cannot reassign built-in constant 'π'
  --> file.mc:2:5
   |
 2 |     π = 3.14
   |     ^ 'π' is a built-in constant
   |
  = Hint: To override π for a function, use a where block:
          f(x) = x * π
              where
                  π = 3.14
```

### E-012: Несовместимые размеры массивов
```
dot(a: num[], b: num[]) = \sum_{i=0}^{a.length - 1} a[i] * b[i]

// Вызов из C: dot(arr3, 3, arr5, 5)  → runtime NAN
```
```
// Runtime: NAN (guard: a_len != b_len)
// Не ошибка компилятора, но документировано поведение
```

### E-013: `\sqrt` от отрицательного числа (compile-time)
```
f() = \sqrt{-1}
```
```
Warning [W003]: Square root of a negative constant
  --> file.mc:1:7
   |
 1 | f() = \sqrt{-1}
   |       ^^^^^^^^^ result will be 'nan'
   |
  = Note: sqrt(-1) = nan (IEEE 754).
          For complex numbers support is not available in MVP.
```

### E-014: Использование `return` (запрещено)
```
f(x) =
    return x + 1
```
```
Error [E010]: Keyword 'return' is not allowed in mclang
  --> file.mc:2:5
   |
 2 |     return x + 1
   |     ^^^^^^ explicit return is not needed
   |
  = Hint: The last expression in a function is returned automatically:
          f(x) =
              x + 1
```

### E-015: value-first форма `if` (не поддерживается)
```
f(x) = x if x > 0 else 0
```
```
Error [E011]: 'value-first' if syntax is not supported
  --> file.mc:1:8
   |
 1 | f(x) = x if x > 0 else 0
   |           ^^ unexpected 'if' after expression
   |
  = Hint: Use if-first syntax instead:
          f(x) = if (x > 0) x else 0
```

### E-016: `break` или `continue` в цикле
```
f(n: int) =
    for i in 1..n
        break
```
```
Error [E012]: 'break' is not supported in mclang
  --> file.mc:3:9
   |
 3 |         break
   |         ^^^^^ not a valid statement
   |
  = Hint: Use a while loop with a condition to exit early:
          x = 0
          while x < n and condition
              x = x + 1
```

### E-017: Рекурсия (не поддерживается в MVP)
```
fact(n: int) =
    if (n <= 1) 1
    n * fact(n - 1)
```
```
Error [E013]: Recursive function calls are not supported in MVP
  --> file.mc:3:9
   |
 3 |     n * fact(n - 1)
   |         ^^^^ 'fact' calls itself
   |
  = Hint: Use a loop instead:
          fact(n: int) =
              res = 1
              for i in 1..n
                  res = res * i
              res
```

---

## 9. Предупреждения (Warnings)

### W-001: Constant folding — результат `inf`
```
f() = 1e308 * 1e308
```
```
Warning [W004]: Expression evaluates to 'inf' at compile time
  --> file.mc:1:7
```

### W-002: `\pm` результат не используется полностью
```
x = \pm 5
```
```
Warning [W005]: '\pm' returns num[2], but result is assigned to a scalar
  --> file.mc:1:5
   |
 1 | x = \pm 5
   |     ^^^^^ returns [5, -5]
   |
  = Hint: Access both values:
          r = \pm 5
          x_pos = r[0]  // +5
          x_neg = r[1]  // -5
```

---

## 10. Интеграция (end-to-end)

### T-090: Физика — интегратор Верле
```
g = 9.806
get_pos(pos, prev_pos, acc, dt) =
    pos + (pos - prev_pos) + acc * dt^2
```
```c
static const mc_num g = 9.806;
mc_num get_pos(mc_num pos, mc_num prev_pos, mc_num acc, mc_num dt) {
    return pos + (pos - prev_pos) + acc * pow(dt, 2);
}
```

### T-091: Статистика массива
```
normalize(v: num[]) =
    \bar{v} + \sigma{v}
```
```c
mc_num normalize(mc_num* v, int v_len) {
    return mc_mean(v, v_len) + mc_std(v, v_len);
}
```

### T-092: Квадратное уравнение — оба корня
```
quadratic(a, b, c) = \pm \sqrt{b^2 - 4*a*c} - b / (2*a)
    where
        b^2 - 4*a*c >= 0
```
```c
mc_num* quadratic(mc_num a, mc_num b, mc_num c) {
    if (!(pow(b, 2) - 4*a*c >= 0)) return NULL;
    static mc_num _result[2];
    mc_num _d = sqrt(pow(b, 2) - 4*a*c);
    _result[0] = (+_d - b) / (2*a);
    _result[1] = (-_d - b) / (2*a);
    return _result;
}
```

---

## 11. Импорт `.mc`-файлов

### T-100: Простой импорт — функции из другого файла

**constants.mc:**
```
G = 6.674e-11
c = 299792458.0
```

**physics.mc:**
```
import "./constants.mc"

gravity(m1, m2, r) = G * m1 * m2 / r^2
```

**Ожидаемый результат компиляции `physics.mc --target c`:**

`constants.h` (генерируется из constants.mc):
```c
#ifndef MC_CONSTANTS_H
#define MC_CONSTANTS_H
#include "mc_runtime.h"

static const mc_num G = 6.674e-11;
static const mc_num c = 299792458.0;

#endif
```

`physics.c`:
```c
#include "physics.h"
#include "constants.h"

mc_num gravity(mc_num m1, mc_num m2, mc_num r) {
    return G * m1 * m2 / pow(r, 2);
}
```

---

### T-101: Именованный импорт `from ... import`

**vectors.mc:**
```
dot(a: num[], b: num[]) = \sum_{i=0}^{a.length-1} a[i] * b[i]
magnitude(v: num[]) = \sqrt{dot(v, v)}
normalize(v: num[]) = v / magnitude(v)
```

**main.mc:**
```
from "./vectors.mc" import magnitude, normalize
```

**Ожидание:** в сгенерированном `main.c` доступны только `magnitude` и `normalize`. `dot` не включается.

---

### T-102: Импорт с алиасом

**main.mc:**
```
import "./astronomy.mc" as astro
import "./ballistics.mc" as ball

combined(x, y) = astro.calculate(x) + ball.calculate(y)
```

**Ожидание:** компилятор разрешает `astro.calculate` → `mc_astro_calculate`, `ball.calculate` → `mc_ball_calculate`. Нет конфликта имён.

---

### T-103: Ошибка — циклический импорт

**a.mc:**
```
import "./b.mc"
fa(x) = x + 1
```

**b.mc:**
```
import "./a.mc"
fb(x) = x + 2
```

**Ожидаемая ошибка:**
```
Error [E020]: Circular import detected
  --> a.mc:1:1
   |
 1 | import "./b.mc"
   | ^^^^^^^^^^^^^^^ imports b.mc
   |
 = Note: b.mc imports a.mc, creating a cycle: a.mc → b.mc → a.mc
 = Hint: Extract shared definitions into a third file (e.g. "shared.mc")
         and import it from both files.
```

---

### T-104: Ошибка — импорт несуществующего файла

```
import "./nonexistent.mc"
f(x) = x
```

**Ожидаемая ошибка:**
```
Error [E021]: File not found: "./nonexistent.mc"
  --> main.mc:1:8
   |
 1 | import "./nonexistent.mc"
   |        ^^^^^^^^^^^^^^^^^^ file does not exist
   |
 = Hint: Check the path. Paths are relative to the current file.
```

---

### T-105: Ошибка — конфликт имён без алиаса

**a.mc:**
```
calculate(x) = x * 2
```

**b.mc:**
```
calculate(x) = x * 3
```

**main.mc:**
```
import "./a.mc"
import "./b.mc"

result(x) = calculate(x)
```

**Ожидаемая ошибка:**
```
Error [E022]: Name conflict: 'calculate' is defined in both "./a.mc" and "./b.mc"
  --> main.mc:2:1
   |
 2 | import "./b.mc"
   | ^^^^^^^^^^^^^^^ conflicts with import on line 1
   |
 = Hint: Use aliases to resolve the conflict:
         import "./a.mc" as a
         import "./b.mc" as b
         result(x) = a.calculate(x)
```

---

## 12. Интеграция с платформами (примеры сборки)

### T-110: C — сборка и вызов

**Файл `math_lib.mc`:**
```
# Простая математическая библиотека
gauss(x, mu, sigma) =
    \frac{1}{sigma * \sqrt{2 * π}} * exp(-\frac{(x - mu)^2}{2 * sigma^2})

clamp(x, lo, hi) = if (x < lo) lo else if (x > hi) hi else x
```

**Команда:**
```
mclang math_lib.mc --target c
```

**Сгенерированный `math_lib.h`:**
```c
#ifndef MC_MATH_LIB_H
#define MC_MATH_LIB_H

#ifdef MC_USE_FAST_FLOAT
    typedef float mc_num;
#elif defined(MC_USE_8BIT)
    typedef int16_t mc_num;
#else
    typedef double mc_num;
#endif

mc_num gauss(mc_num x, mc_num mu, mc_num sigma);
mc_num clamp(mc_num x, mc_num lo, mc_num hi);

#endif
```

**Тест на Си (`test_c.c`):**
```c
#include <stdio.h>
#include <assert.h>
#include "math_lib.h"

int main(void) {
    // gauss(0, 0, 1) ≈ 0.3989...
    double g = gauss(0.0, 0.0, 1.0);
    assert(g > 0.398 && g < 0.400);
    printf("gauss(0, 0, 1) = %f  OK\n", g);

    // clamp(5, 0, 3) = 3
    double c = clamp(5.0, 0.0, 3.0);
    assert(c == 3.0);
    printf("clamp(5, 0, 3) = %f  OK\n", c);

    return 0;
}
```

**Сборка и запуск:**
```
gcc test_c.c math_lib.c -o test_c -lm && ./test_c
```

**Ожидаемый вывод:**
```
gauss(0, 0, 1) = 0.398942  OK
clamp(5, 0, 3) = 3.000000  OK
```

---

### T-111: Python — сборка и вызов (ctypes)

**Файл `math_lib.mc`:** (тот же, что в T-110)

**Команда:**
```
mclang math_lib.mc --target shared
```

**Тест на Python (`test_python.py`):**
```python
import ctypes
import math

lib = ctypes.CDLL('./math_lib.so')  # Linux; .dll на Windows
lib.gauss.restype = ctypes.c_double
lib.gauss.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.clamp.restype = ctypes.c_double
lib.clamp.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]

# gauss(0, 0, 1) ≈ 1/sqrt(2π)
g = lib.gauss(0.0, 0.0, 1.0)
expected = 1.0 / math.sqrt(2 * math.pi)
assert abs(g - expected) < 1e-9, f"gauss failed: {g}"
print(f"gauss(0, 0, 1) = {g:.6f}  OK")

# clamp(5, 0, 3) = 3
c = lib.clamp(5.0, 0.0, 3.0)
assert c == 3.0, f"clamp failed: {c}"
print(f"clamp(5, 0, 3) = {c:.6f}  OK")
```

**Ожидаемый вывод:**
```
gauss(0, 0, 1) = 0.398942  OK
clamp(5, 0, 3) = 3.000000  OK
```

---

### T-112: JavaScript (Wasm) — сборка и вызов

**Файл `math_lib.mc`:** (тот же, что в T-110)

**Команда:**
```
mclang math_lib.mc --target wasm
```

**Тест на JS (`test_js.mjs`):**
```javascript
import { readFileSync } from 'node:fs';

const bytes = readFileSync('./math_lib.wasm');
const { instance } = await WebAssembly.instantiate(bytes);
const { gauss, clamp } = instance.exports;

// gauss(0, 0, 1) ≈ 0.3989...
const g = gauss(0.0, 0.0, 1.0);
console.assert(g > 0.398 && g < 0.400, `gauss failed: ${g}`);
console.log(`gauss(0, 0, 1) = ${g.toFixed(6)}  OK`);

// clamp(5, 0, 3) = 3
const c = clamp(5.0, 0.0, 3.0);
console.assert(c === 3.0, `clamp failed: ${c}`);
console.log(`clamp(5, 0, 3) = ${c.toFixed(6)}  OK`);
```

**Ожидаемый вывод:**
```
gauss(0, 0, 1) = 0.398942  OK
clamp(5, 0, 3) = 3.000000  OK
```
