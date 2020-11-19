let Decimal = require('./break_infinity.min.js');
let ADNotations = require('./ad-notations.min.js');
let fs = require('fs');

function format (x) {
  return (new ADNotations.ScientificNotation()).format(x, 3, 3);
}

function formatInt (x) {
  return (new ADNotations.ScientificNotation()).format(x, 3, 0);
}

let p = function (x) {
  return (x.endsWith('P') || x.endsWith('power')) ? x : (x.endsWith('y') ? x.slice(0, -1) + 'ies' : x + 's');
}

let getFormatter = function (b) {
  return b ? formatInt : format;
}

let f = function (save, saveNumber) {
  let o = JSON.parse(Buffer.from(save, 'base64').toString());
  let results = [
    new Decimal(o.stars), new Decimal(o.prestigePower),
    o.infinities, new Decimal(o.infinityPoints),
    new Decimal(o.eternities), new Decimal(o.eternityPoints),
    o.complexities, new Decimal(o.complexityPoints),
    o.finalities, new Decimal(o.finalityPoints),
  ];
  let conds = [
    true, Decimal.gt(o.prestigePower, 1),
    o.infinities > 0, o.infinities > 0,
    Decimal.gt(o.eternities, 0), Decimal.gt(o.eternities, 0),
    o.complexities > 0, o.complexities > 0,
    o.finalities > 0, o.finalities > 0,
  ];
  conds = conds.map((_, i, l) => l.slice(i).some(x => x));
  let words = ['star', 'prestige power', 'infinity', 'IP', 'eternity', 'EP', 'complexity', 'ℂP', 'finality', 'FP'];
  let ints = [false, false, true, true, true, true, true, true, true, true];
  return 'Save ' + saveNumber + ', with ' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
    i => conds[i]
  ).map(
    i => getFormatter(ints[i])(results[i]) + ' ' + (Decimal.eq(results[i], 1) ? words[i] : p(words[i]))
  ).join(', ') + ':' + '\n' + save;
}

let g = function (text) {
  let saves = text.split('\n').filter(i => i);
  return saves.map((s, i) => f(s, i + 1)).join('\n\n') + '\n';
}

let f1 = process.argv[2];
let f2 = process.argv[3];

fs.readFile(f1, 'utf8', function (err, data) {let res = g(data); fs.writeFile(f2, res, () => 0)});
