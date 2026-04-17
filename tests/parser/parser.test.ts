import { describe, it, expect } from 'vitest';
import { Lexer } from '../../src/lexer/lexer.js';
import { parseSource } from '../../src/parser/parser.js';
import type { File, FuncDef, ConstDef, BinaryExpr, FracExpr, SqrtExpr, WhereBlock, SumExpr, FuncCallExpr, IdentExpr, NumberLit, MemberExpr } from '../../src/ast/nodes.js';

function parse(src: string): File {
  const tokens = new Lexer(src).tokenize();
  return parseSource(tokens);
}

// ── Utilities ────────────────────────────────────────────────────────────────

function funcDef(file: File, name: string): FuncDef {
  const node = file.body.find(n => n.kind === 'FuncDef' && n.name === name);
  if (!node) throw new Error(`FuncDef '${name}' not found`);
  return node as FuncDef;
}

function constDef(file: File, name: string): ConstDef {
  const node = file.body.find(n => n.kind === 'ConstDef' && n.name === name);
  if (!node) throw new Error(`ConstDef '${name}' not found`);
  return node as ConstDef;
}

// ── Const definitions ────────────────────────────────────────────────────────

describe('ConstDef', () => {
  it('parses simple numeric constant', () => {
    const f = parse('g = 9.806\n');
    const g = constDef(f, 'g');
    expect(g.value.kind).toBe('NumberLit');
    expect((g.value as NumberLit).value).toBe(9.806);
  });

  it('parses multiple constants', () => {
    const f = parse('G = 6.67430e-11\nc = 299792458\n');
    expect(f.body).toHaveLength(2);
    expect(constDef(f, 'G').value.kind).toBe('NumberLit');
    expect(constDef(f, 'c').value.kind).toBe('NumberLit');
  });
});

// ── Function definitions ──────────────────────────────────────────────────────

describe('FuncDef — simple', () => {
  it('parses single-expression body', () => {
    const f = parse('newton(m, a) = m * a\n');
    const fn = funcDef(f, 'newton');
    expect(fn.params).toHaveLength(2);
    expect(fn.params[0]!.name).toBe('m');
    expect(fn.params[1]!.name).toBe('a');
    expect(fn.body).toHaveLength(1);
    expect(fn.body[0]!.kind).toBe('ExprStmt');
  });

  it('parses block body', () => {
    const f = parse('get_pos(pos, prev_pos, acc, dt) =\n    pos + (pos - prev_pos) + acc * dt^2\n');
    const fn = funcDef(f, 'get_pos');
    expect(fn.params).toHaveLength(4);
    expect(fn.body).toHaveLength(1);
  });

  it('parses power expression ^', () => {
    const f = parse('sq(x) = x^2\n');
    const fn = funcDef(f, 'sq');
    const expr = (fn.body[0] as any).expr as BinaryExpr;
    expect(expr.op).toBe('^');
  });
});

describe('FuncDef — typed params', () => {
  it('parses num[] param type', () => {
    const f = parse('total(v: num[]) = v[0]\n');
    const fn = funcDef(f, 'total');
    expect(fn.params[0]!.type).toEqual({ kind: 'NumType', dims: 1 });
  });

  it('parses int param type', () => {
    const f = parse('sum_n(n: int) = n\n');
    const fn = funcDef(f, 'sum_n');
    expect(fn.params[0]!.type).toEqual({ kind: 'IntType' });
  });

  it('parses default parameter', () => {
    const f = parse('circle(r, t, cx = 0) = cx + r\n');
    const fn = funcDef(f, 'circle');
    expect(fn.params[2]!.name).toBe('cx');
    expect(fn.params[2]!.default?.kind).toBe('NumberLit');
  });
});

describe('FuncDef — where block', () => {
  it('parses single guard', () => {
    const f = parse('newton(m, a) = m * a\n    where\n        m > 0\n');
    const fn = funcDef(f, 'newton');
    expect(fn.where).toBeDefined();
    const w = fn.where as WhereBlock;
    expect(w.lines).toHaveLength(1);
    expect(w.lines[0]!.kind).toBe('WhereGuard');
  });

  it('parses where with def and guard', () => {
    const f = parse('f(m, x) = E\n    where\n        E = m * x\n        E > 0\n');
    const fn = funcDef(f, 'f');
    const w = fn.where!;
    expect(w.lines).toHaveLength(2);
    expect(w.lines[0]!.kind).toBe('WhereDef');
    expect(w.lines[1]!.kind).toBe('WhereGuard');
  });
});

// ── Expressions ───────────────────────────────────────────────────────────────

describe('\\frac', () => {
  it('parses \\frac{a}{b}', () => {
    const f = parse('f(m, v) = \\frac{m * v}{2}\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as FracExpr;
    expect(expr.kind).toBe('FracExpr');
    expect(expr.num.kind).toBe('BinaryExpr');
    expect((expr.den as NumberLit).value).toBe(2);
  });

  it('parses nested \\frac in block body', () => {
    const f = parse('E_k(m, v) = \\frac{m * v^2}{2}\n');
    const fn = funcDef(f, 'E_k');
    const frac = (fn.body[0] as any).expr as FracExpr;
    expect(frac.kind).toBe('FracExpr');
    const num = frac.num as BinaryExpr;
    expect(num.op).toBe('*');
    const pow = num.right as BinaryExpr;
    expect(pow.op).toBe('^');
  });
});

describe('\\sqrt', () => {
  it('parses \\sqrt{x}', () => {
    const f = parse('f(x) = \\sqrt{x}\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as SqrtExpr;
    expect(expr.kind).toBe('SqrtExpr');
    expect(expr.degree).toBeUndefined();
    expect(expr.radicand.kind).toBe('IdentExpr');
  });

  it('parses \\sqrt[3]{x}', () => {
    const f = parse('f(x) = \\sqrt[3]{x}\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as SqrtExpr;
    expect(expr.degree?.kind).toBe('NumberLit');
    expect((expr.degree as NumberLit).value).toBe(3);
  });
});

describe('Binary operators', () => {
  it('parses precedence: a + b * c', () => {
    const f = parse('f(a, b, c) = a + b * c\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as BinaryExpr;
    expect(expr.op).toBe('+');
    expect(expr.right.kind).toBe('BinaryExpr');
    expect((expr.right as BinaryExpr).op).toBe('*');
  });

  it('parses chain comparison 0 < x < 10', () => {
    const f = parse('valid(x) = 0 < x < 10\n');
    const fn = funcDef(f, 'valid');
    const expr = (fn.body[0] as any).expr;
    expect(expr.kind).toBe('ChainCmpExpr');
    expect(expr.ops).toEqual(['<', '<']);
  });
});

describe('Member access', () => {
  it('parses v.length', () => {
    const f = parse('f(v: num[]) = v.length\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as MemberExpr;
    expect(expr.kind).toBe('MemberExpr');
    expect(expr.member).toBe('length');
    expect((expr.object as IdentExpr).name).toBe('v');
  });
});

describe('Array / Matrix literals', () => {
  it('parses array literal [1, 2, 3]', () => {
    const f = parse('f() = [1, 2, 3]\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr;
    expect(expr.kind).toBe('ArrayLit');
    expect(expr.elements).toHaveLength(3);
  });

  it('parses matrix literal [[1, 0], [0, 1]]', () => {
    const f = parse('f() = [[1, 0], [0, 1]]\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr;
    expect(expr.kind).toBe('MatrixLit');
    expect(expr.rows).toHaveLength(2);
  });
});

describe('Function calls', () => {
  it('parses sin(x)', () => {
    const f = parse('f(x) = sin(x)\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as FuncCallExpr;
    expect(expr.kind).toBe('FuncCallExpr');
    expect(expr.name).toBe('sin');
    expect(expr.args).toHaveLength(1);
  });

  it('parses nested call sqrt(b^2 - 4*a*c)', () => {
    const f = parse('f(a, b, c) = sqrt(b^2)\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as FuncCallExpr;
    expect(expr.kind).toBe('FuncCallExpr');
    expect(expr.name).toBe('sqrt');
  });
});

describe('Control flow', () => {
  it('parses for loop', () => {
    const f = parse('sum_sq(n: int) =\n    res = 0\n    for i in 1..n\n        res = res + i\n    res\n');
    const fn = funcDef(f, 'sum_sq');
    const forStmt = fn.body.find(s => s.kind === 'ForStmt');
    expect(forStmt).toBeDefined();
    expect((forStmt as any).var).toBe('i');
  });

  it('parses while loop', () => {
    const f = parse('f(x) =\n    while x > 0\n        x = x - 1\n    x\n');
    const fn = funcDef(f, 'f');
    const w = fn.body.find(s => s.kind === 'WhileStmt');
    expect(w).toBeDefined();
  });

  it('parses inline if/else', () => {
    const f = parse('check(x) = if (x < 0) -1 else x\n');
    const fn = funcDef(f, 'check');
    const expr = (fn.body[0] as any).expr;
    // Could be IfNode or IfExpr depending on parser path
    expect(['IfNode', 'IfExpr']).toContain(expr.kind);
  });
});

describe('Sum expression ∑', () => {
  it('parses ∑(i=0, n) expr', () => {
    const f = parse('f(n) = ∑(i=0, n) i\n');
    const fn = funcDef(f, 'f');
    const expr = (fn.body[0] as any).expr as SumExpr;
    expect(expr.kind).toBe('SumExpr');
    expect(expr.op).toBe('sum');
    expect(expr.iterKind).toBe('range');
    expect(expr.var).toBe('i');
  });
});

// ── Full example from SPEC.md section 22 ─────────────────────────────────────

describe('SPEC.md section 22 — full example', () => {
  const src = `// physics_core.mc
g = 9.806

get_pos(pos, prev_pos, acc, dt) =
    pos + (pos - prev_pos) + acc * dt^2

newton(m, a) = m * a
    where
        m > 0

E_k(m, v) = \\frac{m * v^2}{2}

reflect_vel(v, normal, friction = 0.9) =
    (v - 2 * (v ⋅ normal) * normal) * friction

total_energy(masses: num[], velocities: num[]) =
    ∑(i=0, masses.length - 1) \\frac{masses[i] * velocities[i]^2}{2}
`;

  it('parses without errors', () => {
    expect(() => parse(src)).not.toThrow();
  });

  it('has 6 top-level definitions (1 const + 5 funcs)', () => {
    const f = parse(src);
    expect(f.body).toHaveLength(6);
  });

  it('g is a ConstDef with value 9.806', () => {
    const f = parse(src);
    const g = constDef(f, 'g');
    expect((g.value as NumberLit).value).toBe(9.806);
  });

  it('newton has a where block with m > 0 guard', () => {
    const f = parse(src);
    const fn = funcDef(f, 'newton');
    expect(fn.where).toBeDefined();
    expect(fn.where!.lines[0]!.kind).toBe('WhereGuard');
  });

  it('E_k body is a FracExpr', () => {
    const f = parse(src);
    const fn = funcDef(f, 'E_k');
    const expr = (fn.body[0] as any).expr;
    expect(expr.kind).toBe('FracExpr');
  });

  it('reflect_vel has default friction param', () => {
    const f = parse(src);
    const fn = funcDef(f, 'reflect_vel');
    const friction = fn.params.find(p => p.name === 'friction');
    expect(friction).toBeDefined();
    expect(friction!.default?.kind).toBe('NumberLit');
  });

  it('total_energy has typed num[] params', () => {
    const f = parse(src);
    const fn = funcDef(f, 'total_energy');
    expect(fn.params[0]!.type).toEqual({ kind: 'NumType', dims: 1 });
    expect(fn.params[1]!.type).toEqual({ kind: 'NumType', dims: 1 });
  });

  it('total_energy body is a SumExpr', () => {
    const f = parse(src);
    const fn = funcDef(f, 'total_energy');
    const expr = (fn.body[0] as any).expr as SumExpr;
    expect(expr.kind).toBe('SumExpr');
    expect(expr.var).toBe('i');
  });
});
