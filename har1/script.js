    fileInput.onchange = function processFiles(e) {
      const file = e.target.files[0];

      var reader = new FileReader();
      reader.onload = function (e) {
        const data = JSON.parse(e.target.result);
        //res.textContent = data;
        console.log('xneek', data.log.entries)
        tbody.innerHTML = data.log.entries.map((e) => {
          return `
          <tr>
            <td>${e._resourceType}</td>
            <td>${e.request.url}</td>
            <td>${e.request.method}</td>
            <td>${e.response.status}</td>
            <td>${e.response._transferSize.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.serverIPAddress}</td>
            <td>${e.startedDateTime}</td>
            <td>${e.time.toLocaleString()}</td>
            <td>${e.timings.connect.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.timings.dns.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.timings.receive.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.timings.send.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.timings.ssl.toLocaleString().replace(/\s/, '')}</td>
            <td>${e.timings.wait.toLocaleString().replace(/\s/, '')}</td>
            <td>${Array.from(new Set(e._initiator?.stack?.parent?.callFrames?.map((x) => x?.url.replace(/^.+webclient\/CDN/g, '')))).join('\n')}</td>
            <td>${Array.from(new Set(e._initiator?.stack?.callFrames?.map((x) => x?.url.replace(/^.+webclient\/CDN/g, '')))).join('\n')}</td>
          </tr>
      `
        }).join('\n');

      };
      reader.readAsText(file);
    }