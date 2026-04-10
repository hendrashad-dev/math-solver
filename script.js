const m = window.math;

const ui = {
  sb: document.getElementById('sb'),
  eq: document.getElementById('eq'),
  res: document.getElementById('res'),
  sl: document.getElementById('sl'),
  hb: document.getElementById('hb'),
  hp: document.getElementById('hp'),
  cb: document.getElementById('cb'),
  hl: document.getElementById('hl')
};

function start() {
  clicks();
}

function clicks() {
  ui.sb.addEventListener('click', solve);
  ui.eq.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') solve();
  });
  
  ui.hb.addEventListener('click', () => {
    ui.hp.classList.remove('display-none');
    getPast();
  });
  
  ui.cb.addEventListener('click', () => {
    ui.hp.classList.add('display-none');
  });
}

async function solve() {
  const txt = ui.eq.value.trim();
  if (!txt) return;

  wait(true);
  
  await new Promise(r => setTimeout(r, 600));
  
  try {
    const r = doMath(txt);
    showMe(r.s);
    keep(txt, r.ans);
  } catch (err) {
    oops(err.message);
  } finally {
    wait(false);
  }
}

function doMath(str) {
  const s = [];
  let ans = "";

  try {
    s.push(`1. Analyze equation: <br><span class='math-bold'>${str}</span>`);
    
    let n = str.replace(' ', '');
    if (!n.includes('=')) {
      n += '=0';
    }
    
    const p = n.split('=');
    const l = p[0];
    const r = p[1] || '0';
    
    const expr = `(${l}) - (${r})`;
    const simp = m.simplify(expr).toString();
    
    s.push(`2. Convert to standard form <span class='math-var'>P(x) = 0</span>:<br><span class='math-bold'>${simp} = 0</span>`);
    
    const node = m.parse(simp);
    const vars = [];
    node.traverse((node) => {
      if (node.isSymbolNode && !m[node.name]) {
        if (!vars.includes(node.name)) vars.push(node.name);
      }
    });
    
    const v = vars[0] || 'x';
    s.push(`3. Solving for <span class='math-var'>${v}</span>...`);

    const res = getAnswers(simp, v);
    
    if (res.length === 0) {
      s.push("No real solutions found or equation too complex for current solver.");
      ans = "None found";
    } else {
      s.push(`Found <span class='math-bold'>${res.length}</span> solution(s).`);
      res.forEach((r, i) => {
        s.push(`<b>Solution ${i+1}:</b> <span class='math-var'>${v}</span> = <span class='math-bold'>${r}</span>`);
      });
      ans = res.join(', ');
    }

    return { s, ans };
  } catch (e) {
    throw new Error(`Parse error: ${e.message}`);
  }
}

function getAnswers(expr, vName) {
  try {
    const rs = [];
    
    const f = (val) => {
      const scope = {};
      scope[vName] = val;
      return m.evaluate(expr, scope);
    };

    const c = f(0);
    const f1 = f(1);
    const fm1 = f(-1);
    
    const a = (f1 + fm1 - 2*c) / 2;
    const b = (f1 - fm1) / 2;
    
    const f2 = f(2);
    const expectedF2 = a * 4 + b * 2 + c;
    
    if (Math.abs(f2 - expectedF2) < 1e-9) {
      if (Math.abs(a) < 1e-9) {
        if (Math.abs(b) > 1e-9) {
          rs.push(round(-c / b));
        }
      } else {
        const disc = b * b - 4 * a * c;
        if (disc > 0) {
          rs.push(round((-b + Math.sqrt(disc)) / (2 * a)));
          rs.push(round((-b - Math.sqrt(disc)) / (2 * a)));
        } else if (Math.abs(disc) < 1e-9) {
          rs.push(round(-b / (2 * a)));
        } else {
          const re = round(-b / (2 * a));
          const im = round(Math.sqrt(-disc) / (2 * a));
          rs.push(`${re} + ${im}i`);
          rs.push(`${re} - ${im}i`);
        }
      }

    } else {
      for (let x = -100; x <= 100; x += 0.5) {
        if (f(x) * f(x + 0.5) <= 0) {
           let low = x, high = x+0.5;
           for(let i=0; i<20; i++) {
             let mid = (low+high)/2;
             if(f(low)*f(mid) <= 0) high = mid;
             else low = mid;
           }
           const r = round((low+high)/2);
           if (!rs.includes(r)) rs.push(r);
        }
      }
    }
    
    return [...new Set(rs)];
  } catch (e) {
    return [];
  }
}

function round(n) {
  return Number(n.toFixed(4)).toString();
}

function wait(on) {
  ui.sb.disabled = on;
  ui.sb.textContent = on ? 'Solving...' : 'Solve';
  
  if (on) {
    ui.sl.innerHTML = '';
    ui.res.classList.remove('display-none');
  }
}

function showMe(s) {
  ui.sl.innerHTML = '';
  s.forEach((h, i) => {
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = h;
    el.style.animationDelay = `${i * 0.15}s`;
    ui.sl.appendChild(el);
  });
}

function oops(msg) {
  ui.sl.innerHTML = `<div class="item"><span class="math-op">Error:</span> ${msg}</div>`;
}

function past() {
  const d = localStorage.getItem('math_history');
  return d ? JSON.parse(d) : [];
}

function keep(eq, ans) {
  const h = past();
  const i = {
    id: Date.now(),
    equation: eq,
    roots: ans,
    note: '',
    created_at: new Date().toISOString()
  };
  h.unshift(i);
  localStorage.setItem('math_history', JSON.stringify(h.slice(0, 50)));
}

function getPast() {
  const its = past();
  list(its);
}

function list(its) {
  if (its.length === 0) {
    ui.hl.innerHTML = '<p class="dialogue-text">No history yet.</p>';
    return;
  }
  
  ui.hl.innerHTML = its.map(i => `
    <div class="hItem" data-id="${i.id}">
      <span class="eq">${i.equation}</span>
      <span class="rt"><b>Roots:</b> ${i.roots}</span>
      <i>${i.note || 'No note added.'}</i>
      <div class="hActions">
        <button class="btn sBtn nBtn">Add Note</button>
        <button class="btn sBtn dBtn">Delete</button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.dBtn').forEach(b => {
    b.addEventListener('click', kill);
  });
  
  document.querySelectorAll('.nBtn').forEach(b => {
    b.addEventListener('click', note);
  });
}

function kill(e) {
  const id = parseInt(e.target.closest('.hItem').dataset.id);
  const h = past().filter(i => i.id !== id);
  localStorage.setItem('math_history', JSON.stringify(h));
  getPast();
}

function note(e) {
  const id = parseInt(e.target.closest('.hItem').dataset.id);
  const n = prompt("Enter a note for this equation:");
  if (n !== null) {
    const h = past().map(i => {
      if (i.id === id) i.note = n;
      return i;
    });
    localStorage.setItem('math_history', JSON.stringify(h));
    getPast();
  }
}

document.addEventListener('DOMContentLoaded', start);
