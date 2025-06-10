const mColors = ["#E5FFFC", "#F6FFE5", "#FFE9E0", "#FFE5F9", "#F1E5FF", "#E5EDFF", "#eafcca", "#cafcf7", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E"];
const colorInc = 1;

const getTextFromFile = (file) => {
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      res(e.target.result)
    }

    reader.readAsText(file);
  })
}

/*



*/

replacesInp.value = localStorage.getItem('perfView_replaces') || ''
filters.value = localStorage.getItem('perfViewFilters') || ''
keepalive.value = localStorage.getItem('perfView_keepalive') || 'asis'
init.value = localStorage.getItem('perfView_init') || 'asis'
collapseByTarget.checked = localStorage.getItem('perfView_collapseByTarget') === 'true'
noempty.checked = localStorage.getItem('perfView_noempty') === 'true'

form.onsubmit = async (e) => {
  e.preventDefault();

  localStorage.setItem('perfViewFilters', filters.value);
  localStorage.setItem('perfView_keepalive', keepalive.value);
  localStorage.setItem('perfView_init', init.value);
  localStorage.setItem('perfView_collapseByTarget', collapseByTarget.checked);
  localStorage.setItem('perfView_noempty', noempty.checked);
  localStorage.setItem('perfView_replaces', replacesInp.value);

  res.innerHTML = '';
  thead.innerHTML = '';
let startedDateTime;
  const entries = []; // {name: '', rows: ''[]}
  const files = Array.from(filesInp.files);
  for (const file of files) {
    if (file.name.endsWith('.har')) {
      const fileText = await getTextFromFile(file);
      const harData = JSON.parse(fileText);
      const sockets = harData.log.entries.filter((x) => x._resourceType === 'websocket');

      sockets.forEach((ws) => {

        if (filters.value.length && !filters.value.split('|').some((s)=>ws.request.url.toLowerCase().includes(s.toLowerCase()))){
          return;
        }

        const startDate = new Date(ws.startedDateTime);
        startedDateTime = ws.startedDateTime
        const rowsE = [];
        ws._webSocketMessages.forEach((m) => {
          rowsE.push([
            m.type==='send' ? '>' : '<',
            m.time,
            JSON.stringify({ payload: m.data })
          ].join('\t'))
        })

        entries.push({
          name: new URL(ws.request.url).pathname,
          rows: rowsE,
          har: true,
          startDate
        })
      })


      console.log('xneek', {entries})

    } else if (file.name.endsWith('.log')) {
      const fileText = await getTextFromFile(file);


      const rows = fileText.trim().split('\n');
      entries.push({
        name: file.name,
        rows 
      })
    } else {
      throw new Error('Unknown file ext')
    }
  
  }


      

   
      const timesDataMap = {};
      const colsSet = new Set();

      for (const entry of entries) {
  
        colsSet.add(entry.name);
        entry.rows.forEach((row) => {
          const x = row.trim().split('\t')

          const  [dir, date, data]= x;
          
          let jsDate = new Date();
          if (date.includes('-')) {
            jsDate = new Date(date);
          } else {
            const sd = entry.startDate;
            console.log('xneek', {startDate: entry.startDate})
            
            const date2 = new Date(sd.getTime() + +date/1000);

            jsDate = date ///date2.toLocaleTimeString() + '.' + date2.getMilliseconds() + (date/1000 - (date2.getTime() - sd.getTime()));// new Date(+date)
          }



          const jd = JSON.parse(data);


         
          const raws = (jd.payload?.split('\u001e')?.map((x) => x.replace(/[\x1c\x1c]+/g, ''))?.filter(Boolean) ?? []);
          
        

           
          //;
          raws.forEach((raw) => {

            const dt = JSON.parse(raw);

            const isKeepAlive = dt?.type == 6;
            const isInit =  dt?.protocol == 'json' && dt?.version ;

            if (keepalive.value === 'ignore' && isKeepAlive) return;
            if (init.value === 'ignore' && isInit) return;
            if (noempty.checked && Object.keys(dt).length == 0) return;
            
            const time = jsDate instanceof Date ?  jsDate.toLocaleTimeString()+'.'+jsDate.getMilliseconds(): jsDate;

            if (!timesDataMap[time]) timesDataMap[time] = {};


            if (!timesDataMap[time][entry.name]) timesDataMap[time][entry.name] = {};
            let str = JSON.stringify(dt);
            
            if (keepalive.value === 'replace' && isKeepAlive) {
              str = 'keep-alive';
            } 

            if (init.value === 'replace' && isInit) {
              str = 'init';
            } 

            if (Object.keys(dt).length > 1 && !(isInit || isKeepAlive)) {
              str = JSON.stringify(dt, null,'  ')
            }



            if (replacesInp.value.length) {
              const replaceRows = replacesInp.value.split('\n');
              replaceRows.forEach((s) => {
                const [from, to] = s.split('\t');
                str = str.replaceAll(from.trim(), to.trim());
              })
            }

            const dirKey = dir === '>' ? 'out' : 'in'; 

            if (!timesDataMap[time][entry.name][dirKey]) timesDataMap[time][entry.name][dirKey] = [];

            timesDataMap[time][entry.name][dirKey].push({
              text: str,
              isKeepAlive,
              target: dt?.target,
              data: dt,
              startDate: entry.startDate,
            });

          })
          

        })


        //console.log('xneek', entry.name, fileText.length)
      }

      const times = Object.keys(timesDataMap).sort();
      
      const invocationsMap = {};

      times.forEach((time) => {
        const filesDataMap = timesDataMap[time];
 
          const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.textContent =  time;
            //td1.title = time instanceof Date ? time : '' 
            tr.appendChild(td1);
            let ind = 0;
            colsSet.forEach((fileName)=> {
              const da = filesDataMap[fileName];
              
              const tdOut = document.createElement('td');
              tdOut.style.backgroundColor = mColors[ind]
              tdOut.classList.add('out')

              da?.out?.forEach((outItem) => {

                const pre = document.createElement('pre');
                if (outItem.isKeepAlive) pre.classList.add('keep')
                pre.textContent = outItem.text || '';

                if (collapseByTarget.checked && outItem.target) {
                  const det = document.createElement('details');
                  const su = document.createElement('summary');
                  su.textContent = outItem.target;
                  if (outItem?.data?.invocationId) {
                    if (!invocationsMap[fileName]) invocationsMap[fileName] = {};
        
                   invocationsMap[fileName][outItem.data.invocationId] = {
                    target: outItem.target,
                    time
                   };
                   
                    const sup = document.createElement('sup');
                    sup.textContent = outItem?.data?.invocationId;
                    su.appendChild(sup)
                  }
                  det.appendChild(su);
                  det.appendChild(pre);
                  tdOut.appendChild(det);
                } else {
                  tdOut.appendChild(pre);
                }

              })

              tr.appendChild(tdOut);

              const tdIn = document.createElement('td');
              tdIn.style.backgroundColor = mColors[ind]
              tdIn.classList.add('in')

              da?.in?.forEach((inItem) => {

                const preIn = document.createElement('pre');
                if (inItem.isKeepAlive) preIn.classList.add('keep')
                preIn.textContent = inItem.text || '';

                const eqInvocation = invocationsMap[fileName][inItem.data.invocationId];

  
                if (collapseByTarget.checked && (inItem.target || eqInvocation)) {
                  const det = document.createElement('details');
                  const su = document.createElement('summary');
                  su.textContent = inItem.target ?? (eqInvocation?.target +  ' result');

                  if (eqInvocation) {
                    const sup = document.createElement('sup');
                    sup.textContent = inItem.data.invocationId;

                    sup.title = time.toLocaleString() + ' -  ' + eqInvocation?.time?.toLocaleString?.() + ' = '+((time - eqInvocation?.time)).toLocaleString()

                    su.appendChild(sup)
                  }

                  det.appendChild(su);
                  det.appendChild(preIn);
                  tdIn.appendChild(det);
                } else {
                  tdIn.appendChild(preIn);
                }

              });
              


              tr.appendChild(tdIn);
              ind+=colorInc
            })

          
          
          res.appendChild(tr);
      })


      const thr1 = document.createElement('tr');
      const thr2 = document.createElement('tr');

      const th1 = document.createElement('th');
      th1.rowSpan = 2;
      th1.textContent = startedDateTime ? new Date(startedDateTime) .toLocaleString()+'+' : 'time'
      thr1.appendChild(th1);
      
      let ind = 0;
      colsSet.forEach((f) => {
        const th = document.createElement('th');
        th.colSpan = 2;
        th.textContent = f;
        th.style.backgroundColor = mColors[ind]
        thr1.appendChild(th);
        
  
        const thOut = document.createElement('th');
        thOut.textContent = 'out ↑';
        thOut.style.backgroundColor = mColors[ind]
        thOut.classList.add('out')
        thr2.appendChild(thOut);
        
        const thIn = document.createElement('th');
        thIn.textContent = 'in ↓';
        thIn.classList.add('in')
        thIn.style.backgroundColor = mColors[ind]
        thr2.appendChild(thIn);


ind+=colorInc;

      })

      thead.appendChild(thr1)
      thead.appendChild(thr2)     

      console.log(timesDataMap);

    }