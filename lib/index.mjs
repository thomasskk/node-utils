import*as e from"htmlparser2";const t="_parent",r=e=>{const t=e.trim(),r=t.toLowerCase();return"true"===r||"false"!==r&&t},n=n=>{let o={},s="";const a=new e.Parser({onopentag:(e,n)=>{const a=(e=>{const t={};for(const n of Object.keys(e))t[n]=r(e[n]?.trim());return t})(n);s=e;const c=Object.keys(a).length>0,i=c?a:{};o[e]?(Array.isArray(o[e])||(o[e]=[o[e]]),c&&o[e].push(i)):o[e]=i,i[t]=o,o=i},ontext:e=>{if(0===Object.keys(o).length)return;if(!e.trim())return;const n=r(e),a="boolean"==typeof n?n:(e=>e.split("\n").map((e=>e.trim())).join(""))(e),c=o[t];Object.keys(c[s]).length>1&&!Array.isArray(c[s])&&(c[s]=[o]),Array.isArray(c[s])?c[s].push(a):c[s]=a},onclosetag:()=>{const e=o[t];delete o[t],o=e}},{xmlMode:!0});return a.write(n),a.end(),o},o="[object process]"===Object.prototype.toString.call("undefined"!=typeof process?process:0),s=2,a=4,c=8,i=1,f=1,l=2,y=2,u=4,g=4,b=4,h=8,p=e=>{let t=0;return t=null!==e&&"object"==typeof e?(e=>{let t=0;try{let r=e;switch(!0){case e instanceof Map:r=Object.fromEntries(e);break;case e instanceof Set:r=Array.from(e);break;case e instanceof Int8Array:return e.length*i;case e instanceof Uint8Array||e instanceof Uint8ClampedArray:return e.length*f;case e instanceof Int16Array:return e.length*l;case e instanceof Uint16Array:return e.length*y;case e instanceof Int32Array:return e.length*u;case e instanceof Uint32Array:return e.length*g;case e instanceof Float32Array:return e.length*b;case e instanceof Float64Array:return e.length*h}const n=JSON.stringify(r);t=Buffer.from(n).byteLength}catch(e){return console.error("Error detected, return -1",e),-1}return t})(e):(e=>{const t=[],r=[e];let n=0;for(;r.length;){const e=r.pop();switch(typeof e){case"boolean":n+=a;break;case"string":n+=""===(o=e)?4:Buffer.from(o).byteLength;break;case"number":n+=c;break;case"symbol":n+=(e.toString().length-8)*s;break;case"bigint":n+=Buffer.from(String(e)).byteLength;break;case"function":n+=e.toString().length;break;case"object":if(-1===t.indexOf(e)){t.push(e);for(const t in e)r.push(e[t])}}}var o;return n})(e),t},m=(e,t)=>e in t;export{o as isNodeEnv,p as sizeof,m as valueInObj,n as xml2js};
