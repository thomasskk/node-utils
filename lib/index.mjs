import*as e from"htmlparser2";import r from"fs";import t from"stream";const n="_parent",s=e=>{const r=e.trim(),t=r.toLowerCase();return"true"===t||"false"!==t&&r},o=r=>{let t={},o="";const a=new e.Parser({onopentag:(e,r)=>{const a=(e=>{const r={};for(const t of Object.keys(e))r[t]=s(e[t]?.trim());return r})(r);o=e;const c=Object.keys(a).length>0,i=c?a:{};t[e]?(Array.isArray(t[e])||(t[e]=[t[e]]),c&&t[e].push(i)):t[e]=i,i[n]=t,t=i},ontext:e=>{if(0===Object.keys(t).length)return;if(!e.trim())return;const r=s(e),a="boolean"==typeof r?r:(e=>e.split("\n").map((e=>e.trim())).join(""))(e),c=t[n];Object.keys(c[o]).length>1&&!Array.isArray(c[o])&&(c[o]=[t]),Array.isArray(c[o])?c[o].push(a):c[o]=a},onclosetag:()=>{const e=t[n];delete t[n],t=e}},{xmlMode:!0});return a.write(r),a.end(),t},a="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0),c=2,i=4,f=8,y=1,l=1,u=2,p=2,b=4,g=4,h=4,m=8,A=e=>{let r=0;return r=null!==e&&"object"==typeof e?(e=>{let r=0;try{let t=e;switch(!0){case e instanceof Map:t=Object.fromEntries(e);break;case e instanceof Set:t=Array.from(e);break;case e instanceof Int8Array:return e.length*y;case e instanceof Uint8Array||e instanceof Uint8ClampedArray:return e.length*l;case e instanceof Int16Array:return e.length*u;case e instanceof Uint16Array:return e.length*p;case e instanceof Int32Array:return e.length*b;case e instanceof Uint32Array:return e.length*g;case e instanceof Float32Array:return e.length*h;case e instanceof Float64Array:return e.length*m}const n=JSON.stringify(t);r=Buffer.from(n).byteLength}catch(e){return console.error("Error detected, return -1",e),-1}return r})(e):(e=>{const r=[],t=[e];let n=0;for(;t.length;){const e=t.pop();switch(typeof e){case"boolean":n+=i;break;case"string":n+=""===(s=e)?4:Buffer.from(s).byteLength;break;case"number":n+=f;break;case"symbol":n+=(e.toString().length-8)*c;break;case"bigint":n+=Buffer.from(String(e)).byteLength;break;case"function":n+=e.toString().length;break;case"object":if(-1===r.indexOf(e)){r.push(e);for(const r in e)t.push(e[r])}}}var s;return n})(e),(e=>{let r=0;for(;e>=1e3&&++r;)e/=1e3;return`${e.toFixed(e<10&&r>0?1:0)} ${["Bytes","KB","MB","GB"][r]}`})(r)},d=(e,r)=>e in r,k=async e=>{const{url:n,path:s}=e;try{const e=await fetch(n);if(!e.body)return{error:"No body in response",success:!1};const o=t.Readable.fromWeb(e.body),a=r.createWriteStream(s);return await t.promises.finished(o.pipe(a)),{success:!0}}catch(e){return{error:j(e),success:!1}}},j=e=>"object"==typeof e&&null!==e&&"message"in e&&"string"==typeof e.message?e.message:"Unknown error",w=async e=>{try{return(await r.promises.stat(e)).isDirectory()}catch(e){return!1}};export{k as download,j as getErrorMessage,w as isDir,a as isNodeEnv,A as sizeof,d as valueInObj,o as xml2js};
