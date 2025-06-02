    fileInput.onchange = function processFiles(e) {
      const file = e.target.files[0];

      var reader = new FileReader();
      reader.onload = function (e) {
        const data = JSON.parse(e.target.result);
        //res.textContent = data;
        console.log('xneek', data.log.entries);
        const urlsCount = {};
        const urlsCountWithInitiator = {};
        tbody.innerHTML = data.log.entries.map((e, i) => {

          const where1 = Array.from(new Set(e._initiator?.stack?.parent?.callFrames?.map((x) => x?.url.replace(/^.+webclient\/CDN/g, '')))).join('\n');
          const where2 = Array.from(new Set(e._initiator?.stack?.callFrames?.map((x) => x?.url.replace(/^.+webclient\/CDN/g, '')))).join('\n');

          const key = [e.request.url, e.request.method].join('_');
          const keyWithInit = [e.request.url, e.request.method, where1, where2].join('_');
          if (!urlsCount[key]) { urlsCount[key] = 0; }
          if (!urlsCountWithInitiator[keyWithInit]) { urlsCountWithInitiator[keyWithInit] = 0; }

          urlsCount[key]++;
          urlsCountWithInitiator[keyWithInit]++;

          const rowClasses = [
            urlsCount[key] > 1 && 'double-url-and-method',
            urlsCountWithInitiator[keyWithInit] > 1 && 'double-url-and-method-and-initiator',
          ].filter(Boolean);

          return `
          <tr class="${rowClasses.join(' ')}">
            <td>${i + 1}</td>
            <td>${e._resourceType}</td>
            <td>${e.request.url}</td>
            <td>${e.request.method}</td>
            <td>${e.response.status}</td>
            <td class="number">${e.response._transferSize.toLocaleString().replace(/\s/g, '')}</td>
            <td class="nowrap">${e.serverIPAddress}</td>
            <td class="nowrap">${e.startedDateTime}</td>
            <td class="number">${e.time.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.connect.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.dns.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.receive.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.send.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.ssl.toLocaleString().replace(/\s/g, '')}</td>
            <td class="number">${e.timings.wait.toLocaleString().replace(/\s/g, '')}</td>
            <td>${where1}</td>
            <td>${where2}</td>
          </tr>
      `
        }).join('\n');

      };
      reader.readAsText(file);
    }