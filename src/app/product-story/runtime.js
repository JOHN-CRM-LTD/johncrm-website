/** Adapted from the supplied JOHN CRM brochure. React owns the site shell;
 * this scoped controller owns only the product story and its scroll choreography.
 * All listeners and animation frames are released on unmount.
 */
export function mountProductStory(root, {host, language: initialLanguage='en', onNavigate, onSectionTransition, onToneChange}) {
 const shell=root.getElementById('brochure-root');
 let lastTone;
 const lifecycle=new AbortController();
 const listen=(target,type,handler,options={})=>target.addEventListener(type,handler,{...options,signal:lifecycle.signal});


 const $ = id => root.getElementById(id);
 const all = selector => [...root.querySelectorAll(selector)];
 const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
 const logo = root.querySelector('.brand .light').src;
 const tick = root.querySelector('#knowledge-ready img').src;
 const retailPhoto = `<img class="retail-product-photo" src="${$('retail-photo-source').src}" width="1400" height="1749" alt="Product photo of the red sweatshirt">`;
 const avatar = (text, tone='') => `<span class="avatar ${tone}">${text}</span>`;
 const bubble = (message, sent, i) => `<div class="bubble ${sent?'sent':''}" data-message="${i}">${message}<span class="time">${sent?'09:41':'09:42'} ${sent?'<span class="double-tick">✓✓</span>':''}</span></div>`;
 function phoneMarkup(internal) {
  const messages = internal ? [
   ['How many freight cartons are in inventory?',true],
   ['Create a stock report every weekday at 08:30.',true]
  ] : [
   ['Does the sweatshirt come in red?',true],
   [`Yes! Red is available in S, M and L.${retailPhoto}`,false],
   ['Can I try it in store?',true],
   ['Of course. Which branch works for you?',false],
   ['Can I reserve it for 3 PM at your Kwun Tong store?',true],
   ['All set! Your red sweatshirt (SKU 482917) is reserved for your 3 PM visit.<br><br>Find us at Hoi Luen Industrial Centre, 55 Hoi Yuen Road, Kwun Tong.',false]
  ];
  return `<div class="phone-screen"><div class="phone-status"><span>9:41</span><div class="phone-island"></div><span class="phone-signals">${icon('signal')}${icon('battery')}</span></div><div class="phone-header">${icon('left')}${avatar('J','john')}<span class="phone-contact"><strong>${internal?'JOHN AI (Internal)':'JOHN AI'}</strong><small>${internal?'Operations · staff conversation':'Business account'}</small></span>${icon('call')}${icon('more')}</div><div class="phone-thread"><div class="phone-thread-inner"><div class="date">Today</div>${messages.map((m,i)=>bubble(m[0],m[1],i)).join('')}</div><div class="typing"><i></i><i></i><i></i></div></div><div class="phone-compose"><span class="phone-input">${icon('plus')}<span>Message…</span></span><span class="phone-send">${icon('arrow')}</span></div><div class="homebar"></div></div>`;
 }
 function crmMarkup(internal) {
  const nav = (text, name, active=false) => `<div class="app-nav ${active?'active':''}">${icon(name)}${text}</div>`;
  const threads = internal ? [['SL','Sarah Lee','How many freight cartons…','Now'],['WH','Warehouse','Stock received and checked.','12m'],['OP','Operations','Morning dispatch confirmed.','35m'],['DT','Dispatch team','The pickup is on schedule.','1h']] : [['MC','Maya Chen','Does the sweatshirt come in red?','Now'],['JL','Jamie Lee','Thanks, that is perfect.','12m'],['AT','Alex Taylor','Is this available in navy?','1h'],['SC','Sam Collins','Thank you for your help.','2h']];
  const reply = internal ? `<div class="john-response" id="inventory-response">${avatar('J','john')}<div class="response-content"><span class="sender">John</span><p class="answer-text">There are <strong>268 freight cartons</strong> in inventory.</p><table class="inventory-table"><thead><tr><th>Carton type</th><th>In stock</th></tr></thead><tbody><tr data-stock="0"><td>Standard</td><td>128</td></tr><tr data-stock="1"><td>Heavy duty</td><td>84</td></tr><tr data-stock="2"><td>Insulated</td><td>56</td></tr><tr class="total" data-stock="3"><td>Total cartons</td><td>268</td></tr></tbody></table><p class="source-line">${icon('code')}Warehouse inventory · custom API</p><div class="automation-receipt" id="automation-receipt"><img src="${tick}" alt="Complete"><span><strong>Stock report scheduled</strong><small>Weekdays · 08:30 · Hong Kong</small></span></div></div></div>` : `<div class="john-response">${avatar('J','john')}<div class="retail-reply"><p>Yes! Red is available in S, M and L.</p>${retailPhoto}<small>09:42 ✓✓</small></div></div><div class="retail-followup">Can I try it in store?</div><div class="retail-note"><img src="${tick}" alt="">A helpful answer. A connected team.</div>`;
  return `<div class="windowbar"><i></i><i></i><i></i><span>JOHN CRM · ${internal?'Logistics workspace':'Retail workspace'}</span></div><div class="crm-body"><aside class="app-sidebar"><img class="app-logo" src="${logo}" alt="JOHN CRM"><div class="workspace">${avatar(internal?'LW':'RW')}<span>${internal?'Logistics workspace':'Retail workspace'}<small>Workspace admin</small></span></div>${nav('John Support','bot')}<div class="app-divider"></div>${nav('Internal Chat','chat',internal)}${nav('External Chat','chat',!internal)}<div class="app-divider"></div>${nav('Users','users')}${nav('Calendar','calendar')}${nav('Automations','zap')}${nav('Knowledge Base','book')}<div class="app-user">${avatar('JL')}<span>Jordan Lee<small>Workspace admin</small></span></div></aside><div class="thread-list"><div class="thread-title">${internal?'Internal Chat':'External Chat'}${icon('plus')}</div><div class="search">${icon('search')}Search conversations…</div>${threads.map((t,i)=>`<div class="thread ${i===0?'selected':''}">${avatar(t[0],i===0?'sand':'')}<div class="thread-info"><div class="thread-name">${t[1]}<small>${t[3]}</small></div><div class="thread-preview">${t[2]}</div></div></div>`).join('')}</div><div class="chat-area"><div class="chat-header">${avatar(internal?'SL':'MC','sand')}<span><strong>${internal?'Sarah Lee':'Maya Chen'}</strong><small>${internal?'Internal Chat · Operations':'WhatsApp'}</small></span>${icon('more')}</div><div class="chat-messages"><div class="date">Today</div><div class="crm-question">${avatar(internal?'SL':'MC','sand')}<div class="message-body"><span class="sender">${internal?'Sarah Lee · Operations manager':'Maya Chen'}</span>${internal?'How many freight cartons are in inventory?<br>Create a stock report every weekday at 08:30.':'Does the sweatshirt come in red?'}</div></div>${reply}</div><div class="composer">${icon('plus')}<span>Type a message…</span>${icon('clip')}<div class="send">${icon('send')}</div></div></div></div>`;
 }
 $('retail-phone').innerHTML = phoneMarkup(false);
 $('staff-phone').innerHTML = phoneMarkup(true);
 $('hero-crm').innerHTML = crmMarkup(false);
 $('team-crm').innerHTML = crmMarkup(true);

 // Keep the original text nodes so language changes preserve the animated DOM.
 let language='en';
 const translations=new Map([
  ['Book a demo','預約示範','预约演示'],
  ['Revenue beyond','營收增長','营收增长'],
  ['business hours.','不限營業時間','不限营业时间'],
  ['Turn enquiries into sales opportunities.','將客戶查詢轉化為銷售機會。','将客户咨询转化为销售机会。'],
  ['Keep conversations moving, 24/7.','全天候回應，把握每個商機。','全天候响应，把握每个商机。'],
  ['See it in motion','睇完整示範','观看完整演示'],
  ['Pause tour','暫停導覽','暂停导览'],
  ['Resume tour','繼續導覽','继续导览'],
  ['Choose language','選擇語言','选择语言'],
  ['Language','語言','语言'],
  ['A question. A helpful answer.','有問題，即刻幫到你','有问题，及时为你解答'],
  ['Connected to your world.','連接你嘅業務','连接你的业务'],
  ['Your knowledge. Put to work.','將你嘅知識，用喺工作上','让你的知识，发挥作用'],
  ['Keep your team in the loop.','團隊資訊，隨時同步','团队信息，随时同步'],
  ['JOHN CRM · Retail workspace','JOHN CRM · 零售工作空間','JOHN CRM · 零售工作空间'],
  ['JOHN CRM · Logistics workspace','JOHN CRM · 物流工作空間','JOHN CRM · 物流工作空间'],
  ['Retail workspace','零售工作空間','零售工作空间'],
  ['Logistics workspace','物流工作空間','物流工作空间'],
  ['Workspace admin','工作空間管理員','工作空间管理员'],
  ['John Support','John 支援','John 支持'],
  ['Internal Chat','內部對話','内部对话'],
  ['External Chat','客戶對話','客户对话'],
  ['Users','用戶','用户'],
  ['Calendar','日曆','日历'],
  ['Automations','自動化','自动化'],
  ['Knowledge Base','知識庫','知识库'],
  ['Search conversations…','搜尋對話…','搜索对话…'],
  ['Now','剛剛','刚刚'],
  ['12m','12 分鐘','12 分钟'],
  ['35m','35 分鐘','35 分钟'],
  ['1h','1 小時','1 小时'],
  ['2h','2 小時','2 小时'],
  ['Today','今日','今天'],
  ['Does the sweatshirt come in red?','呢件衛衣有冇紅色？','这款卫衣有红色吗？'],
  ['Yes! Red is available in S, M and L.','有呀！紅色有 S、M 同 L 碼','有的！红色有 S、M 和 L 码'],
  ['Can I try it in store?','可唔可以去門市試身？','可以到门店试穿吗？'],
  ['Of course. Which branch works for you?','當然可以！你想去邊間分店？','当然可以！你想去哪家分店？'],
  ['Can I reserve it for 3 PM at your Kwun Tong store?','可唔可以幫我留起件衛衣？我下晝 3 點去觀塘門市','可以帮我预留这件卫衣吗？我下午 3 点到观塘门店'],
  ['All set! Your red sweatshirt (SKU 482917) is reserved for your 3 PM visit.','冇問題！已經幫你留起紅色衛衣（SKU 482917），等你下晝 3 點到店','没问题！已为你预留红色卫衣（SKU 482917），等你下午 3 点到店'],
  ['Find us at Hoi Luen Industrial Centre, 55 Hoi Yuen Road, Kwun Tong.','門市地址：觀塘開源道 55 號開聯工業中心','门店地址：观塘开源道 55 号开联工业中心'],
  ['Would you like help finding your fit?','需唔需要幫你揀尺碼？','需要帮你选择尺码吗？'],
  ['Thanks, that is perfect.','唔該，啱晒！','谢谢，正合适！'],
  ['Is this available in navy?','呢款有冇深藍色？','这款有深蓝色吗？'],
  ['Thank you for your help.','唔該晒你幫手','谢谢你的帮助'],
  ['A helpful answer. A connected team.','解答到位，團隊同步','解答到位，团队同步'],
  ['Business account','商業帳戶','商业账号'],
  ['JOHN AI (Internal)','JOHN AI（內部）','JOHN AI（内部）'],
  ['Operations · staff conversation','營運 · 員工對話','运营 · 员工对话'],
  ['Message…','輸入訊息…','输入消息…'],
  ['Type a message…','輸入訊息…','输入消息…'],
  ['Webchat','網頁對話','网页聊天'],
  ['Business API','商業 API','商业 API'],
  ['Custom API','自訂 API','自定义 API'],
  ['endpoints','端點','端点'],
  ['4 sources added','已加入 4 個來源','已添加 4 个来源'],
  ['Product guide','產品指南','产品指南'],
  ['CSV export','匯出 CSV','导出 CSV'],
  ['PDF export','匯出 PDF','导出 PDF'],
  ['Operations guide','營運指南','运营指南'],
  ['How many freight cartons are in inventory?','而家庫存有幾多個貨運紙箱？','目前库存有多少个货运纸箱？'],
  ['Create a stock report every weekday at 08:30.','幫我逢工作日上午 08:30 產生庫存報告','请在每个工作日上午 08:30 生成库存报告'],
  ['How many freight cartons…','庫存有幾多個貨運紙箱…','库存有多少个货运纸箱…'],
  ['Warehouse','倉庫','仓库'],
  ['Stock received and checked.','貨品已收妥並核對','货品已接收并核对'],
  ['Operations','營運','运营'],
  ['Morning dispatch confirmed.','上午出貨已確認','上午发货已确认'],
  ['Dispatch team','出貨團隊','发货团队'],
  ['The pickup is on schedule.','提貨按計劃進行','提货按计划进行'],
  ['Internal Chat · Operations','內部對話 · 營運','内部对话 · 运营'],
  ['Sarah Lee · Operations manager','Sarah Lee · 營運經理','Sarah Lee · 运营经理'],
  ['There are','目前庫存有','目前库存有'],
  ['268 freight cartons','268 個貨運紙箱','268 个货运纸箱'],
  ['in inventory.','',''],
  ['Carton type','紙箱類型','纸箱类型'],
  ['In stock','庫存數量','库存数量'],
  ['Standard','標準','标准'],
  ['Heavy duty','加厚','加厚'],
  ['Insulated','保溫','保温'],
  ['Total cartons','紙箱總數','纸箱总数'],
  ['Total','總數','总数'],
  ['Warehouse inventory · custom API','倉庫庫存 · 自訂 API','仓库库存 · 自定义 API'],
  ['Stock report scheduled','庫存報告已排程','库存报告已安排'],
  ['Weekdays · 08:30 · Hong Kong','工作日 · 08:30 · 香港','工作日 · 08:30 · 香港'],
  ['A better way to keep','用更好嘅方式','用更好的方式'],
  ['business moving.','推動業務向前','推动业务向前'],
  ['Let’s build your connected workspace.','一齊建立你嘅互通工作空間','一起建立你的互通工作空间'],
 ['Illustrative workflow · configured inventory API · sample data','流程示範 · 已設定庫存 API · 範例數據','流程演示 · 已配置库存 API · 示例数据'],
 ['Back to the beginning','返回開場','返回开场'],
 ['Return to beginning','返回開場','返回开场'],
  ['Skip animation and read the brochure','略過動畫，閱讀文字版','跳过动画，阅读文字版'],
  ['Back to animation','返回動畫','返回动画'],
  ['Revenue beyond business hours.','營收增長，不限營業時間。','营收增长，不限营业时间。'],
  ['JOHN CRM keeps customer conversations moving and turns enquiries into sales opportunities, 24/7. Connect your customer conversations, company knowledge and internal workflows in one workspace.','JOHN CRM 全天候回應客戶，將查詢轉化為銷售機會，並將客戶對話、公司知識及內部工作流程整合於同一個工作空間。','JOHN CRM 全天候响应客户，将咨询转化为销售机会，并将客户对话、公司知识和内部工作流程整合到同一个工作空间。'],
  ['Customer:','客戶：','客户：'],
  ['Connect Webchat, WhatsApp, WhatsApp Business API and custom API endpoints. Bring PDF and Word documents into the Knowledge Base, alongside Excel content exported as CSV and PowerPoint content exported as PDF.','連接網頁對話、WhatsApp、WhatsApp 商業 API 同自訂 API 端點將 PDF、Word 文件，以及匯出為 CSV 嘅 Excel 內容同匯出為 PDF 嘅 PowerPoint 內容加入知識庫','连接网页聊天、WhatsApp、WhatsApp 商业 API 和自定义 API 端点将 PDF、Word 文档，以及导出为 CSV 的 Excel 内容和导出为 PDF 的 PowerPoint 内容加入知识库'],
  ['An operations manager asks: “How many freight cartons are in inventory? Create a stock report every weekday at 08:30.”','營運經理問：「而家庫存有幾多個貨運紙箱？幫我逢工作日上午 08:30 產生庫存報告」','运营经理问：“目前库存有多少个货运纸箱？请在每个工作日上午 08:30 生成库存报告”'],
  ['In this illustrative workflow, JOHN CRM uses a configured inventory API to reply:','喺呢個示範流程入面，JOHN CRM 透過已設定嘅庫存 API 回覆：','在这个演示流程中，JOHN CRM 通过已配置的库存 API 回复：'],
  ['A weekday stock report is shown at 08:30 Hong Kong time. API access, staff permissions and automation setup are configured for the workspace.','示範設定喺每個工作日香港時間 08:30 產生庫存報告工作空間已設定 API 存取、員工權限同自動化流程','演示设置在每个工作日香港时间 08:30 生成库存报告工作空间已配置 API 访问、员工权限和自动化流程'],
  ['A better way to keep business moving.','用更好嘅方式推動業務向前','用更好的方式推动业务向前'],
  ['Illustrative demo using fictional businesses, conversations and inventory. These interface scenes are based on the current JOHN CRM, with cinematic framing and simplified content. No messages, imports or automations are executed by this brochure.','本示範使用虛構商戶、對話同庫存介面以現有 JOHN CRM 為基礎，配合動畫構圖同簡化內容呢份簡介唔會實際傳送訊息、匯入文件或執行自動化','本演示使用虚构商户、对话和库存界面以现有 JOHN CRM 为基础，配合动画构图和简化内容本简介不会实际发送消息、导入文件或执行自动化'],
  ['Animated JOHN CRM product brochure','JOHN CRM 動態產品簡介','JOHN CRM 动态产品简介'],
  ['JOHN CRM · return to the beginning','JOHN CRM · 返回開場','JOHN CRM · 返回开场'],
  ['Illustrative John CRM External Chat interface','JOHN CRM 客戶對話介面示範','JOHN CRM 客户对话界面演示'],
  ['Retail customer messages with JOHN AI','零售客戶與 JOHN AI 嘅對話','零售客户与 JOHN AI 的对话'],
  ['An operations manager asks JOHN AI (Internal) about inventory and a weekday automation','營運經理向 JOHN AI（內部）查詢庫存同工作日自動化','运营经理向 JOHN AI（内部）查询库存和工作日自动化'],
  ['John CRM replies with inventory from a configured API and a weekday stock report automation','JOHN CRM 透過已設定 API 回覆庫存，並展示工作日庫存報告自動化','JOHN CRM 通过已配置 API 回复库存，并展示工作日库存报告自动化'],
  ['JOHN CRM connects to Webchat, WhatsApp, WhatsApp Business API and custom API endpoints. PDF, Excel via CSV export, PowerPoint via PDF export, and Word documents flow into the Knowledge Base.','JOHN CRM 連接網頁對話、WhatsApp、WhatsApp 商業 API 同自訂 API 端點PDF、匯出為 CSV 嘅 Excel、匯出為 PDF 嘅 PowerPoint 同 Word 文件依次加入知識庫','JOHN CRM 连接网页聊天、WhatsApp、WhatsApp 商业 API 和自定义 API 端点PDF、导出为 CSV 的 Excel、导出为 PDF 的 PowerPoint 和 Word 文档依次加入知识库'],
  ['Product photo of the red sweatshirt','紅色衛衣產品相片','红色卫衣产品照片'],
  ['Explore plans','查看方案','查看方案'],
  ['Complete','完成','完成'],
  ['Product story chapters','產品示範章節','产品演示章节'],
  ['Opening','開場','开场'],
  ['Phone conversation','手機對話','手机对话'],
  ['Channel connections','通訊渠道連接','通信渠道连接'],
  ['Knowledge Base documents','知識庫文件','知识库文档'],
  ['Internal inventory and automation','內部庫存與自動化','内部库存与自动化'],
  ['Book a demo chapter','預約示範章節','预约演示章节'],
  ['JOHN CRM · See the conversation move.','JOHN CRM · 讓對話推動業務','JOHN CRM · 让对话推动业务']
 ].map(([en,hk,cn])=>[en,{'zh-HK':hk,'zh-CN':cn}]));
 const t=text=>language==='en'?text:(translations.get(text)?.[language]??text);
 const languageExcluded='.language-picker,#tour-toggle,#chapter-number,script,style,svg';
 const originalText=[];
 const walker=document.createTreeWalker(shell,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode;
  if(node.textContent.trim()&&!node.parentElement.closest(languageExcluded))originalText.push({node,value:node.textContent});
 }
 const originalAttributes=all('[aria-label],[alt]').filter(el=>!el.closest(languageExcluded)).flatMap(el=>['aria-label','alt'].filter(attr=>el.hasAttribute(attr)).map(attr=>({el,attr,value:el.getAttribute(attr)})));
 function closeLanguages(restoreFocus=false){$('language-options').hidden=true;$('language-button').setAttribute('aria-expanded','false');if(restoreFocus)$('language-button').focus()}
 function setLanguage(next){
  language=['en','zh-HK','zh-CN'].includes(next)?next:'en';
  shell.lang=language;
  originalText.forEach(({node,value})=>{node.textContent=value.replace(/\S[\s\S]*\S|\S/,text=>t(text))});
  originalAttributes.forEach(({el,attr,value})=>el.setAttribute(attr,t(value)));

  root.querySelector('.language-label').textContent={en:'English','zh-HK':'繁體中文','zh-CN':'简体中文'}[language];
  $('language-button').setAttribute('aria-label',t('Choose language'));
  $('language-options').setAttribute('aria-label',t('Language'));
  all('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===language)));

  closeLanguages();syncTourControl();measure();
 }
 listen($('language-button'),'click',()=>{const open=$('language-options').hidden;$('language-options').hidden=!open;$('language-button').setAttribute('aria-expanded',String(open))});
 all('[data-language]').forEach(el=>listen(el,'click',()=>{setLanguage(el.dataset.language);$('language-button').focus()}));
 listen(document,'click',e=>{if(!e.composedPath()[0].closest?.('.language-picker'))closeLanguages()});
 listen(document,'keydown',e=>{if(e.key==='Escape'&&!$('language-options').hidden){e.preventDefault();closeLanguages(true)}});

 // Timeline units are percentages of the native scroll range, not elapsed time.
 // Stable holds: 0–10 intro, 30.1–31 phone, 42–45 connections, 55–58 knowledge,
 // 66–70 staff request, 87–91 CRM answer, 98–100 closing invitation.
 const chapters = [
  {name:'overview',point:0,begin:0}, {name:'conversation',point:30.5,begin:14},
  {name:'connections',point:43,begin:34}, {name:'knowledge',point:57,begin:46},
  {name:'team',point:88,begin:61}, {name:'demo',point:100,begin:94}
 ];
 const media = matchMedia('(prefers-reduced-motion: reduce)');
 let reduced = media.matches, dimensions = {}, pending = false, frame = 0, lastProgress = 0, currentChapter = -1;
 let touching = false, touchMeasure = false;
 const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
 const lerp = (a,b,t) => a+(b-a)*t;
 const ease = (a,b,p) => { const t=clamp((p-a)/(b-a)); return t*t*(3-2*t); };
 // Redundant style writes are the main per-frame cost on mobile; skip unchanged ones.
 const show = (el,opacity) => { const s=opacity.toFixed(4); if(el._shown===s)return; el._shown=s; el.style.opacity=s; el.style.visibility=opacity<.001?'hidden':'visible'; };
 const pose = (el,x,y,scale,opacity=1,rotate=0,tilt=0) => {
  show(el,opacity); el.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,0) perspective(1400px) rotateY(${tilt}deg) rotateZ(${rotate}deg) scale(${scale})`;
 };
 function accessibility(el,visible) { if(el._a11y===visible)return; el._a11y=visible; el.inert=!visible;el.setAttribute('aria-hidden',String(!visible)); }
 function heading(el,amount) { show(el,amount);el.style.transform=`translateY(${reduced?0:14*(1-amount)}px)`;accessibility(el,amount>.5); }
 // A ~31-second tour: brisk scene changes, conversational message timing,
 // and a longer hold on the completed inventory and automation result.
 const tourStages=[
  // Linear timeline input lets the phone use a single easing curve, without
  // compounding two decelerations or waiting for the first bubble at the end.
  [10,250],[19,1100,'linear'],
  // Every bubble has a 350 ms entrance; reading and typing have separate beats.
  [20,600,'linear'],[20.8,350,'linear'],
  [23,1000,'linear'],[23.8,350,'linear'],
  [25.4,700,'linear'],[26,600,'linear'],[26.8,350,'linear'],
  [28,900,'linear'],[28.8,350,'linear'],
  [29.3,800,'linear'],[30.1,350,'linear'],[31,2400,'linear'],
  // One uninterrupted pass through the connections and Knowledge Base link.
  [48.8,4000],[55.9,2900],
  // Confirm all four sources together as soon as the last document lands.
  [56.1,180,'linear'],[58,1020],
  // Keep the staff entrance and message push on one continuous timeline.
  [68,2100,'linear'],[70,1800],
  [78,1300],[83.8,2200],[88,1900],[91,2400],
  [100,900]
 ];
 // The first message shares the faster phone entrance, so its scroll range is wider.
 const retailEntranceRanges=[[13,13+9*350/1100],[20,20.8],[23,23.8],[26,26.8],[28,28.8],[29.3,30.1]];
 const retailTypingWindows=[
  {from:18.6,ready:19,until:19.8,to:20,next:1},
  {from:25.4,ready:25.5,until:25.9,to:26,next:3},
  {from:28.8,ready:28.9,until:29.2,to:29.3,next:5}
 ];
 let tour=null,tourFrame=0;
 function syncTourControl(){
  $('tour-toggle').hidden=!tour;
  $('tour-toggle').querySelector('span').textContent=t(tour?.paused?'Resume tour':'Pause tour');
  $('tour-toggle').querySelector('use').setAttribute('href',tour?.paused?'#i-play':'#i-pause');
  shell.dataset.tour=tour?(tour.paused?'paused':'playing'):'idle';
 }
 function stopTour(){cancelAnimationFrame(tourFrame);tourFrame=0;tour=null;syncTourControl()}
 function pauseTour(){if(!tour||tour.paused)return;cancelAnimationFrame(tourFrame);tourFrame=0;tour.paused=true;syncTourControl()}
 function tourTick(now){
  if(!tour||tour.paused)return;
  tour.elapsed+=Math.min(Math.max(0,now-tour.last),100);tour.last=now;
  while(tour.elapsed>=tour.segments[tour.index].duration){
   tour.elapsed-=tour.segments[tour.index].duration;tour.index++;
   if(tour.index===tour.segments.length){window.scrollTo({top:dimensions.top+dimensions.total,behavior:'instant'});stopTour();queue();root.querySelector('#demo .cta').focus({preventScroll:true});return}
  }
  const segment=tour.segments[tour.index],phase=clamp(tour.elapsed/segment.duration);
  const progress=segment.curve==='linear'?phase:ease(0,1,phase);
  // Per-frame positions make this smooth; browser smooth-scroll is not restarted on every frame.
  window.scrollTo({top:dimensions.top+dimensions.total*lerp(segment.from,segment.to,progress)/100,behavior:'instant'});
  queue();tourFrame=requestAnimationFrame(tourTick);
 }
 function startTour(){
  stopTour();const start=clamp((scrollY-dimensions.top)/dimensions.total)*100,segments=[];let from=0;
  tourStages.forEach(([to,duration,curve])=>{if(to>start){const begin=Math.max(from,start);segments.push({from:begin,to,duration:duration*(to-begin)/(to-from),curve})}from=to});
  if(!segments.length)return;
  tour={segments,index:0,elapsed:0,last:performance.now(),paused:false};syncTourControl();$('tour-toggle').focus({preventScroll:true});tourFrame=requestAnimationFrame(tourTick);
 }
 listen($('tour-start'),'click',startTour);
 listen($('tour-toggle'),'click',()=>{if(!tour)return;if(tour.paused){tour.paused=false;tour.last=performance.now();syncTourControl();tourFrame=requestAnimationFrame(tourTick)}else pauseTour()});
 listen(window,'wheel',stopTour,{passive:true});
 listen(window,'touchstart',e=>{touching=true;if(!e.composedPath()[0].closest?.('button,a,.language-picker'))stopTour()},{passive:true});
 // Mobile toolbars fire resize in the middle of the scroll gesture; measuring then
 // (full layout reads plus a compensating scroll) is what made scrolling stutter.
 // Defer that work until the gesture ends and coalesce bursts into one frame.
 const afterTouch=()=>{touching=false;if(touchMeasure){touchMeasure=false;measure()}};
 listen(window,'touchend',afterTouch,{passive:true});
 listen(window,'touchcancel',afterTouch,{passive:true});
 let resizeFrame=0;
 listen(window,'resize',()=>{if(resizeFrame)return;if(touching){touchMeasure=true;return}resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;measure()})},{passive:true});
 listen(window,'pointerdown',e=>{if(e.target===document.documentElement)stopTour()},{passive:true});
 listen(window,'keydown',e=>{if(e.key==='Escape'||(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key)&&!e.composedPath()[0].closest?.('button,a,input,select')))stopTour()});
 listen(document,'visibilitychange',()=>{if(document.hidden)pauseTour()});
 const channels = all('[data-channel]'), files = all('[data-file]'), staffMessages=all('#staff-phone [data-message]');
 const retailMessages=all('#retail-phone [data-message]'),retailThread=$('retail-phone').querySelector('.phone-thread'),retailThreadInner=retailThread.querySelector('.phone-thread-inner');
 const retailTyping=retailThread.querySelector('.typing'),retailTypingDots=all('#retail-phone .typing i');
 // Every element update() touches each frame, resolved once instead of per frame.
 const stageEl=$('stage'),overviewEl=$('overview'),heroCrm=$('hero-crm'),retailPhone=$('retail-phone'),networkEl=$('network');
 const connectionHeading=$('connection-heading'),knowledgeHeading=$('knowledge-heading'),teamHeading=$('team-heading');
 const knowledgeEl=$('knowledge'),knowledgeReady=$('knowledge-ready');
 // The kb wires are rebuilt inside makeNetwork, so they are bound there, not here.
 let kbWireGhost=null,kbWire=null;
 const staffPhone=$('staff-phone'),staffTyping=staffPhone.querySelector('.typing'),teamCrm=$('team-crm'),teamChat=teamCrm.querySelector('.chat-messages');
 const inventoryResponse=$('inventory-response'),automationReceipt=$('automation-receipt'),workflowNote=$('workflow-note'),demoEl=$('demo');
 const pageProgress=$('page-progress'),chapterNumber=$('chapter-number'),chapterDots=all('.chapter-dots button');
 const brandLight=root.querySelector('.brand .light'),brandDark=root.querySelector('.brand .dark');
 const knowledgeSlots=all('.knowledge-slot'),stockCells=all('[data-stock]');
 let channelPaths = [], wireBranches = [], wireSignals = [], networkLayout, networkLayoutKey='';
 function makeNetwork(mobile,compact) {
  // Mobile reads left to right: Webchat, Business API, WhatsApp, custom API.
  const mobileSlots=[0,2,1,3];
  networkLayout = mobile
   ? {w:420,h:690,hub:[210,330],kb:[210,448],nodes:mobileSlots.map(slot=>[(slot+.5)*105,compact?96:130]),fileX:[54,158,262,366],fileY:587,destX:[92,170,248,326],destY:474}
   : {w:1100,h:650,hub:[550,185],kb:[550,407],nodes:[[140,112],[140,277],[960,112],[960,277]],fileX:[370,490,610,730],fileY:570,destX:[409,503,597,691],destY:433};
  if(compact)Object.assign(networkLayout,{h:610,hub:[210,296],kb:[210,420],fileY:548,destY:446});
  const n=networkLayout;
  $('network').style.width=`${n.w}px`;$('network').style.height=`${n.h}px`;
  $('wires').setAttribute('viewBox',`0 0 ${n.w} ${n.h}`);
  channels.forEach((el,i)=>{el.style.left=`${n.nodes[i][0]}px`;el.style.top=`${n.nodes[i][1]}px`});
  for(const [id,point] of [['hub',n.hub],['knowledge',n.kb]]) {$(id).style.left=`${point[0]}px`;$(id).style.top=`${point[1]}px`;}
  const endpoints=[];
  const paths=n.nodes.map(([x,y],i)=>{
   if(!mobile){
    const side=i<2?-1:1,upper=i%2===0;
    const hx=n.hub[0]+side*175,hy=n.hub[1]+(upper?-8:8),ex=x-side*67,ey=y-24;
    const mx=(hx+ex)/2;
    endpoints.push([[hx,hy],[ex,ey]]);
    return `M${hx} ${hy} C${mx} ${hy} ${mx} ${ey} ${ex} ${ey}`;
   }
   const endY=y+50,startY=n.hub[1]-31,hx=n.hub[0]+(mobileSlots[i]-1.5)*50;
   endpoints.push([[hx,startY],[x,endY]]);
   const midY=(startY+endY)/2;
   return `M${hx} ${startY} C${hx} ${midY} ${x} ${midY} ${x} ${endY}`;
  });
  const kbPath=`M${n.hub[0]} ${n.hub[1]+(mobile?32:42)}V${n.kb[1]-64}`;
  $('wire-paths').innerHTML=paths.map((d,i)=>`<g class="wire-branch" data-branch="${i}"><path class="wire-ghost" d="${d}"/><path class="wire-live" pathLength="1" d="${d}" data-wire="${i}"/>${endpoints[i].map(([x,y])=>`<circle class="wire-terminal" cx="${x}" cy="${y}" r="2.5"/>`).join('')}<circle class="signal" r="2.5" data-signal="${i}"/></g>`).join('')+`<path class="wire-ghost" id="kb-wire-ghost" d="${kbPath}"/><path class="wire-live" id="kb-wire" pathLength="1" d="${kbPath}"/>`;
  channelPaths=all('[data-wire]').map(path=>({path,length:path.getTotalLength()}));
 wireBranches=[...$('wire-paths').querySelectorAll('[data-branch]')];
 wireSignals=[...$('wire-paths').querySelectorAll('[data-signal]')];
 kbWireGhost=$('kb-wire-ghost');kbWire=$('kb-wire');
 }
 function measure() {
  // Keep the scroll anchor while the user is between chapters, but never
  // program-scroll during a touch gesture — that is what made mobile feel rough.
  const preserve=!touching&&dimensions.total&&scrollY>=dimensions.top&&scrollY<=dimensions.top+dimensions.total;
  const w=document.documentElement.clientWidth,mobile=w<=760;
  // The sticky stage is sized 100dvh so it always reaches the physical viewport
  // bottom, even while mobile toolbars collapse mid-scroll. Measure against the
  // live stage box (not innerHeight) so the phone always fits; toolbar changes
  // land as a resize, which is deferred to the end of the touch gesture and then
  // re-measured with the scroll anchor preserved.
  const h=stageEl.offsetHeight||innerHeight,compact=mobile&&h<=720;
  const layoutKey=`${mobile}:${compact}`;
  if(layoutKey!==networkLayoutKey){networkLayoutKey=layoutKey;makeNetwork(mobile,compact)}
  dimensions={w,h,mobile,top:host.getBoundingClientRect().top+scrollY,total:Math.max(1,$('story').offsetHeight-h)};
  dimensions.phoneScale=Math.min((w-52)/306,(h-157)/612,1.04);
  const retailThreadStyle=getComputedStyle(retailThread),retailSpace=retailThread.clientHeight-parseFloat(retailThreadStyle.paddingTop)-parseFloat(retailThreadStyle.paddingBottom);
  // Each arrival scrolls enough to fit its content, including the product photo.
  // Customer messages also reserve space for the upcoming typing indicator.
  dimensions.retailScroll=retailMessages.map((el,i)=>Math.max(0,el.offsetTop+el.offsetHeight-retailSpace,i%2===0?retailMessages[i+1].offsetTop+retailTyping.offsetHeight-retailSpace:0));
  dimensions.retailPaddingTop=parseFloat(retailThreadStyle.paddingTop);
  
  dimensions.appTop=mobile?Math.max(172,h*.14+80):Math.max(185,h*.145+63);
  dimensions.appBottom=h-104;
  dimensions.staffScale=Math.min((w-60)/306,(dimensions.appBottom-dimensions.appTop)/612,.94);
  dimensions.staffPush=staffMessages[1].offsetHeight+(parseFloat(getComputedStyle($('staff-phone').querySelector('.phone-thread-inner')).rowGap)||0);
 dimensions.appScale=mobile?Math.min((w-28)/366,1.06):Math.min((w-100)/1120,1.1);
 $('team-crm').style.height=`${(dimensions.appBottom-dimensions.appTop)/dimensions.appScale}px`;
 dimensions.chatRange=Math.max(0,teamChat.scrollHeight-teamChat.clientHeight);
 dimensions.netScale=mobile?Math.min((w-24)/420,(h-228)/(compact?610:690)):Math.min((w-90)/1100,(h-232)/650,1.02);
 if(preserve)window.scrollTo({top:dimensions.top+lastProgress/100*dimensions.total,behavior:'instant'});
 update();
 }
 function update() {
  pending=false;
  const raw=clamp((scrollY-dimensions.top)/dimensions.total)*100;lastProgress=raw;
  let p=raw;
  if(reduced) p=raw<14?0:raw<34?30.5:raw<46?43:raw<61?57:raw<73?68:raw<94?88:100;
  const {w,h,mobile}=dimensions;
  const entry=ease(10,17,p),retailOut=ease(31,36,p),networkIn=ease(32,37,p),networkOut=ease(58,63,p),knowledgeIn=ease(45,49,p);
 const staffIn=ease(59,64,p),morph=ease(70,78,p),ending=ease(91,98,p);
 const dark=ease(58,64,p)*(1-ease(91,98,p));
 // Recolour the scene only while the tone is actually changing, not on every frame.
 if(dark!==lastTone){
  lastTone=dark;onToneChange?.(dark);
  const mix=(a,b)=>a.map((v,i)=>Math.round(lerp(v,b[i],dark))).join(',');
  shell.style.setProperty('--paper',`rgb(${mix([247,245,240],[16,42,50])})`);
  shell.style.setProperty('--text',`rgb(${mix([16,33,40],[247,245,240])})`);
  shell.style.setProperty('--muted',`rgb(${mix([104,119,124],[160,183,186])})`);
  brandLight.style.opacity=1-dark;brandDark.style.opacity=dark;
 }
 show(overviewEl,1-entry);overviewEl.style.transform=`translateY(${-entry*35}px)`;accessibility(overviewEl,entry<.5);
  // The opening app exits before the phone conversation settles in the centre.
  const heroScale=mobile?Math.min((w-20)/720,(h-455)/570,.60):Math.min(w*.84/1120,(h-Math.max(122,h*.13)-110)/570,1.30);
  const hx=mobile?Math.max(80,24+1120*heroScale/2-w/2):w*.45+1120*heroScale/2-w/2,hy=mobile?h/2-125-570*heroScale/2:h/2-110-570*heroScale/2;
 pose(heroCrm,hx+entry*(mobile?200:200),hy+entry*35,heroScale*(1-.06*entry),1-ease(10,16,p));
 accessibility(heroCrm,p<14);
  const heroPhoneScale=mobile?Math.min(.50,(h-430)/612):Math.min(.84,(570*heroScale-92)/612);
  const phoneEnter=ease(10,19,p),phoneScale=lerp(heroPhoneScale,dimensions.phoneScale,phoneEnter)*(1-.72*retailOut);
  const px=lerp(mobile?Math.min(w*.29,w/2-306*heroPhoneScale/2-12):Math.min(w*.35,w/2-306*heroPhoneScale/2-24),0,phoneEnter),py=lerp(mobile?h/2-105-612*heroPhoneScale/2:h/2-88-612*heroPhoneScale/2,12,phoneEnter)-retailOut*35;
 pose(retailPhone,px,py,phoneScale,1-retailOut);
 accessibility(retailPhone,p>=14&&p<34);
  const retailArrivals=retailEntranceRanges.map(([from,to])=>ease(from,to,p));
  retailMessages.forEach((el,i)=>{const a=Math.max(i<2?1-ease(8,12,p):0,retailArrivals[i]);show(el,a);el.style.transform=`translateY(${20*(1-a)}px) scale(${lerp(.92,1,a)})`;});
  // Measure translated bubble heights once; scroll the conversation with each new arrival.
  const retailLift=dimensions.retailScroll.reduce((lift,target,i)=>lift+(target-(dimensions.retailScroll[i-1]||0))*Math.max(i<2?1-ease(8,12,p):0,retailArrivals[i]),0);
  retailThreadInner.style.transform=`translate3d(0,${-retailLift}px,0)`;
  const typingWindow=retailTypingWindows.find(beat=>p>=beat.from&&p<beat.to);
  show(retailTyping,typingWindow?ease(typingWindow.from,typingWindow.ready,p)*(1-ease(typingWindow.until,typingWindow.to,p)):0);
  if(typingWindow){
   retailTyping.style.bottom='auto';
   retailTyping.style.top=`${dimensions.retailPaddingTop+retailMessages[typingWindow.next].offsetTop-retailLift}px`;
   const phase=(p-typingWindow.from)/(typingWindow.to-typingWindow.from)*Math.PI*3;
   retailTypingDots.forEach((dot,i)=>{const pulse=Math.max(0,Math.sin(phase-i*.8));dot.style.transform=`translateY(${-2*pulse}px)`;dot.style.opacity=.45+.55*pulse;});
  }
  // Channels draw outward. Document icons then move into the same connected hub.
  const netOpacity=networkIn*(1-networkOut),netY=mobile?h*.035-(h<=720?12:0):-h*.006;
 pose(networkEl,0,netY,dimensions.netScale*(1+.045*(1-networkIn)-.06*networkOut),netOpacity);
 accessibility(networkEl,p>=34&&p<61);
 heading(connectionHeading,networkIn*(1-ease(45,47,p))*(1-networkOut));
 heading(knowledgeHeading,ease(47,49,p)*(1-networkOut));
 // Overlapping, linear draws keep the signals moving through every branch.
 // The shared scroll motion supplies the easing; individual wires never pause mid-path.
 channels.forEach((el,i)=>{const a=ease(35+i*.3,37+i*.3,p);show(el,a);el.style.transform=`translate(-50%,-50%) translateY(${10*(1-a)}px)`;const draw=clamp((p-(34.4+i*.3))/7.7);show(wireBranches[i],ease(34+i*.3,35+i*.3,p));channelPaths[i].path.style.strokeDashoffset=1-draw;const dot=wireSignals[i];const pos=channelPaths[i].path.getPointAtLength(channelPaths[i].length*draw);dot.setAttribute('cx',pos.x);dot.setAttribute('cy',pos.y);show(dot,draw>0&&draw<1?1:0);});
 show(knowledgeEl,ease(44,47,p));show(kbWireGhost,ease(42.25,44,p));kbWire.style.strokeDashoffset=1-clamp((p-42.25)/3.75);
 files.forEach((el,i)=>{const appear=ease(45+i*.65,46.3+i*.65,p),ingest=ease(49.2+i*1.3,52+i*1.3,p);const n=networkLayout;const fx=lerp(n.fileX[i],n.destX[i],ingest),fy=lerp(n.fileY,n.destY,ingest)-Math.sin(ingest*Math.PI)*33;el.style.transform=`translate3d(${fx}px,${fy}px,0) translate(-50%,-50%) scale(${lerp(1,.64,ingest)}) rotate(${Math.sin(ingest*Math.PI)*(i%2?7:-7)}deg)`;show(el,appear);show(el.querySelector('.file-caption'),1-ease(.05,.6,ingest));show(knowledgeSlots[i],1-ease(.3,.9,ingest));});
 show(knowledgeReady,ease(55.9,56.1,p));
 // Staff phone shares the request with the expanding CRM conversation.
 heading(teamHeading,staffIn*(1-ending));
 pose(staffPhone,-morph*(mobile?90:250),(dimensions.appTop+dimensions.appBottom-h)/2-morph*24,dimensions.staffScale*(1-.6*morph),staffIn*(1-ease(72,77,p)),-morph*7,morph*-12);
 accessibility(staffPhone,p>=61&&p<75);
  // Lift the stack from the first arrival, without parking it between messages.
  // Short bubble entrances share the measured lift so translated messages stay apart.
  const staffArrival=[ease(62.8,63.9,p),ease(64.8,65.9,p)];
  const pushedOffset=dimensions.staffPush*(1-ease(62.8,66,p));
  staffMessages.forEach((el,i)=>{const a=staffArrival[i];show(el,a);el.style.transform=`translate3d(0,${pushedOffset+18*(1-a)}px,0)`;});
 show(staffTyping,ease(68,69,p)*(1-ease(73,75,p)));
 const appIn=ease(71,78,p),appOpacity=appIn*(1-ending);
 pose(teamCrm,lerp(mobile?36:125,0,appIn),(dimensions.appTop+dimensions.appBottom-h)/2+25*(1-appIn)-25*ending,dimensions.appScale*lerp(.66,1,appIn),appOpacity,0,lerp(9,0,appIn));
 accessibility(teamCrm,p>=75&&p<94);
 const response=ease(77.5,80,p);show(inventoryResponse,response);inventoryResponse.style.transform=`translateY(${14*(1-response)}px)`;
 stockCells.forEach((el,i)=>{const a=ease(79+i*1.1,80.5+i*1.1,p);show(el,a);el.style.transform=`translateY(${8*(1-a)}px)`;});
 const chatTarget=dimensions.chatRange*ease(79,87,p);
 if(Math.abs(teamChat.scrollTop-chatTarget)>.25)teamChat.scrollTop=chatTarget;
 const confirmation=ease(84,86.5,p);show(automationReceipt,confirmation);automationReceipt.style.transform=`translateY(${12*(1-confirmation)}px)`;
 show(workflowNote,staffIn*(1-ending));
 heading(demoEl,ending);
 pageProgress.style.transform=`scaleX(${raw/100})`;
 let ch=0;chapters.forEach((c,i)=>{if(raw>=c.begin)ch=i});
 if(ch!==currentChapter){currentChapter=ch;chapterNumber.textContent=String(ch+1).padStart(2,'0');chapterDots.forEach((el,i)=>{if(i===ch)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current')});}
 }
 function queue(){if(!pending){pending=true;frame=requestAnimationFrame(update)}}
 function jump(point,instant=false){stopTour();lastProgress=point;window.scrollTo({top:dimensions.top+dimensions.total*point/100,behavior:reduced||instant?'instant':'smooth'});queue()}
 all('[data-stop]').forEach(el=>listen(el,'click',e=>{e.preventDefault();const chapter=chapters.find(c=>c.name===el.dataset.stop);if(chapter){history.replaceState(null,'',`#${chapter.name}`);jump(chapter.point)}}));
 function setReduced(value){reduced=value;shell.classList.toggle('reduced',value);queue()}
 listen(media,'change',e=>setReduced(e.matches));
 listen(root.querySelector('.skip'),'click',e=>{e.preventDefault();stopTour();shell.classList.add('reading');lastTone=0;onToneChange?.(0);$('readable').focus();window.scrollTo({top:0,behavior:'instant'})});
 listen($('back-animation'),'click',()=>{shell.classList.remove('reading');measure();jump(0,true);$('tour-start').focus({preventScroll:true})});
 listen(window,'scroll',()=>{if(!shell.classList.contains('reading'))queue()},{passive:true});
 listen(window,'hashchange',()=>navigateHash(location.hash));

 function chapterForHash(hash) {
  const aliases={top:'overview',features:'connections','chat-demo':'conversation',retail:'conversation',logistics:'team'};
  const name=hash.replace(/^#/,'');
  return chapters.find(c=>c.name===(aliases[name]||name));
 }
 function navigateHash(hash) {
  // These sections sit outside the story's shadow root, including on initial load.
  if(hash==='#pricing'||hash==='#contact'){
   stopTour();onNavigate(hash.slice(1));return true;
  }
  const chapter=chapterForHash(hash);
  if(!chapter)return false;
  if(shell.classList.contains('reading')){shell.classList.remove('reading');measure()}
  jump(chapter.point,true);return true;
 }
 listen(root,'click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.composedPath().find(el=>el instanceof HTMLAnchorElement);
  const section=anchor?.getAttribute('href')?.slice(1);
  if(section==='contact'||section==='pricing'){event.preventDefault();stopTour();onNavigate(section)}
 });
 listen(document,'click',event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.composedPath().find(el=>el instanceof HTMLAnchorElement);
  const href=anchor?.getAttribute('href');
  if(!href?.startsWith('#')||root.contains(anchor))return;
  if(href==='#pricing'||href==='#contact'){
   event.preventDefault();stopTour();onNavigate(href.slice(1));return;
  }
  if(chapterForHash(href)){
   event.preventDefault();stopTour();
   onSectionTransition(()=>{
    navigateHash(href);
    if(location.hash!==href)history.pushState(null,'',href);
    host.focus({preventScroll:true});
   });
  }
 });
 setLanguage(initialLanguage);setReduced(reduced);
 // Fonts and product images can change the message stack after the first measurement.
 const retailLayoutObserver=new ResizeObserver(measure);
 retailLayoutObserver.observe(retailThreadInner);
 navigateHash(location.hash);
 return {
  setLanguage,
  destroy(){lifecycle.abort();retailLayoutObserver.disconnect();stopTour();cancelAnimationFrame(frame);},
 };
}
