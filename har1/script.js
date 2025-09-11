    const defineApp = (str1, str2) => {
let str = '';

str = '/app-administrator/PRODUCT-administrator.js';
if (str1.includes(str) || str2.includes(str)) return 'app-administrator';

str = '/app-automationservices/PRODUCT-automation-services.js';
if (str1.includes(str) || str2.includes(str)) return 'app-automationservices';

str = '/app-buttonbot/PRODUCT-button-bot.js';
if (str1.includes(str) || str2.includes(str)) return 'app-buttonbot';

str = '/app-clients/PRODUCT-clients.js';
if (str1.includes(str) || str2.includes(str)) return 'app-clients';

str = '/app-crpm/PRODUCT-crpm.js';
if (str1.includes(str) || str2.includes(str)) return 'app-crpm';

str = '/app-dialogscripts/PRODUCT-dialog-scripts.js';
if (str1.includes(str) || str2.includes(str)) return 'app-dialogscripts';

str = '/app-evaluationforms/PRODUCT-evaluation-forms.js';
if (str1.includes(str) || str2.includes(str)) return 'app-evaluationforms';

str = '/app-info/PRODUCT-info.js';
if (str1.includes(str) || str2.includes(str)) return 'app-info';

str = '/app-internaloperatorchat/871.6cb17064d24e65df63bc.js';
if (str1.includes(str) || str2.includes(str)) return 'app-internaloperatorchat';

str = '/app-internaloperatorchat/internal-chat.f4e35a0e14548471f6c7.js';
if (str1.includes(str) || str2.includes(str)) return 'app-internaloperatorchat';

str = '/app-internaloperatorchat/PRODUCT-internal-operator-chat.js';
if (str1.includes(str) || str2.includes(str)) return 'app-internaloperatorchat';

str = '/app-marketing/PRODUCT-marketing.js';
if (str1.includes(str) || str2.includes(str)) return 'app-marketing';

str = '/app-ratingbot/PRODUCT-rating-bot.js';
if (str1.includes(str) || str2.includes(str)) return 'app-ratingbot';

str = '/app-requestsawaiting/PRODUCT-requests-awaiting.js';
if (str1.includes(str) || str2.includes(str)) return 'app-requestsawaiting';

str = '/app-serviceobjects/PRODUCT-service-objects.js';
if (str1.includes(str) || str2.includes(str)) return 'app-serviceobjects';

str = '/app-supervisor/PRODUCT-supervisor.js';
if (str1.includes(str) || str2.includes(str)) return 'app-supervisor';



str = '/panel-dialogscripts/PRODUCT-dialog-scripts-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-dialogscripts';

str = '/panel-operatorqueuesinfo/PRODUCT-operator-queues-info-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-operatorqueuesinfo';

str = '/panel-operatorstatus/PRODUCT-operator-status-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-operatorstatus';

str = '/panel-softphone/PRODUCT-softphone-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-softphone';

str = '/panel-templates/PRODUCT-template-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-templates';

str = '/panel-version/PRODUCT-version-panel.js';
if (str1.includes(str) || str2.includes(str)) return 'panel-version';

str = '/pl-module-auth/Product-OperatorAuthenticationModule.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-module-auth';


str = '/module-product-services/PRODUCT-services.js';
if (str1.includes(str) || str2.includes(str)) return 'module-product-services';
str = '/module-operator-screen/PRODUCT-operator-screen-module.js';
if (str1.includes(str) || str2.includes(str)) return 'module-operator-screen';

str = '/module-product-auth/PRODUCT-auth-module.js';
if (str1.includes(str) || str2.includes(str)) return 'module-product-auth';


str = '/pl-module-notifications/Product-NotificationsModule.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-module-notifications';

str = '/pl-module-operatorstatus/Product-OperatorStatusModule.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-module-operatorstatus';

str = '/pl-module-workexecution/Product-WorkExecutionModule.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-module-workexecution';

str = '/pl-module-workflowmanager/Product-WorkflowManagerModule.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-module-workflowmanager';

str = '/pl-root/Product-root-config.js';
if (str1.includes(str) || str2.includes(str)) return 'pl-root';


str = '/systemjs/system.min.js';
if (str1.includes(str) || str2.includes(str)) return 'system-js';

str = 'https://prdev-superset.avelana.ru/';
if (str1.includes(str) || str2.includes(str)) return 'superset';

str = 'https://prdev-int.avelana.ru/user-docs/';
if (str1.includes(str) || str2.includes(str)) return 'user-docs';



      return 'Документ';
  
    }
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

          
          const url = e.request.url.endsWith('/graphql') ? `${e.request.url} → ${JSON.parse(e.request.postData.text).operationName}`: e.request.url
          const key = [url, e.request.method].join('_');
          const keyWithInit = [url, e.request.method, where1, where2].join('_');
          if (!urlsCount[key]) { urlsCount[key] = 0; }
          if (!urlsCountWithInitiator[keyWithInit]) { urlsCountWithInitiator[keyWithInit] = 0; }

          urlsCount[key]++;
          urlsCountWithInitiator[keyWithInit]++;

          const rowClasses = [
            urlsCount[key] > 1 && 'double-url-and-method',
            urlsCountWithInitiator[keyWithInit] > 1 && 'double-url-and-method-and-initiator',
          ].filter(Boolean);

          const ddt = defineApp(where1, where2)

          return `
          <tr class="${rowClasses.join(' ')}">
            <td>${i + 1}</td>
            <td>${e._resourceType}</td>
            <td>${url}</td>
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
            <td>${ddt}</td>
          </tr>
      `
        }).join('\n');

      };
      reader.readAsText(file);
    }