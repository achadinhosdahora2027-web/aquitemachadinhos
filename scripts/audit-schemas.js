#!/usr/bin/env node
/**
 * AUDITORIA REAL DE SCHEMAS (substitui o comando que imprimia numeros inventados).
 *
 * ANTES (package.json):
 *   "audit:schemas": "node -e 'console.log(JSON.stringify({files:2105,products:0,events:1,errors:0}))'"
 * Ou seja: contava 0 arquivos, 0 produtos e sempre reportava 0 erros, com numeros
 * fixos no codigo. Nunca abriu um arquivo. O "2105" nao correspondia a nada:
 * o site tem 3.405 paginas HTML e 22 ofertas no catalogo.
 */
const fs=require('fs'),path=require('path');
const PUB=path.join(__dirname,'..','public');
const DATA=path.join(__dirname,'..','data');
const out={files:0,jsonld:0,sem_jsonld:0,tipos:{},errors:[]};
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);
 if(e.isDirectory())walk(f); else if(e.name.endsWith('.html')){
   out.files++; const s=fs.readFileSync(f,'utf8');
   const blocks=[...s.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
   if(!blocks.length){out.sem_jsonld++;continue;}
   for(const b of blocks){ try{ const j=JSON.parse(b[1].trim());
       const list=Array.isArray(j)?j:(j['@graph']||[j]);
       for(const n of list){ if(n&&n['@type']){const t=Array.isArray(n['@type'])?n['@type'].join('+'):n['@type']; out.tipos[t]=(out.tipos[t]||0)+1;} }
       out.jsonld++;
     }catch(err){ out.errors.push(`${path.relative(PUB,f)}: JSON-LD invalido (${err.message})`);} }
 }}})(PUB);
// catalogo de ofertas
try{ const c=JSON.parse(fs.readFileSync(path.join(DATA,'brazilian-viral-deals-catalog.json'),'utf8'));
  out.ofertas=c.deals.length; out.ofertas_ativas=c.deals.filter(x=>x.active!==false).length; }catch(e){ out.ofertas=0; }
console.log(JSON.stringify(out,null,2));
if(out.errors.length){ console.error(`\n❌ ${out.errors.length} bloco(s) de JSON-LD invalido(s)`); process.exit(1); }
console.log('\n✅ Schemas validos.');
