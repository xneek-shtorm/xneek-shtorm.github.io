let stack, callSession;

const log = (msg) => {
    console.log(msg)
}

const eventsListener = (e) => {
    log('session event = ' + e.type);
    if(e.type == 'started'){
        callSession = stack.newSession('call-audio', {
            audio_remote: document.getElementById('audio_remote')
        });

    }
    else if(e.type == 'i_new_message'){ // incoming new SIP MESSAGE (SMS-like)
        acceptMessage(e);
    }
    else if(e.type == 'i_new_call'){ // incoming audio/video call
        acceptCall(e);
    }
}

const initSuccessHandler = () => {
    stack = new SIPml.Stack({
        realm: '10.10.11.22:5160',
        impi: '103',
        impu: 'sip:103@10.10.11.22:5160',
        password: '103',

        display_name: '103', // optional
        websocket_proxy_url: 'wss://10.10.11.22:7443', // optional
        outbound_proxy_url: 'udp://10.10.11.22:7443', // optional
        //enable_rtcweb_breaker: false, // optional
        events_listener: { events: '*', listener: eventsListener }, // optional: '*' means all events
        sip_headers: [ // optional
            { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.0.0.0' },
            { name: 'Organization', value: 'CEC Experimental' }
        ]
    });
    stack.start();
}

const initFailHandler = (e) => {
    log('Failed to initialize the engine: ' + e.message);
}

SIPml.init(initSuccessHandler, initFailHandler);

form.onsubmit = (e) => {
    e.preventDefault();
    log('☎ CALL '+phone.value)
    callSession.call(phone.value);
}