# MClang — Лог реализации

**Язык реализации:** TypeScript (Node.js)

## Формат записи

```
### [YYYY-MM-DD] Фаза N — Название
**Статус:** в процессе / готово
- [ ] задача
- [x] выполненная задача
**Заметки:** ...
```

---

## Фаза 0 — Инициализация проекта

### [2026-04-15] Фаза 0 — Инициализация проекта
**Статус:** готово

- [x] `npm init` + `tsconfig.json`
- [x] Зависимости: `typescript`, `ts-node`, `@types/node`
- [x] Тест-фреймворк: `vitest`
- [x] Структура папок: `src/lexer`, `src/parser`, `src/ast`, `src/codegen`, `src/math`, `src/types`, `src/cli`
- [x] CLI-точка входа: `src/cli/index.ts`
- [x] Скрипты: `build`, `test`, `dev`

**Заметки:** `"type": "module"` + `moduleResolution: NodeNext`. `npx tsc` работает через `node_modules/.bin/tsc`.

---

## Фаза 1 — Лексер

### [2026-04-15] Фаза 1 — Лексер
**Статус:** готово

- [x] Токенизация чисел (целые, дробные, `1e-9`)
- [x] Токенизация ASCII-идентификаторов
- [x] Токенизация Unicode-идентификаторов
- [x] Трансляция LaTeX-команд в токены (`\lfloor` → `⌊`, …)
- [x] Таблица синонимов trig-функций
- [x] Disambiguation `|` vs `||`
- [x] Lookahead `\sigma{` vs `\sigma`
- [x] `INDENT` / `DEDENT`
- [x] Символ `°` → токен `DEGREE`
- [x] Постфикс `!` → токен `FACTORIAL`
- [x] Пропуск комментариев `//`

**Заметки:** 45 тестов проходят. Реализован в `src/lexer/lexer.ts` + `token.ts` + `error.ts`. Форматирование ошибок в Rust-стиле через `formatDiagnostic`.

---

## Фаза 2 — Парсер и AST

### [2026-04-18] Фаза 2 — Парсер и AST
**Статус:** готово

- [x] Рекурсивный нисходящий PEG-парсер
- [x] Узлы AST: `NumberLit`, `BoolLit`, `IdentExpr`, `BinaryExpr`, `UnaryExpr`, `FuncCallExpr`
- [x] Узлы AST: `FuncDef`, `ConstDef`, `ImportDef`, `IfNode`, `ForStmt`, `WhileStmt`
- [x] Узлы AST: `WhereBlock`, `IndexExpr`, `SliceExpr`, `MemberExpr`, `ArrayLit`, `MatrixLit`
- [x] Узлы AST: `FracExpr`, `SqrtExpr`, `AbsExpr`, `NormExpr`, `FloorExpr`, `CeilExpr`
- [x] Узлы AST: `PmExpr`, `CasesExpr`, `SumExpr`, `PostfixExpr`, `ChainCmpExpr`, `IfExpr`
- [x] Объявление функций с параметрами и типами (`num[]`, `int`)
- [x] Глобальные константы
- [x] Параметры по умолчанию
- [x] `where`-блок: определения (WhereDef) + guard-и (WhereGuard)
- [x] Неявный `return` — последний ExprStmt в теле
- [x] Значимые отступы (через INDENT/DEDENT от лексера)
- [x] Обновлён `token.ts`: `Period`, `KwAnd/Or/Not/Xor/Step/Mod/Import/From/As`
- [x] Обновлён `lexer.ts`: токены `Period` (`.`), `∑`→Sum, `∏`→Prod

**Заметки:** 33 новых теста + 93 всего проходят. Критерий готовности выполнен: полный пример из раздела 22 SPEC.md парсируется без ошибок. Реализовано в `src/parser/parser.ts` + `src/ast/nodes.ts`.

---

## Фаза 3 — Базовый генератор Си

### [2026-04-18] Фаза 3 — Базовый генератор Си
**Статус:** готово

- [x] Генерация `mc_num f(mc_num x) { return ...; }`
- [x] Генерация `.h`-файла (публичные функции, include guard, `mc_num` typedef)
- [x] Макрос `mc_num` (double / float / int16_t по флагу)
- [x] Трансляция бинарных операций: `+`, `-`, `*`, `/`, `%`→`fmod`, `^`→`pow`
- [x] Трансляция сравнений → `1.0 / 0.0`, логических → `&&`, `||`
- [x] Трансляция унарных операций
- [x] Трансляция вызовов функций (таблица `FUNC_MAP` → math.h)
- [x] Трансляция inline `if`→ternary, block `if/else`
- [x] Трансляция `\begin{cases}` → вложенный тернарный
- [x] Трансляция `for..in` и `while`
- [x] Трансляция `where`-блоков (guards → `if (!cond) return NAN;`, defs → `mc_num name = ...`)
- [x] Трансляция `\frac` → деление, `\sqrt` → `sqrt()`/`pow()`
- [x] Трансляция `|x|` → `fabs()`, `\lfloor` → `floor()`, `\lceil` → `ceil()`
- [x] Трансляция `∑(i=a,b)` → `for`-цикл с аккумулятором
- [x] Трансляция `°` → `* (M_PI / 180.0)`
- [x] Трансляция цепочек сравнений → `&&`
- [x] Unicode-транслитерация идентификаторов → `__uni_name`
- [x] Встроенные константы: `π`→`M_PI`, `e`→`M_E`, `τ`, `φ`, `inf`, `nan`
- [x] Типизированные параметры `num[]` → `mc_num* v, int v_len`; `num[][]` → `mc_num* m, int m_rows, int m_cols`
- [x] Приватные функции (`_name`) не попадают в `.h`

**Заметки:** 45 новых тестов + 138 всего проходят. Реализовано в `src/codegen/codegen.ts`. Полный пример §22 генерирует корректный Си-код.

---

## Фаза 4 — Математический движок

### [2026-04-18] Фаза 4 — Математический движок
**Статус:** готово

- [x] Неявное умножение (`2x` → `2*x`, `2πr` → `2*π*r`, граница по `Newline`)
- [x] `\frac`, `\sqrt`, `\sqrt[n]` — реализованы в парсере и кодогене
- [x] Степень `x^n` → `pow(x, n)`
- [x] Trig-функции + синонимы (`arcsin` → `asin`, и т.д.)
- [x] Логарифмы: `\log_{base}{x}` → `log(x) / log(base)`, `\ln` → `log`, `\lg` → `log`
- [x] `|x|` → `fabs()`, `\lfloor` → `floor()`, `\lceil` → `ceil()`, `‖v‖` → `mc_norm()`
- [x] Встроенные константы: `π`→`M_PI`, `e`→`M_E`, `τ`, `φ`, `inf`, `nan`
- [x] Constant folding: числовые литералы, алгебраические тождества (`x+0`, `x*1`, и т.д.)
- [x] Unicode-транслитерация идентификаторов → `__uni_name`
- [x] Цепочки сравнений `0 < x < 10` → `&&`
- [x] `\sigma{v}` → `std(v)`, `\Gamma{x}` → `tgamma(x)`, `\bar{v}` → `mean(v)`
- [x] Символ `°` → `* (M_PI / 180.0)`, `\neq` → `!=`, `\leq` → `<=`, `\geq` → `>=`
- [x] AST-трансформ: `e^x` → `exp(x)`

**Заметки:** 26 новых тестов + 164 всего проходят. Реализовано в `src/math/implicit-mul.ts`, `src/math/transforms.ts`, `src/math/const-fold.ts`, `src/math/index.ts`. Критерий готовности выполнен: Гауссова функция, гравитация Ньютона, квадратное уравнение компилируются корректно.

---

## Фаза 5 — Массивы и матрицы

### [2026-04-18] Фаза 5 — Массивы и матрицы
**Статус:** готово

- [x] Типы `num[]`, `num[][]` → `mc_num*` + `_len` / `_rows` / `_cols`
- [x] Неявные параметры `_len`, `_rows`, `_cols` в подписи функции
- [x] `.length` → `_len`, `.rows` → `_rows`, `.cols` → `_cols`
- [x] Литерал `[a, b, c]` → C99 compound literal `(mc_num[]){a, b, c}`
- [x] Литерал `[[...], [...]]` → flat compound literal row-major
- [x] Индексация `v[i]` → `v[(int)(i)]`
- [x] 2D-индексация `m[i][j]` → `m[(int)(i)*m_cols+(int)(j)]` (с TypeEnv)
- [x] Срез `v[a..b]` → `v + (int)(a)` (pointer offset)
- [x] Dispatch `⋅` по типу: `num[]` → `mc_dot(v,w,len)`, scalar → `*`
- [x] Произведение `⨯` → `mc_cross()` runtime helper
- [x] `norm(v)` / `‖v‖` → `mc_norm(v, v_len)`
- [x] Матричное умножение A⋅B → `mc_matmul()` helper (заготовка)
- [x] `\pm expr` → `(mc_num[]){+(x), -(x)}`
- [x] TypeEnv: трекинг типов параметров внутри функции
- [x] Runtime helpers: `mc_dot`, `mc_cross`, `mc_matmul` — inline в .c

**Заметки:** 17 новых тестов + 181 всего проходят. Реализовано в `src/codegen/codegen.ts`. Критерий: dot product, vector norm, 2D-индексация матриц компилируются корректно.

---

## Фаза 6 — Агрегаторы

### [2026-04-18] Фаза 6 — Агрегаторы и специальные операторы
**Статус:** готово

- [x] `\sum`, `\prod` по диапазону — генерируют `for`-цикл с аккумулятором
- [x] `\sum_{x \in v}`, `\prod_{x \in v}` — итерация по массиву (SumExpr iterKind='array')
- [x] `\min_{i=a}^{b}`, `\max_{i=a}^{b}` — min/max по диапазону
- [x] `sum(v)`, `product(v)`, `mean(v)`, `std(v)` — dispatch для typed array param → mc_*
- [x] `min(a,b)` → `fmin`, `min(v)` → `mc_min_arr(v, v_len)` (dispatch по числу аргументов и типу)
- [x] `max(a,b)` → `fmax`, `max(v)` → `mc_max_arr(v, v_len)`
- [x] `n!` → `mc_factorial()` — lookup-таблица до 20
- [x] `\binom{n}{k}` → `mc_binom(n, k)` — итеративный алгоритм
- [x] `\gcd{a}{b}` → `mc_gcd(a, b)` — алгоритм Евклида
- [x] `\lcm{a}{b}` → `mc_lcm(a, b)` — через gcd
- [x] `sgn(x)` → `mc_sgn(x)`; `erf(x)` → `erf(x)`; `\Gamma{x}` → `tgamma(x)`
- [x] Все runtime helpers — `static inline` в начале `.c` файла (DCE-дружественные)
- [x] Парсер: `\binom{n}{k}`, `\gcd{a}{b}`, `\lcm{a}{b}` — two-brace form

**Заметки:** 27 новых тестов + 208 всего проходят. Критерий: факториал, биномиальный коэффициент, статистика массива компилируются корректно.

---

## Фаза 7 — Численные методы

**Статус:** не начата

- [ ] `\lim` → численный
- [ ] `\frac{d}{dx}` → конечные разности
- [ ] `\int` → метод Симпсона
- [ ] `solve` → бисекция
- [ ] `is_nan`, `is_inf`, `is_finite`

---

## Фаза 8 — Таблицы

**Статус:** не начата

- [ ] Числовые таблицы + интерполяция
- [ ] Именованные таблицы со строковыми ключами
- [ ] `import_table("file.csv")`

---

## Фаза 9 — Таргеты

**Статус:** не начата

- [ ] `--target c`
- [ ] `--target wasm`
- [ ] `--target shared`
- [ ] `--precision f32`, `--precision fixed`
- [ ] Стандартная библиотека: физические константы
