const numbers = {
  'add' : (a, b) => a + b
};

const map = (m, fn) => m.map((row, i) => row.map((el, j) => fn(el, i, j)));
const add = (m1, m2) => map(m1, (el, i, j) => el + m2[i][j]);
const opposite = m => map(m, el => -el);
const sub = (m1, m2) => add(m1, opposite(m2));
const prod = (m1, m2) => map(m1, (_, i, j) => m1.map((_, k) => m1[i][k] * m2[k][j]).reduce(numbers.add));
const comute = (m1, m2) => sub(prod(m1, m2), prod(m2, m1));

let H = [[1, 0, 0], [0, 2, 0], [0, 0, 2]];
let A = [[0, 1, 0], [1, 0, 0], [0, 0, 2]];
let B = [[2, 0, 0], [0, 0, 1], [0, 1, 0]];

console.log('[H, A]', comute(H, A));
console.log('[H, B]', comute(H, B));
console.log('[A, B]', comute(A, B));
