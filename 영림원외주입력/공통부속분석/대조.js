const fs=require('fs'); global.window={};
eval(fs.readFileSync(process.argv[2],'utf8'));
const data=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const idx=window.발주상품검색.same7Index(data);
const mine=JSON.parse(fs.readFileSync(process.argv[4],'utf8')).groups;
const ka=Object.keys(idx).sort(), kb=Object.keys(mine).sort();
let diff=0; if(ka.join('\n')!==kb.join('\n')) {diff++; console.log('키 다름', ka.length, kb.length);}
for(const k of ka){ const a=[...idx[k]].sort().join('\n'), b=[...(mine[k]||[])].sort().join('\n'); if(a!==b){diff++; if(diff<5) console.log('다름',k);} }
console.log('same7Index 키', ka.length, '공통(2상품 이상)', ka.filter(k=>idx[k].length>=2).length, '다름', diff);
