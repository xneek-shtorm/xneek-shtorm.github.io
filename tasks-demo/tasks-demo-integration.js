// Пример интеграции
const searchParams = new URLSearchParams(window.location.search);
// Идентификатор сайта, нужен для работы со счетчиком-индикатором. Должен совпадать с id из настройки custom-sites-tabs
const siteId = searchParams.get('site-id') || 'tasks-demo-integration';
const checkNotEmpty = Boolean(searchParams.get('check-not-empty'));

/** Вспомогательная функция для отправки сообщения в формате action + payload */
function sendIntegrationMessage(action, payload = null) {
  if (!window.parent) throw new Error('Не обнаружено родительское окно для отправки post-message');
  const msg = JSON.stringify({ action, payload });
  window.parent.postMessage(msg, document.referrer.length > 0 ? document.referrer : undefined);
  console.debug('sendIntegrationMessage', msg)
};

/** Обработчик сообщений post-message поучаемых от хост системы */
function handlePostMessage(event) {
  const { action = null, payload = null } = JSON.parse(event.data);

  if (action === 'ProductRequestChanged') {

    if (!(/avelana-\d+/.test(searchParams.get('project')))) {
      // Если нет корректного проекта, редиректим на нужный requestId
      searchParams.set('project', `avelana-${payload.requestData.id}`);
      window.location.href = `?${searchParams.toString()}`;
    } else {
      makeCustomLogicWithRequestData(payload)
    }

    
  }
}

window.addEventListener('message', handlePostMessage);

setTimeout(() => {
  // Сообщаем о готовности принимать сообщения от хост-системы
  // В ответ на это сообщение хост-система в событии ProductRequestChanged пришлет данные текущего обращения (если такое имеется)
  sendIntegrationMessage('ProductChildReady');
}, 1000);



function makeCustomLogicWithRequestData(fullRequestData, checkMode=false){
 


  // Получаем элементы задач
  const listItems = document.getElementById('tasks_list').getElementsByTagName('li');

  // Если нет задач
  if (listItems.length === 0) {
    // обновим счетчик индикатор в хост-системе чтобы привлечь внимание
    sendIntegrationMessage('ProductSetCounter', { siteId, count: 1 });

    // Откроем форму добавления новой задачи
    document.getElementById('addTaskBtn').click();


    setTimeout(() => {

      // Заполним форму данными из хост-системы
      const taskForm = document.getElementById('taskForm');
      const contactPerson = fullRequestData.contactPersonsData[0];
      const operator = fullRequestData.operatorData;
      taskForm.elements.name.value = `Обслуживание клиента ${contactPerson.firstName ?? ''} ${contactPerson.lastName ?? ''} оператором ${operator.firstName ?? ''} ${operator.lastName ?? ''}`;
      taskForm.elements.description.value = `Заголовок: ${fullRequestData.requestData.title};
Внутренний id: ${fullRequestData.requestData.id};
Внешний id: ${fullRequestData.requestData.externalId};
Канал: ${fullRequestData.requestData.channelType};
Адрес: ${fullRequestData.requestData.originator};
Дата регистрации: ${new Date(fullRequestData.requestData.timeRegistered).toLocaleString()};
Тематики: ${fullRequestData.requestSubjectLinks?.map(s => s.subjectName).join(' | ') ?? '-'};`
      taskForm.elements.metadata.value = JSON.stringify(fullRequestData, null, '  ');

      taskForm.addEventListener('submit', () => {
        setTimeout(() => {
          // Через секунду после отправки формы выполняем проверку на наличие задач снова, чтобы обновить состояние
          makeCustomLogicWithRequestData(fullRequestData)
        }, 1000);
      })

      // При необходимости можно сохранить автоматически
      // taskForm.submit();

    }, 1000)


    //if (checkNotEmpty) sendIntegrationMessage('ProductRequestActionError', 'Требуется хотя бы одна задача для завершения обращения');

  } else {
    // Сбросим счетчик-индикатор в хост-системе чтобы не привлекать внимание
    sendIntegrationMessage('ProductSetCounter', { siteId, count: 0 });
const searchParams = new URLSearchParams(window.location.search);
console.log('xneek', searchParams, searchParams.entries())
    // Если сайт открыт в режиме проверки на непустой список - отправляем сообщение о том, что проверка
    if (searchParams.get('check-not-empty')) {
      sendIntegrationMessage('ProductRequestActionProcessed');
    }
  }
}
