const getValueFromChain = (rawChain, obj) => {
    try {
        const parts = rawChain.split('~');
        let currentObjLevel = obj;

        parts.forEach((x) => {
            if (rawChain.length === 1 && x === '*') {
              
                return currentObjLevel;
            }
            else if (/\d+/.test(x)) {
                // Если передано число, вытаскиваем по индексу. Пример: contactPersonsData~0~firstName
                currentObjLevel = currentObjLevel[x];
            }
            else if (/\*.+/.test(x)) {
                // Если есть звездочка, запускам поиск индекса. Пример: requestData~customAttributes~*code=CustomerType~value
                const [k, v] = x.substring(1).split('=');
                currentObjLevel = currentObjLevel.find((a) => a[k] == v);
            }
            else {
                // В любом другом случае, просто пытаемся достать из объекта по ключу. requestData~id
                currentObjLevel = currentObjLevel[x];
            }
        });
        return currentObjLevel;
    }
    catch (e) {
        console.warn('Failed to get value from path', rawChain, e);
        return '';
    }
};

let dataObj = {}

fetch('sample.json').then(r => r.json()).then((json) => {
  dataObj = json;
       const sp = new URLSearchParams(location.search);
  const q = sp.get('q');
  const jsonLevelToDomNode = (key, jsonLevel, chain=[], isArrayChild) => {
    const li = document.createElement(typeof jsonLevel === 'object' && jsonLevel !== null && chain.length ? 'details' : 'div');
    li.style.marginLeft = 8;

    

    if (key ) {
      const b = document.createElement(typeof jsonLevel === 'object'&& jsonLevel !== null  ? 'summary' : 'span');
      if (isArrayChild) b.style.marginLeft ='12px'
      const a = document.createElement('code');
      const newChain = [...chain];

      a.title = newChain.join('~');

      if (q && q.startsWith(newChain.join('~')) || newChain.join('~') === q) {
        li.open = true
      }

      a.textContent = key;
      a.onclick = () => {
        inp.value = newChain.join('~');
        form.requestSubmit()
      }

      if (Array.isArray(jsonLevel))  {
        a.textContent+='[]'
      }
      
      b.append(a);
      li.appendChild(b)
    }

    if (typeof jsonLevel !== "object" || jsonLevel === null) {
      const span =  document.createElement('small');
      span.title = JSON.stringify({ jsonLevel, key, chain })
      span.textContent = ` : `;
      li.append(span);
      const span2 =  document.createElement('small');
      span2.style.opacity = 0.5
      span2.textContent = jsonLevel === null ? 'null' : jsonLevel;
      li.append(span2);


    }else if (Array.isArray(jsonLevel)) {
      const ul = document.createElement('div');
      ul.style.marginLeft=8;
  
      jsonLevel.map((arrItem, i)=>{
        ul.append(jsonLevelToDomNode(`[${i}]`, arrItem, [...chain, i], true))
      })
      li.append(ul)
    } else {
  
      const ul = document.createElement('ul');
      Object.entries(jsonLevel).map(([k,v])=>{
        ul.append(jsonLevelToDomNode(k, v, [...chain, k]))
      })
      li.append(ul)
    }
    
    return li;
    
  }
  
  res.append(jsonLevelToDomNode('', json, []))


  if (q) {
    inp.value = q;
    form.requestSubmit()
  } 
})


const run = (q) => {
  
  out.textContent = JSON.stringify(getValueFromChain(q, dataObj), null, '  ');

}

form.onsubmit =  e => {
  e.preventDefault();
const req = inp.value;
run(req)
  const url = new URL(window.location.href);
  url.searchParams.set('q', req); 
          window.history.pushState({}, '', url.toString());


}


