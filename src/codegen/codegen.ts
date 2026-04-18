import type {
  File, TopLevelNode, ConstDef, FuncDef,
  Stmt, AssignStmt, IfNode, ForStmt, WhileStmt, ExprStmt,
  WhereBlock, WhereLine,
  Expr, NumberLit, BoolLit, IdentExpr, BinaryExpr, UnaryExpr,
  FuncCallExpr, IfExpr, IndexExpr, SliceExpr, MemberExpr,
  ArrayLit, MatrixLit, FracExpr, SqrtExpr,
  AbsExpr, NormExpr, FloorExpr, CeilExpr,
  PmExpr, CasesExpr, SumExpr, PostfixExpr, ChainCmpExpr,
  LimExpr, DerivExpr, IntegralExpr, SolveExpr,
  TableExpr, StringLitExpr,
  Param, McType,
} from '../ast/nodes.js';

// ── Options ───────────────────────────────────────────────────────────────────

export type CgenTarget    = 'c' | 'wasm' | 'shared';
export type CgenPrecision = 'f64' | 'f32' | 'fixed';

export type CgenOptions = {
  target?:    CgenTarget;
  precision?: CgenPrecision;
};

// ── Output ────────────────────────────────────────────────────────────────────

export type CgenOutput = {
  c: string;
  h: string;
};

// ── Unicode identifier transliteration ───────────────────────────────────────

const UNICODE_NAMES: ReadonlyMap<string, string> = new Map([
  ['π', '__uni_pi'],   ['τ', '__uni_tau'],  ['φ', '__uni_phi'],
  ['α', '__uni_alpha'],['β', '__uni_beta'], ['γ', '__uni_gamma'],
  ['δ', '__uni_delta'],['ε', '__uni_eps'],  ['ζ', '__uni_zeta'],
  ['η', '__uni_eta'],  ['θ', '__uni_theta'],['ι', '__uni_iota'],
  ['κ', '__uni_kappa'],['λ', '__uni_lambda'],['μ', '__uni_mu'],
  ['ν', '__uni_nu'],   ['ξ', '__uni_xi'],   ['ρ', '__uni_rho'],
  ['σ', '__uni_sigma'],['υ', '__uni_ups'],  ['χ', '__uni_chi'],
  ['ψ', '__uni_psi'],  ['ω', '__uni_omega'],
  ['Γ', '__uni_Gamma'],['Δ', '__uni_Delta'],['Θ', '__uni_Theta'],
  ['Λ', '__uni_Lambda'],['Ξ', '__uni_Xi'], ['Π', '__uni_Pi'],
  ['Σ', '__uni_Sigma'],['Υ', '__uni_Ups'], ['Φ', '__uni_Phi'],
  ['Ψ', '__uni_Psi'],  ['Ω', '__uni_Omega'],
]);

// Built-in math constants → C values
const BUILTIN_CONSTS: ReadonlyMap<string, string> = new Map([
  // Math
  ['π',   'M_PI'],       ['pi',  'M_PI'],
  ['τ',   '(2.0*M_PI)'], ['tau', '(2.0*M_PI)'],
  ['φ',   '1.6180339887498948482'], ['phi', '1.6180339887498948482'],
  ['e',   'M_E'],
  ['inf', 'INFINITY'],   ['nan', 'NAN'],
  // Physics (std.physics)
  ['G',   '6.67430e-11'],           // gravitational constant
  ['c',   '299792458.0'],           // speed of light (m/s)
  ['h',   '6.62607015e-34'],        // Planck constant (J·s)
  ['k_B', '1.380649e-23'],          // Boltzmann constant (J/K)
  ['N_A', '6.02214076e23'],         // Avogadro number (1/mol)
  ['R',   '8.314462618'],           // universal gas constant (J/mol·K)
]);

function translit(name: string): string {
  // If pure ASCII — return as-is
  if (/^[\x00-\x7F]+$/.test(name)) return name;
  // Single Unicode char
  const mapped = UNICODE_NAMES.get(name);
  if (mapped) return mapped;
  // Mixed: replace each non-ASCII char
  let result = '';
  for (const ch of name) {
    if (/[\x00-\x7F]/.test(ch)) {
      result += ch;
    } else {
      const m = UNICODE_NAMES.get(ch);
      result += m ?? `_u${ch.codePointAt(0)!.toString(16).padStart(4, '0')}`;
    }
  }
  return result;
}

// ── Type helpers ──────────────────────────────────────────────────────────────

function cType(ty: McType | undefined): string {
  if (!ty) return 'mc_num';
  switch (ty.kind) {
    case 'IntType':  return 'int';
    case 'BoolType': return 'int';
    case 'NumType':
      if (ty.dims === 0) return 'mc_num';
      return 'mc_num*';
  }
}

function isArrayType(ty: McType | undefined): boolean {
  return ty?.kind === 'NumType' && (ty.dims ?? 0) > 0;
}

function isMatrixType(ty: McType | undefined): boolean {
  return ty?.kind === 'NumType' && (ty.dims ?? 0) >= 2;
}

// ── Code generator ────────────────────────────────────────────────────────────

export class CGenerator {
  private readonly ast: File;
  private readonly opts: Required<CgenOptions>;
  private indent = 0;
  private lines: string[] = [];
  private hLines: string[] = [];

  // Track public function names for the header
  private publicFuncs: string[] = [];

  // Type environment for current function's params
  private typeEnv: Map<string, McType> = new Map();

  // Counter for unique local variable names
  private localArrCount = 0;

  // Variable name overrides for derivative/limit generation
  private varOverride: Map<string, string> = new Map();

  // Table registry: name → 'numeric' | 'string'
  private tableKind: Map<string, 'numeric' | 'string'> = new Map();

  constructor(ast: File, opts: CgenOptions = {}) {
    this.ast = ast;
    this.opts = {
      target:    opts.target    ?? 'c',
      precision: opts.precision ?? 'f64',
    };
  }

  generate(): CgenOutput {
    this.lines = [];
    this.hLines = [];

    this.genHeader();
    this.genRuntimeHelpers();
    this.genFile();

    const guardName = '__MCLANG_OUT_H__';
    const precisionDefine = this.opts.precision === 'f32'
      ? '#define MC_USE_FAST_FLOAT\n'
      : this.opts.precision === 'fixed'
        ? '#define MC_USE_8BIT\n'
        : '';
    const hPrologue = [
      `#ifndef ${guardName}`,
      `#define ${guardName}`,
      '',
      precisionDefine,
      '#include <math.h>',
      '#include <stdint.h>',
      '',
      '#ifdef MC_USE_FAST_FLOAT',
      '  typedef float mc_num;',
      '#elif defined(MC_USE_8BIT)',
      '  typedef int16_t mc_num;',
      '#else',
      '  typedef double mc_num;',
      '#endif',
      '',
    ].join('\n');

    const hEpilogue = '\n#endif\n';

    return {
      c: this.lines.join('\n'),
      h: hPrologue + this.hLines.join('\n') + hEpilogue,
    };
  }

  private genHeader(): void {
    // Precision defines — emitted before system includes so user can override
    if (this.opts.precision === 'f32') {
      this.emit('#define MC_USE_FAST_FLOAT');
    } else if (this.opts.precision === 'fixed') {
      this.emit('#define MC_USE_8BIT');
    }

    // Wasm: include Emscripten header if targeting wasm
    if (this.opts.target === 'wasm') {
      this.emit('#ifdef __EMSCRIPTEN__');
      this.emit('#include <emscripten.h>');
      this.emit('#endif');
    }

    this.emit('#include <math.h>');
    this.emit('#include <stdint.h>');
    this.emit('#include <float.h>');
    this.emit('#include <string.h>');
    this.emit('');
    this.emit('#ifdef MC_USE_FAST_FLOAT');
    this.emit('  typedef float mc_num;');
    this.emit('#elif defined(MC_USE_8BIT)');
    this.emit('  typedef int16_t mc_num;');
    this.emit('#else');
    this.emit('  typedef double mc_num;');
    this.emit('#endif');
    this.emit('');
    // Built-in constants
    this.emit('#ifndef M_PI');
    this.emit('  #define M_PI 3.14159265358979323846');
    this.emit('#endif');
    this.emit('#ifndef M_E');
    this.emit('  #define M_E 2.71828182845904523536');
    this.emit('#endif');
    this.emit('');
  }

  private genRuntimeHelpers(): void {
    // All helpers are static inline — compiler DCEs unused ones
    const h = [
      // Scalar helpers
      'static inline mc_num mc_sgn(mc_num x) { return (x>0.0)?1.0:(x<0.0)?-1.0:0.0; }',
      'static inline mc_num mc_gcd(mc_num a, mc_num b) {',
      '  int ia=(int)fabs(a),ib=(int)fabs(b); while(ib){int t=ib;ib=ia%ib;ia=t;} return (mc_num)ia; }',
      'static inline mc_num mc_lcm(mc_num a, mc_num b) {',
      '  mc_num g=mc_gcd(a,b); return (g==0.0)?0.0:fabs(a*b)/g; }',
      'static inline mc_num mc_binom(mc_num n, mc_num k) {',
      '  int in=(int)n,ik=(int)k; if(ik<0||ik>in) return 0.0;',
      '  if(ik>in-ik) ik=in-ik; mc_num r=1.0;',
      '  for(int i=0;i<ik;i++) r=r*(in-i)/(i+1); return r; }',
      'static inline mc_num mc_factorial(int n) {',
      '  static const double _f[21]={1,1,2,6,24,120,720,5040,40320,362880,3628800,',
      '    39916800,479001600,6227020800.0,87178291200.0,1307674368000.0,',
      '    20922789888000.0,355687428096000.0,6402373705728000.0,',
      '    121645100408832000.0,2432902008176640000.0};',
      '  return (n>=0&&n<=20)?(mc_num)_f[n]:INFINITY; }',
      // Array aggregators
      'static inline mc_num mc_sum(const mc_num* v, int n) {',
      '  mc_num s=0.0; for(int i=0;i<n;i++) s+=v[i]; return s; }',
      'static inline mc_num mc_product(const mc_num* v, int n) {',
      '  mc_num p=1.0; for(int i=0;i<n;i++) p*=v[i]; return p; }',
      'static inline mc_num mc_mean(const mc_num* v, int n) {',
      '  return n>0 ? mc_sum(v,n)/n : 0.0; }',
      'static inline mc_num mc_std(const mc_num* v, int n) {',
      '  if(n<=0) return 0.0; mc_num m=mc_mean(v,n),s=0.0;',
      '  for(int i=0;i<n;i++) s+=(v[i]-m)*(v[i]-m); return sqrt(s/n); }',
      'static inline mc_num mc_norm(const mc_num* v, int n) {',
      '  mc_num s=0.0; for(int i=0;i<n;i++) s+=v[i]*v[i]; return sqrt(s); }',
      'static inline mc_num mc_min_arr(const mc_num* v, int n) {',
      '  if(n<=0) return NAN; mc_num m=v[0]; for(int i=1;i<n;i++) if(v[i]<m) m=v[i]; return m; }',
      'static inline mc_num mc_max_arr(const mc_num* v, int n) {',
      '  if(n<=0) return NAN; mc_num m=v[0]; for(int i=1;i<n;i++) if(v[i]>m) m=v[i]; return m; }',
      // Vector helpers
      'static inline mc_num mc_dot(const mc_num* a, const mc_num* b, int n) {',
      '  mc_num s=0.0; for(int i=0;i<n;i++) s+=a[i]*b[i]; return s; }',
      'static inline void mc_cross3(const mc_num* a, const mc_num* b, mc_num* out) {',
      '  out[0]=a[1]*b[2]-a[2]*b[1]; out[1]=a[2]*b[0]-a[0]*b[2]; out[2]=a[0]*b[1]-a[1]*b[0]; }',
      // Matrix multiply (writes to C — caller provides buffer)
      'static inline void mc_matmul(const mc_num* A, const mc_num* B, mc_num* C,',
      '    int rows, int inner, int cols) {',
      '  for(int i=0;i<rows;i++) for(int j=0;j<cols;j++) {',
      '    mc_num s=0.0; for(int k=0;k<inner;k++) s+=A[i*inner+k]*B[k*cols+j];',
      '    C[i*cols+j]=s; } }',
      // Table interpolation (linear)
      'static inline mc_num mc_interp(mc_num x, const mc_num* xs, const mc_num* ys, int n) {',
      '  if(n<=0) return NAN; if(x<=xs[0]) return ys[0]; if(x>=xs[n-1]) return ys[n-1];',
      '  for(int i=0;i<n-1;i++) if(x<=xs[i+1]) {',
      '    mc_num t=(x-xs[i])/(xs[i+1]-xs[i]); return ys[i]+t*(ys[i+1]-ys[i]); }',
      '  return ys[n-1]; }',
      '',
    ];
    for (const line of h) this.emit(line);
  }

  private genFile(): void {
    for (const node of this.ast.body) {
      this.genTopLevel(node);
    }
  }

  private genTopLevel(node: TopLevelNode): void {
    switch (node.kind) {
      case 'ConstDef': this.genConstDef(node); break;
      case 'FuncDef':  this.genFuncDef(node);  break;
      case 'ImportDef': this.emit(`#include "${node.path}.h"`); break;
    }
  }

  // ── Const def ───────────────────────────────────────────────────────────────

  private genConstDef(node: ConstDef): void {
    if (node.value.kind === 'TableExpr') {
      this.genTableDef(node.name, node.value as TableExpr);
      return;
    }
    const name = translit(node.name);
    const val = this.genExpr(node.value);
    this.emit(`static const mc_num ${name} = ${val};`);
    this.emit('');
  }

  private genTableDef(name: string, expr: TableExpr): void {
    const cname = translit(name);
    const allString = expr.pairs.every(p => p.key.kind === 'StringLitExpr');

    if (allString) {
      // String-key table → C function with strcmp chain
      this.tableKind.set(name, 'string');
      this.emit(`static mc_num ${cname}(const char* _key) {`);
      this.indent++;
      for (const { key, value } of expr.pairs) {
        const k = (key as StringLitExpr).value;
        const v = this.genExpr(value);
        this.emit(`if (strcmp(_key, "${k}") == 0) return ${v};`);
      }
      this.emit('return NAN;');
      this.indent--;
      this.emit('}');
    } else {
      // Numeric-key table → interp arrays
      this.tableKind.set(name, 'numeric');
      const n = expr.pairs.length;
      const xs = expr.pairs.map(p => this.genExpr(p.key)).join(', ');
      const ys = expr.pairs.map(p => this.genExpr(p.value)).join(', ');
      this.emit(`static const mc_num _${cname}_xs[${n}] = {${xs}};`);
      this.emit(`static const mc_num _${cname}_ys[${n}] = {${ys}};`);
      this.emit(`static const int _${cname}_n = ${n};`);
    }
    this.emit('');
  }

  // ── Func def ────────────────────────────────────────────────────────────────

  private genFuncDef(node: FuncDef): void {
    // Populate type environment for this function
    this.typeEnv = new Map();
    for (const p of node.params) {
      if (p.type) this.typeEnv.set(p.name, p.type);
    }

    const isPrivate = node.name.startsWith('_');
    const cName = translit(node.name);

    // Build parameter list
    const paramStrs = this.buildParamList(node.params);
    const retType = this.funcReturnType(node);
    const sig = `${retType} ${cName}(${paramStrs.join(', ')})`;

    // Wasm: annotate public functions with EMSCRIPTEN_KEEPALIVE
    if (!isPrivate && this.opts.target === 'wasm') {
      this.emit('EMSCRIPTEN_KEEPALIVE');
    }
    this.emit(`${sig} {`);
    this.indent++;

    // Emit default parameter fallback
    for (const p of node.params) {
      if (p.default) {
        const pName = translit(p.name);
        this.emit(`/* default: ${pName} */`);
        // In C we can't have default params; document only
      }
    }

    // Where block comes first (guards + defs before body)
    if (node.where) {
      this.genWhereBlock(node.where);
    }

    // Function body
    this.genFuncBody(node.body);

    this.indent--;
    this.emit('}');
    this.emit('');

    // Header declaration for public functions
    if (!isPrivate) {
      this.hLines.push(`${sig};`);
      this.publicFuncs.push(cName);
    }
  }

  private buildParamList(params: Param[]): string[] {
    const parts: string[] = [];
    for (const p of params) {
      const pName = translit(p.name);
      const ty = p.type;
      if (isMatrixType(ty)) {
        parts.push(`mc_num* ${pName}`, `int ${pName}_rows`, `int ${pName}_cols`);
      } else if (isArrayType(ty)) {
        parts.push(`mc_num* ${pName}`, `int ${pName}_len`);
      } else {
        parts.push(`${cType(ty)} ${pName}`);
      }
    }
    // If no params, use void
    return parts.length > 0 ? parts : ['void'];
  }

  private funcReturnType(_node: FuncDef): string {
    // In Phase 3 everything returns mc_num (or mc_num* for \pm)
    return 'mc_num';
  }

  // ── Where block ─────────────────────────────────────────────────────────────

  private genWhereBlock(where: WhereBlock): void {
    // Topological sort of defs will come in Phase 4; for now emit in order
    for (const line of where.lines) {
      if (line.kind === 'WhereDef') {
        const name = translit(line.name);
        const val = this.genExpr(line.value);
        this.emit(`mc_num ${name} = ${val};`);
      } else {
        // Guard: if (!cond) return NAN;
        const cond = this.genExpr(line.expr);
        this.emit(`if (!(${cond})) return NAN;`);
      }
    }
  }

  // ── Function body ────────────────────────────────────────────────────────────

  private genFuncBody(stmts: Stmt[]): void {
    if (stmts.length === 0) {
      this.emit('return NAN;');
      return;
    }

    for (let i = 0; i < stmts.length; i++) {
      const stmt = stmts[i]!;
      const isLast = i === stmts.length - 1;

      if (isLast && stmt.kind === 'ExprStmt') {
        // Implicit return: last expression
        const val = this.genExpr(stmt.expr);
        this.emit(`return ${val};`);
      } else {
        this.genStmt(stmt);
      }
    }
  }

  // ── Statements ───────────────────────────────────────────────────────────────

  private genStmt(stmt: Stmt): void {
    switch (stmt.kind) {
      case 'AssignStmt': this.genAssign(stmt);   break;
      case 'IfNode':     this.genIfNode(stmt);   break;
      case 'ForStmt':    this.genFor(stmt);       break;
      case 'WhileStmt':  this.genWhile(stmt);     break;
      case 'ExprStmt':   {
        const val = this.genExpr(stmt.expr);
        this.emit(`${val};`);
        break;
      }
    }
  }

  private genAssign(stmt: AssignStmt): void {
    const name = translit(stmt.name);
    const val = this.genExpr(stmt.value);
    // Emit declaration + assignment (first occurrence)
    this.emit(`mc_num ${name} = ${val};`);
  }

  private genIfNode(node: IfNode): void {
    const cond = this.genExpr(node.cond);

    if (!node.else_) {
      // Guard clause: if (!cond) return NAN;
      if (this.isInlineExprBranch(node.then)) {
        const val = this.genExpr(node.then as Expr);
        this.emit(`if (${cond}) return ${val};`);
      } else {
        this.emit(`if (${cond}) {`);
        this.indent++;
        this.genBranch(node.then);
        this.indent--;
        this.emit('}');
      }
      return;
    }

    this.emit(`if (${cond}) {`);
    this.indent++;
    this.genBranch(node.then);
    this.indent--;

    if (node.else_) {
      if (node.else_?.kind === 'IfNode') {
        this.emit('} else ');
        this.genIfNode(node.else_ as IfNode);
        return;
      }
      this.emit('} else {');
      this.indent++;
      this.genBranch(node.else_ as Expr | Stmt[]);
      this.indent--;
    }
    this.emit('}');
  }

  private isInlineExprBranch(branch: Expr | Stmt[]): boolean {
    return !Array.isArray(branch);
  }

  private genBranch(branch: Expr | Stmt[]): void {
    if (Array.isArray(branch)) {
      this.genFuncBody(branch);
    } else {
      const val = this.genExpr(branch as Expr);
      this.emit(`return ${val};`);
    }
  }

  private genFor(stmt: ForStmt): void {
    const v = translit(stmt.var);
    const lo = this.genExpr(stmt.lo);
    const hi = this.genExpr(stmt.hi);
    const step = stmt.step ? this.genExpr(stmt.step) : '1';
    this.emit(`for (int ${v} = (int)(${lo}); ${v} <= (int)(${hi}); ${v} += (int)(${step})) {`);
    this.indent++;
    // For body: treat all as statements (no implicit return inside loops)
    for (const s of stmt.body) {
      this.genStmt(s);
    }
    this.indent--;
    this.emit('}');
  }

  private genWhile(stmt: WhileStmt): void {
    const cond = this.genExpr(stmt.cond);
    this.emit(`while (${cond}) {`);
    this.indent++;
    for (const s of stmt.body) {
      this.genStmt(s);
    }
    this.indent--;
    this.emit('}');
  }

  // ── Expressions ──────────────────────────────────────────────────────────────

  genExpr(expr: Expr): string {
    switch (expr.kind) {
      case 'NumberLit':   return this.genNumber(expr);
      case 'BoolLit':     return expr.value ? '1' : '0';
      case 'IdentExpr':   return this.genIdent(expr);
      case 'BinaryExpr':  return this.genBinary(expr);
      case 'UnaryExpr':   return this.genUnary(expr);
      case 'FuncCallExpr':return this.genFuncCall(expr);
      case 'IfExpr':      return this.genIfExpr(expr);
      case 'IndexExpr':   return this.genIndex(expr);
      case 'SliceExpr':   return this.genSlice(expr);
      case 'MemberExpr':  return this.genMember(expr);
      case 'ArrayLit':    return this.genArrayLit(expr);
      case 'MatrixLit':   return this.genMatrixLit(expr);
      case 'FracExpr':    return this.genFrac(expr);
      case 'SqrtExpr':    return this.genSqrt(expr);
      case 'AbsExpr':     return `fabs(${this.genExpr(expr.operand)})`;
      case 'NormExpr':    return this.genNorm(expr);
      case 'FloorExpr':   return `floor(${this.genExpr(expr.operand)})`;
      case 'CeilExpr':    return `ceil(${this.genExpr(expr.operand)})`;
      case 'PmExpr':      return this.genPm(expr);
      case 'CasesExpr':   return this.genCases(expr);
      case 'SumExpr':     return this.genSum(expr);
      case 'PostfixExpr': return this.genPostfix(expr);
      case 'ChainCmpExpr':return this.genChainCmp(expr);
      case 'LimExpr':     return this.genLim(expr);
      case 'DerivExpr':   return this.genDeriv(expr);
      case 'IntegralExpr':return this.genIntegral(expr);
      case 'SolveExpr':   return this.genSolve(expr);
      case 'StringLitExpr': return `"${(expr as StringLitExpr).value}"`;
      case 'TableExpr':   throw new Error('TableExpr must be a top-level const value');
      default:
        throw new Error(`Unknown expr kind: ${(expr as Expr).kind}`);
    }
  }

  private genNumber(expr: NumberLit): string {
    if (isNaN(expr.value)) return 'NAN';
    if (!isFinite(expr.value)) return expr.value > 0 ? 'INFINITY' : '-INFINITY';
    const s = expr.raw ?? String(expr.value);
    // Ensure it looks like a C double literal
    return s.includes('.') || s.includes('e') || s.includes('E') ? s : `${s}.0`;
  }

  private genIdent(expr: IdentExpr): string {
    const override = this.varOverride.get(expr.name);
    if (override !== undefined) return override;
    const builtin = BUILTIN_CONSTS.get(expr.name);
    if (builtin) return builtin;
    return translit(expr.name);
  }

  private inferType(expr: Expr): McType | undefined {
    if (expr.kind === 'IdentExpr') return this.typeEnv.get(expr.name);
    return undefined;
  }

  private inferLenExpr(expr: Expr): string {
    if (expr.kind === 'IdentExpr') {
      const name = translit(expr.name);
      const ty = this.typeEnv.get(expr.name);
      if (isMatrixType(ty)) return `${name}_rows, ${name}_cols`;
      if (isArrayType(ty)) return `${name}_len`;
    }
    return '0';
  }

  private genBinary(expr: BinaryExpr): string {
    if (expr.op === '⋅') return this.genDot(expr);
    if (expr.op === '⨯') return this.genCross(expr);
    const l = this.genExpr(expr.left);
    const r = this.genExpr(expr.right);
    switch (expr.op) {
      case '+':  return `(${l} + ${r})`;
      case '-':  return `(${l} - ${r})`;
      case '*':  return `(${l} * ${r})`;
      case '/':
      case '÷':  return `(${l} / ${r})`;
      case '%':  return `fmod(${l}, ${r})`;
      case '^':  return `pow(${l}, ${r})`;
      case '**': return `pow(${l}, ${r})`;
      case '.*': return `(${l} * ${r})`; // element-wise scalar fallback
      case '==': return `((${l}) == (${r}) ? 1.0 : 0.0)`;
      case '!=':
      case '≠':  return `((${l}) != (${r}) ? 1.0 : 0.0)`;
      case '<':  return `((${l}) < (${r}) ? 1.0 : 0.0)`;
      case '>':  return `((${l}) > (${r}) ? 1.0 : 0.0)`;
      case '<=':
      case '≤':  return `((${l}) <= (${r}) ? 1.0 : 0.0)`;
      case '>=':
      case '≥':  return `((${l}) >= (${r}) ? 1.0 : 0.0)`;
      case '&&': return `((${l}) && (${r}) ? 1.0 : 0.0)`;
      case '||': return `((${l}) || (${r}) ? 1.0 : 0.0)`;
      case 'xor': return `(((${l}) != 0.0) ^ ((${r}) != 0.0) ? 1.0 : 0.0)`;
      case '∈':  return `((${l}) >= (${r}))`;
      case '∉':  return `(!((${l}) >= (${r})))`;
      default:   return `(${l} /* ${expr.op} */ ${r})`;
    }
  }

  private genDot(expr: BinaryExpr): string {
    const lTy = this.inferType(expr.left);
    const rTy = this.inferType(expr.right);
    const l = this.genExpr(expr.left);
    const r = this.genExpr(expr.right);
    if (isMatrixType(lTy) && isMatrixType(rTy)) {
      const lInfo = this.inferLenExpr(expr.left);
      return `/* matmul(${l}, ${r}, result, ${lInfo}) */0.0`;
    }
    if (isArrayType(lTy) && isArrayType(rTy)) {
      const len = this.inferLenExpr(expr.left);
      return `mc_dot(${l}, ${r}, ${len})`;
    }
    return `(${l} * ${r})`;
  }

  private genCross(expr: BinaryExpr): string {
    const l = this.genExpr(expr.left);
    const r = this.genExpr(expr.right);
    return `mc_cross3(${l}, ${r})`;
  }

  private genUnary(expr: UnaryExpr): string {
    const inner = this.genExpr(expr.operand);
    switch (expr.op) {
      case '-':   return `(-(${inner}))`;
      case '!':
      case 'not': return `(!(${inner}) ? 1.0 : 0.0)`;
      default:    return `(-(${inner}))`;
    }
  }

  private genFuncCall(expr: FuncCallExpr): string {
    // Numeric table lookup → mc_interp
    if (this.tableKind.get(expr.name) === 'numeric' && expr.args.length === 1) {
      const cname = translit(expr.name);
      const x = this.genExpr(expr.args[0]!);
      return `mc_interp(${x}, _${cname}_xs, _${cname}_ys, _${cname}_n)`;
    }

    // \log_{base}{x} → log(x) / log(base)
    if (expr.name === '__log_base' && expr.args.length === 2) {
      const x = this.genExpr(expr.args[0]!);
      const base = this.genExpr(expr.args[1]!);
      return `(log(${x}) / log(${base}))`;
    }

    // min/max dispatch: 1 array arg → mc_min_arr / mc_max_arr; 2 scalar args → fmin/fmax
    if ((expr.name === 'min' || expr.name === 'max') && expr.args.length === 1) {
      const arg = expr.args[0]!;
      const ty = this.inferType(arg);
      if (isArrayType(ty)) {
        const v = this.genExpr(arg);
        const len = this.inferLenExpr(arg);
        return `${expr.name === 'min' ? 'mc_min_arr' : 'mc_max_arr'}(${v}, ${len})`;
      }
    }

    // Array aggregators: sum(v), product(v), mean(v), std(v), norm(v) with typed arg
    const arrAgg = new Set(['sum', 'product', 'mean', 'std', 'norm']);
    if (arrAgg.has(expr.name) && expr.args.length === 1) {
      const arg = expr.args[0]!;
      const ty = this.inferType(arg);
      if (isArrayType(ty)) {
        const v = this.genExpr(arg);
        const len = this.inferLenExpr(arg);
        const fn = expr.name === 'norm' ? 'mc_norm' : `mc_${expr.name}`;
        return `${fn}(${v}, ${len})`;
      }
    }

    const args = expr.args.map(a => this.genExpr(a)).join(', ');
    const name = translit(expr.name);
    const mapped = FUNC_MAP.get(name) ?? name;
    return `${mapped}(${args})`;
  }

  private genIfExpr(expr: IfExpr): string {
    const cond = this.genExpr(expr.cond);
    const then = this.genExpr(expr.then);
    const else_ = this.genExpr(expr.else_);
    return `((${cond}) ? (${then}) : (${else_}))`;
  }

  private genIndex(expr: IndexExpr): string {
    // m[i][j] → m[(int)(i)*m_cols+(int)(j)] for 2D arrays
    if (expr.object.kind === 'IndexExpr') {
      const inner = expr.object;
      if (inner.object.kind === 'IdentExpr') {
        const name = inner.object.name;
        const ty = this.typeEnv.get(name);
        if (isMatrixType(ty)) {
          const m = translit(name);
          const i = this.genExpr(inner.index);
          const j = this.genExpr(expr.index);
          return `${m}[(int)(${i})*${m}_cols+(int)(${j})]`;
        }
      }
    }
    const obj = this.genExpr(expr.object);
    const idx = this.genExpr(expr.index);
    return `${obj}[(int)(${idx})]`;
  }

  private genSlice(expr: SliceExpr): string {
    // v[a..b] → pointer into v starting at a
    const obj = this.genExpr(expr.object);
    if (expr.lo) {
      const lo = this.genExpr(expr.lo);
      return `(${obj} + (int)(${lo}))`;
    }
    return obj;
  }

  private genMember(expr: MemberExpr): string {
    if (expr.object.kind === 'IdentExpr') {
      const obj = translit(expr.object.name);
      switch (expr.member) {
        case 'length': return `${obj}_len`;
        case 'rows':   return `${obj}_rows`;
        case 'cols':   return `${obj}_cols`;
      }
    }
    return `${this.genExpr(expr.object)}.${expr.member}`;
  }

  private genArrayLit(expr: ArrayLit): string {
    // C99 compound literal: (mc_num[]){1.0, 2.0, 3.0}
    const elems = expr.elements.map(e => this.genExpr(e)).join(', ');
    return `((mc_num[]){${elems}})`;
  }

  private genMatrixLit(expr: MatrixLit): string {
    // Flat compound literal row-major: (mc_num[]){r0c0, r0c1, r1c0, r1c1, ...}
    const elems: string[] = [];
    for (const row of expr.rows) {
      for (const el of row.elements) {
        elems.push(this.genExpr(el));
      }
    }
    return `((mc_num[]){${elems.join(', ')}})`;
  }

  private genFrac(expr: FracExpr): string {
    const n = this.genExpr(expr.num);
    const d = this.genExpr(expr.den);
    return `((${n}) / (${d}))`;
  }

  private genSqrt(expr: SqrtExpr): string {
    const r = this.genExpr(expr.radicand);
    if (!expr.degree) return `sqrt(${r})`;
    const deg = this.genExpr(expr.degree);
    return `pow(${r}, 1.0 / (${deg}))`;
  }

  private genNorm(expr: NormExpr): string {
    if (expr.operand.kind === 'IdentExpr') {
      const name = translit(expr.operand.name);
      return `mc_norm(${name}, ${name}_len)`;
    }
    return `fabs(${this.genExpr(expr.operand)})`;
  }

  private genPm(expr: PmExpr): string {
    // \pm expr → (mc_num[]){+(x), -(x)} — C99 compound literal array of 2
    const inner = this.genExpr(expr.operand);
    return `((mc_num[]){+(${inner}), -(${inner})})`;
  }

  private genCases(expr: CasesExpr): string {
    // \begin{cases} ... \end{cases} — generate nested ternary
    let result = expr.else_ ? this.genExpr(expr.else_) : 'NAN';
    for (let i = expr.cases.length - 1; i >= 0; i--) {
      const { value, cond } = expr.cases[i]!;
      result = `((${this.genExpr(cond)}) ? (${this.genExpr(value)}) : (${result}))`;
    }
    return result;
  }

  private genSum(expr: SumExpr): string {
    // Generate a block expression — we need a helper variable
    // For now generate as a statement-expression using a temp variable name
    const tmpAcc = `_acc_${this._tmpIdx++}`;
    const v = translit(expr.var);

    if (expr.iterKind === 'range') {
      const lo = this.genExpr(expr.lo!);
      const hi = this.genExpr(expr.hi!);
      const body = this.genExpr(expr.body);
      const op = expr.op === 'sum' ? '+=' :
                 expr.op === 'prod' ? '*=' : '+=';
      const init = expr.op === 'prod' ? '1.0' : '0.0';

      this.emit(`mc_num ${tmpAcc} = ${init};`);
      this.emit(`for (int ${v} = (int)(${lo}); ${v} <= (int)(${hi}); ${v}++) {`);
      this.indent++;
      if (expr.op === 'min') {
        this.emit(`if (${v} == (int)(${lo}) || ${body} < ${tmpAcc}) ${tmpAcc} = ${body};`);
      } else if (expr.op === 'max') {
        this.emit(`if (${v} == (int)(${lo}) || ${body} > ${tmpAcc}) ${tmpAcc} = ${body};`);
      } else {
        this.emit(`${tmpAcc} ${op} ${body};`);
      }
      this.indent--;
      this.emit('}');
      return tmpAcc;
    } else {
      // array iteration: \sum_{x \in v}
      const arrName = translit(expr.array ?? '_arr');
      const body = this.genExpr(expr.body);
      const op = expr.op === 'sum' ? '+=' : '*=';
      const init = expr.op === 'prod' ? '1.0' : '0.0';
      const tmpIdx = `_i_${this._tmpIdx++}`;

      this.emit(`mc_num ${tmpAcc} = ${init};`);
      this.emit(`for (int ${tmpIdx} = 0; ${tmpIdx} < ${arrName}_len; ${tmpIdx}++) {`);
      this.indent++;
      this.emit(`mc_num ${v} = ${arrName}[${tmpIdx}];`);
      this.emit(`${tmpAcc} ${op} ${body};`);
      this.indent--;
      this.emit('}');
      return tmpAcc;
    }
  }

  private _tmpIdx = 0;

  private genPostfix(expr: PostfixExpr): string {
    const inner = this.genExpr(expr.operand);
    if (expr.op === '!') {
      // Factorial — use mc_factorial helper
      return `mc_factorial((int)(${inner}))`;
    }
    // Degree → radians
    return `((${inner}) * (M_PI / 180.0))`;
  }

  // ── Phase 7 — numerical methods ───────────────────────────────────────────────

  private genLim(expr: LimExpr): string {
    const n = this._tmpIdx++;
    const acc = `_lim_${n}`;
    const v = translit(expr.var);
    const toVal = expr.toInf
      ? '1e15'
      : `(${this.genExpr(expr.to)}) + 1e-9`;
    // Emit local variable block: { mc_num x = to; _lim = body; }
    this.emit(`mc_num ${acc};`);
    this.emit(`{ mc_num ${v} = ${toVal}; ${acc} = (${this.genExpr(expr.body)}); }`);
    return acc;
  }

  private genDeriv(expr: DerivExpr): string {
    const h = '1e-7';
    const v = expr.var;
    const cv = translit(v);
    // Generate body with x → (x + h)
    this.varOverride.set(v, `(${cv} + ${h})`);
    const bodyH = this.genExpr(expr.body);
    this.varOverride.delete(v);
    const body0 = this.genExpr(expr.body);
    return `((${bodyH}) - (${body0})) / ${h}`;
  }

  private genIntegral(expr: IntegralExpr): string {
    const n = this._tmpIdx++;
    const acc = `_int_${n}`;
    const lo = this.genExpr(expr.lo);
    const hi = this.genExpr(expr.hi);
    const v = translit(expr.var);
    // Emit loop — Simpson's rule, N=1000 steps
    this.emit(`mc_num ${acc} = 0.0;`);
    this.emit(`{ int _N${n}=1000; mc_num _h${n}=((${hi})-(${lo}))/_N${n};`);
    this.emit(`  for(int _i${n}=0;_i${n}<=_N${n};_i${n}++){`);
    this.emit(`    mc_num ${v}=(${lo})+_i${n}*_h${n};`);
    this.emit(`    mc_num _w${n}=(_i${n}==0||_i${n}==_N${n})?1.0:(_i${n}%2==0)?2.0:4.0;`);
    this.emit(`    ${acc}+=_w${n}*(${this.genExpr(expr.body)}); }`);
    this.emit(`  ${acc}*=_h${n}/3.0; }`);
    return acc;
  }

  private genSolve(expr: SolveExpr): string {
    const n = this._tmpIdx++;
    const res = `_sol_${n}`;
    const v = expr.var;
    const cv = translit(v);
    const lo = this.genExpr(expr.lo);
    const hi = this.genExpr(expr.hi);
    // Generate body at lo for initial sign
    this.varOverride.set(v, `_lo${n}`);
    const bodyLo = this.genExpr(expr.body);
    this.varOverride.delete(v);
    // Generate body at midpoint (uses cv which is set inside loop)
    const bodyMid = this.genExpr(expr.body);
    this.emit(`mc_num ${res} = NAN;`);
    this.emit(`{ mc_num _lo${n}=(${lo}),_hi${n}=(${hi}),_fl${n}=(${bodyLo});`);
    this.emit(`  for(int _i${n}=0;_i${n}<100;_i${n}++){`);
    this.emit(`    mc_num ${cv}=(_lo${n}+_hi${n})*0.5;`);
    this.emit(`    mc_num _fm${n}=(${bodyMid});`);
    this.emit(`    if(fabs(_fm${n})<1e-9){${res}=${cv};break;}`);
    this.emit(`    if(_fl${n}*_fm${n}<0.0)_hi${n}=${cv};else{_lo${n}=${cv};_fl${n}=_fm${n};}}`);
    this.emit(`  if(isnan(${res}))${res}=(_lo${n}+_hi${n})*0.5; }`);
    return res;
  }

  private genChainCmp(expr: ChainCmpExpr): string {
    // 0 < x < 10  →  ((0 < x) && (x < 10))
    const parts: string[] = [];
    for (let i = 0; i < expr.ops.length; i++) {
      const l = this.genExpr(expr.parts[i]!);
      const r = this.genExpr(expr.parts[i + 1]!);
      const op = this.cmpOpStr(expr.ops[i]!);
      parts.push(`(${l}) ${op} (${r})`);
    }
    return `(${parts.join(' && ')})`;
  }

  private cmpOpStr(op: string): string {
    switch (op) {
      case '==': return '==';
      case '!=':
      case '≠':  return '!=';
      case '<':  return '<';
      case '>':  return '>';
      case '<=':
      case '≤':  return '<=';
      case '>=':
      case '≥':  return '>=';
      default:   return op;
    }
  }

  // ── Emit helpers ─────────────────────────────────────────────────────────────

  private emit(line: string): void {
    const prefix = '  '.repeat(this.indent);
    this.lines.push(prefix + line);
  }
}

// ── Function name mapping ─────────────────────────────────────────────────────

const FUNC_MAP: ReadonlyMap<string, string> = new Map([
  ['sin',    'sin'],   ['cos',    'cos'],   ['tan',    'tan'],
  ['cot',    '(1.0/tan)'], // special — handled below
  ['asin',   'asin'],  ['acos',   'acos'],  ['atan',   'atan'],
  ['arcsin', 'asin'],  ['arccos', 'acos'],  ['arctan', 'atan'],
  ['sinh',   'sinh'],  ['cosh',   'cosh'],  ['tanh',   'tanh'],
  ['ln',     'log'],   ['log',    'log'],   ['log10',  'log10'],
  ['exp',    'exp'],   ['sqrt',   'sqrt'],  ['abs',    'fabs'],
  ['floor',  'floor'], ['ceil',   'ceil'],  ['round',  'round'],
  ['fabs',   'fabs'],  ['pow',    'pow'],   ['fmod',   'fmod'],
  ['fmin',   'fmin'],  ['fmax',   'fmax'],
  ['min',    'fmin'],  ['max',    'fmax'],
  ['std',    'mc_std'],  ['mean',   'mc_mean'],
  ['tgamma', 'tgamma'],  ['erf',    'erf'],
  ['gcd',    'mc_gcd'],  ['lcm',    'mc_lcm'],
  ['sgn',    'mc_sgn'],  ['binom',  'mc_binom'],
  ['norm',   'mc_norm'],
  ['dot',    'mc_dot'],  ['cross',  'mc_cross3'],
  ['sum',    'mc_sum'],  ['product','mc_product'],
  ['min',    'fmin'],    ['max',    'fmax'],
  ['is_nan',    'isnan'],  ['is_inf',    'isinf'],  ['is_finite', 'isfinite'],
  ['atan2',  'atan2'],   ['hypot', 'hypot'],
]);

export function generateC(ast: File, opts?: CgenOptions): CgenOutput {
  return new CGenerator(ast, opts).generate();
}
