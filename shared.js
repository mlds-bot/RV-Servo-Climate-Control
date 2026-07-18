const CFG_KEY='mmccServoMqtt';
const defaults={host:'b1dcdceb082d4443873bb186cd006f90.s1.eu.hivemq.cloud',port:8884,user:'MLDS_CHAT2',pass:'',base:'rv/servo'};
let cfg={...defaults,...JSON.parse(localStorage.getItem(CFG_KEY)||'{}')},client=null;
function q(id){return document.getElementById(id)}
function topic(path){return cfg.base+'/'+path}
function saveCfg(){['host','port','user','pass','base'].forEach(k=>{if(q('cfg_'+k))cfg[k]=q('cfg_'+k).value});cfg.port=Number(cfg.port||8884);localStorage.setItem(CFG_KEY,JSON.stringify(cfg))}
function fillCfg(){['host','port','user','pass','base'].forEach(k=>{if(q('cfg_'+k))q('cfg_'+k).value=cfg[k]})}
function setConn(t,ok){if(!q('connection'))return;q('connection').textContent=t;q('connection').className='pill '+(ok?'ok':'bad')}
function connectMqtt(){saveCfg();if(client)try{client.end(true)}catch(e){};client=mqtt.connect(`wss://${cfg.host}:${cfg.port}/mqtt`,{username:cfg.user,password:cfg.pass,clientId:'mmcc-web-'+Math.random().toString(16).slice(2),clean:true,reconnectPeriod:3000,connectTimeout:12000});client.on('connect',()=>{setConn('MQTT connected',true);client.subscribe(topic('#'));publish('command','STATUS');publish('led/command','STATUS')});client.on('reconnect',()=>setConn('Reconnecting…',false));client.on('error',e=>setConn(e.message,false));client.on('message',(t,p)=>handleMessage(t,p.toString()))}
function publish(path,payload){if(!client||!client.connected){setConn('Not connected',false);return}client.publish(topic(path),payload,{qos:1,retain:false})}
function handleMessage(t,p){const s=t.startsWith(cfg.base+'/')?t.slice(cfg.base.length+1):t;const el=q('v_'+s.replaceAll('/','_'));if(el)el.textContent=p||'—';if(s==='led/state'&&window.loadLedState)loadLedState(p);if(s==='history_4h'&&window.drawHistory)drawHistory(p)}
window.addEventListener('DOMContentLoaded',()=>{fillCfg();connectMqtt()});
