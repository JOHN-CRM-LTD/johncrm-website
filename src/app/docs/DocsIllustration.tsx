import type { ReactNode } from 'react';
import {
  ArrowUp, ArrowUpRight, BookOpen, Bot, Building2, CalendarDays, Check,
  ChevronDown, CircleCheck, Clock3, FileText, Folder, MessageCircle,
  MoreHorizontal, Paperclip, Plus, Search, ShieldCheck, Users, Zap,
} from 'lucide-react';
import johnLogo from '../../assets/johncrm.svg';
import { phoneScreenMarkup } from '../product-story/phone-frame.js';
import '../product-story/phone-frame.css';
import '../../styles/docs-illustrations.css';

export type DocsIllustrationKind = 'workspace' | 'support' | 'conversations' | 'knowledge' | 'automation' | 'users';
type Language = 'EN' | 'CN' | 'HK';

const english = {
  workspace: 'Harbour Studio', admin: 'Workspace admin',
  support: 'John Support', internal: 'Internal Chat', external: 'External Chat', users: 'Users',
  knowledge: 'Knowledge Base', automation: 'Automations', calendar: 'Calendar',
  workspaceTitle: 'Your team, connected.', workspaceBody: 'One workspace for your conversations, knowledge and everyday work.',
  switchWorkspace: 'Switch workspace', selected: 'Current workspace', personal: 'Personal workspace', justYou: 'Just you',
  workspaceAlt: 'JOHN CRM workspace navigation with Harbour Studio selected and a personal workspace available.',
  supportAlt: 'A John Support conversation showing a question, an answer and a change receipt with an available Undo action.',
  conversationAlt: 'A customer conversation on the same iPhone frame as the homepage, alongside the External Chat inbox.',
  knowledgeAlt: 'Knowledge Base with a Customer service folder and two sources marked Ready.',
  automationAlt: 'An automation with plain-language instructions, a weekday trigger and a preview result.',
  usersAlt: 'Users with fictional customer records and a separate workspace member invitation.',
  question: 'Add a note for Maya: prefers afternoon visits.', answer: 'I added the note to Maya’s customer record. You can review this change below.',
  message: 'Type a message…', receipt: 'Change receipt', changed: 'Customer note updated', undo: 'Undo',
  supportPrompt: 'Help with your workspace', supportHint: 'Ask a question or describe what you need.',
  customer: 'Maya Chen', customerTwo: 'Jamie Lee', customerThree: 'Alex Taylor', teammate: 'Jordan Lee',
  today: 'Today', now: 'Now', business: 'Business account', phoneQuestion: 'Can I visit your store today?',
  phoneAnswer: 'Of course. We are open until 6 PM. What time works for you?', phoneReply: 'Around 3 PM. Thank you!',
  phoneFinal: 'See you then! Our team is here if you need anything else.', phoneCompose: 'Message…',
  website: 'Website chat', inbox: 'A connected conversation', inboxBody: 'Keep the conversation and its context together in External Chat.',
  lastMessage: 'Around 3 PM. Thank you!', humanReply: 'Reply to customer',
  spaces: 'Spaces', service: 'Customer service', sourceName: 'Source', status: 'Status', ready: 'Ready',
  files: 'Files and sources', policy: 'Store information.pdf', faq: 'Frequently asked questions',
  audience: 'Audience access', externalAudience: 'External customers', knowledgeNote: 'Organise sources, then test an answer.',
  automationName: 'Daily team update', instructions: 'Instructions', instructionBody: 'Summarise new customer enquiries and share a short update with the team.',
  trigger: 'Trigger', schedule: 'Weekdays · 08:30', preview: 'Preview', previewOnly: 'Preview only — nothing was sent or saved.',
  previewResult: 'Team update prepared', complete: 'Complete', runHistory: 'Run history',
  customerRecords: 'Customer records', userTypes: 'User Types', member: 'Member', customerType: 'Customer',
  workspaceMembers: 'Workspace members', invite: 'Invite member', invited: 'Invitation pending',
  email: 'Email', access: 'Access',
};

const copy: Record<Language, Record<keyof typeof english, string>> = {
  EN: english,
  CN: {
    workspace: '海港工作室', admin: '工作区管理员',
    support: 'John 支持', internal: '内部聊天', external: '外部聊天', users: '用户', knowledge: '知识库', automation: '自动化', calendar: '日历',
    workspaceTitle: '让团队紧密协作。', workspaceBody: '在同一个工作区管理对话、知识和日常工作。',
    switchWorkspace: '切换工作区', selected: '当前工作区', personal: '个人工作区', justYou: '只有您',
    workspaceAlt: 'JOHN CRM 工作区导航，当前选中海港工作室，也可切换到个人工作区。',
    supportAlt: 'John 支持对话，展示问题、回答以及提供撤销操作的变更回执。',
    conversationAlt: '客户对话使用与首页相同的 iPhone 边框，旁边显示外部聊天收件箱。',
    knowledgeAlt: '知识库中的客户服务文件夹，包含两个状态为就绪的来源。',
    automationAlt: '自动化包含自然语言指令、工作日触发器和预览结果。',
    usersAlt: '用户页面包含虚构客户记录，以及单独的工作区成员邀请。',
    question: '为陈美雅添加备注：偏好下午到访。', answer: '已将备注添加到陈美雅的客户记录。您可以在下方查看此变更。',
    message: '输入消息…', receipt: '变更回执', changed: '客户备注已更新', undo: '撤销',
    supportPrompt: '获取工作区帮助', supportHint: '提出问题，或描述您的需求。',
    customer: '陈美雅', customerTwo: '李嘉敏', customerThree: '张浩然', teammate: '李俊贤',
    today: '今天', now: '刚刚', business: '商业账号', phoneQuestion: '今天可以来你们门店吗？',
    phoneAnswer: '当然可以。我们营业到下午 6 点，您什么时候方便？', phoneReply: '下午 3 点左右，谢谢！',
    phoneFinal: '到时见！如需其他帮助，我们的团队随时为您服务。', phoneCompose: '消息…',
    website: '网站聊天', inbox: '对话始终相连', inboxBody: '在外部聊天中保留完整对话及其上下文。',
    lastMessage: '下午 3 点左右，谢谢！', humanReply: '回复客户',
    spaces: '空间', service: '客户服务', sourceName: '来源', status: '状态', ready: '就绪',
    files: '文件和来源', policy: '门店信息.pdf', faq: '常见问题', audience: '受众访问权限', externalAudience: '外部客户',
    knowledgeNote: '整理来源，然后测试回答。', automationName: '团队每日简报', instructions: '指令',
    instructionBody: '汇总新的客户咨询，并向团队分享简短更新。', trigger: '触发器', schedule: '工作日 · 08:30',
    preview: '预览', previewOnly: '仅为预览，未发送或保存任何内容。', previewResult: '团队简报已准备好', complete: '已完成', runHistory: '运行历史',
    customerRecords: '客户记录', userTypes: '用户类型', member: '成员', customerType: '客户',
    workspaceMembers: '工作区成员', invite: '邀请成员', invited: '邀请待接受', email: '邮箱', access: '访问权限',
  },
  HK: {
    workspace: '海港工作室', admin: '工作區管理員',
    support: 'John 支援', internal: '內部聊天', external: '外部對話', users: '用戶', knowledge: '知識庫', automation: '自動化', calendar: '日曆',
    workspaceTitle: '讓團隊緊密協作。', workspaceBody: '在同一個工作區管理對話、知識和日常工作。',
    switchWorkspace: '切換工作區', selected: '目前工作區', personal: '個人工作區', justYou: '只有您',
    workspaceAlt: 'JOHN CRM 工作區導覽，目前選中海港工作室，亦可切換至個人工作區。',
    supportAlt: 'John 支援對話，展示問題、回答及提供復原操作的變更收據。',
    conversationAlt: '客戶對話使用與首頁相同的 iPhone 邊框，旁邊顯示外部對話收件匣。',
    knowledgeAlt: '知識庫中的客戶服務資料夾，包含兩個狀態為就緒的來源。',
    automationAlt: '自動化包含自然語言指令、工作日觸發條件及預覽結果。',
    usersAlt: '用戶頁面包含虛構客戶記錄，以及獨立的工作區成員邀請。',
    question: '為陳美雅新增備註：偏好下午到訪。', answer: '已將備註加入陳美雅的客戶記錄。您可以在下方查看此變更。',
    message: '輸入訊息…', receipt: '變更收據', changed: '客戶備註已更新', undo: '復原',
    supportPrompt: '取得工作區協助', supportHint: '提出問題，或描述您的需要。',
    customer: '陳美雅', customerTwo: '李嘉敏', customerThree: '張浩然', teammate: '李俊賢',
    today: '今天', now: '剛剛', business: '商業帳號', phoneQuestion: '今天可以來你們門店嗎？',
    phoneAnswer: '當然可以。我們營業至下午 6 時，您甚麼時候方便？', phoneReply: '下午 3 時左右，謝謝！',
    phoneFinal: '到時見！如需其他協助，我們的團隊隨時為您服務。', phoneCompose: '訊息…',
    website: '網站對話', inbox: '對話始終相連', inboxBody: '在外部對話中保留完整對話及其上下文。',
    lastMessage: '下午 3 時左右，謝謝！', humanReply: '回覆客戶',
    spaces: '空間', service: '客戶服務', sourceName: '來源', status: '狀態', ready: '就緒',
    files: '檔案和來源', policy: '門店資訊.pdf', faq: '常見問題', audience: '受眾存取權限', externalAudience: '外部客戶',
    knowledgeNote: '整理來源，然後測試回答。', automationName: '團隊每日簡報', instructions: '指令',
    instructionBody: '匯總新的客戶查詢，並向團隊分享簡短更新。', trigger: '觸發條件', schedule: '工作日 · 08:30',
    preview: '預覽', previewOnly: '僅供預覽，未傳送或儲存任何內容。', previewResult: '團隊簡報已準備好', complete: '已完成', runHistory: '執行記錄',
    customerRecords: '客戶記錄', userTypes: '用戶類型', member: '成員', customerType: '客戶',
    workspaceMembers: '工作區成員', invite: '邀請成員', invited: '邀請待接受', email: '電郵', access: '存取權限',
  },
};

type Copy = typeof english;

function Avatar({ children, john = false }: { children: ReactNode; john?: boolean }) {
  return <span className={`di-avatar${john ? ' di-avatar-john' : ''}`}>{children}</span>;
}

function Sidebar({ text, active }: { text: Copy; active: DocsIllustrationKind }) {
  const items = [
    ['support', Bot, text.support], ['internal', MessageCircle, text.internal], ['conversations', MessageCircle, text.external],
    ['users', Users, text.users], ['calendar', CalendarDays, text.calendar], ['automation', Zap, text.automation], ['knowledge', BookOpen, text.knowledge],
  ] as const;
  return <div className="di-sidebar">
    <img className="di-logo" src={johnLogo} alt="" />
    <div className="di-workspace"><Avatar><Building2 size={15} /></Avatar><span>{text.workspace}<small>{text.admin}</small></span><ChevronDown size={12} /></div>
    <div className="di-nav">{items.map(([key, Icon, title]) => <div className={active === key ? 'di-nav-item di-nav-active' : 'di-nav-item'} key={key}><Icon size={15} /><span>{title}</span></div>)}</div>
    <div className="di-sidebar-person"><Avatar>{text.teammate.slice(0, 1)}</Avatar><span>{text.teammate}<small>{text.admin}</small></span></div>
  </div>;
}

function Window({ children, text, kind }: { children: ReactNode; text: Copy; kind: DocsIllustrationKind }) {
  return <div className="di-window">
    <div className="di-windowbar"><span className="di-window-dots"><i /><i /><i /></span><span>JOHN CRM · {text.workspace}</span><span className="di-window-spacer" /></div>
    <div className="di-window-body"><Sidebar text={text} active={kind} /><div className="di-main">{children}</div></div>
  </div>;
}

function Workspace({ text }: { text: Copy }) {
  return <Window text={text} kind="workspace"><div className="di-workspace-main">
    <span className="di-eyebrow">JOHN CRM</span><div className="di-large-title">{text.workspaceTitle}</div><p className="di-muted">{text.workspaceBody}</p>
    <div className="di-switcher"><div className="di-section-label">{text.switchWorkspace}</div>
      <div className="di-workspace-option di-workspace-selected"><Avatar><Building2 size={16} /></Avatar><span>{text.workspace}<small>{text.selected}</small></span><Check size={16} /></div>
      <div className="di-workspace-option"><Avatar>{text.teammate.slice(0, 1)}</Avatar><span>{text.personal}<small>{text.justYou}</small></span></div>
    </div>
  </div></Window>;
}

function Support({ text }: { text: Copy }) {
  return <Window text={text} kind="support"><div className="di-toolbar"><Bot size={17} /><strong>{text.support}</strong><MoreHorizontal size={16} /></div>
    <div className="di-support-thread"><div className="di-chat-date">{text.today}</div>
      <div className="di-question">{text.question}</div><div className="di-response"><Avatar john>J</Avatar><div><strong>John</strong><p>{text.answer}</p></div></div>
      <div className="di-receipt"><CircleCheck size={17} /><span><small>{text.receipt}</small><strong>{text.changed}</strong></span><span className="di-text-action">{text.undo}</span></div>
    </div><div className="di-composer"><Plus size={15} /><span>{text.message}</span><Paperclip size={15} /><span className="di-send"><ArrowUp size={14} /></span></div>
  </Window>;
}

// Every interpolated value is escaped; this is a static illustration, never a live chat.
const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const phoneSignalIcons = '<svg class="icon" viewBox="0 0 24 24"><path d="M3 20v-3m5 3v-7m5 7V9m5 11V5" stroke="currentColor" stroke-width="2.5" fill="none"/></svg><svg class="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="17" height="10" rx="2" stroke="currentColor" fill="none"/><path d="M22 10v4M5 10h11v4H5Z" fill="currentColor"/></svg>';

function Conversation({ text }: { text: Copy }) {
  const message = (body: string, sent: boolean, time: string) => `<div class="di-phone-bubble${sent ? ' di-phone-sent' : ''}">${escape(body)}<small>${time}${sent ? ' <span>✓✓</span>' : ''}</small></div>`;
  const content = `<div class="di-phone-header"><span class="di-phone-back">‹</span><span class="di-avatar di-avatar-john">J</span><span><strong>JOHN AI</strong><small>${escape(text.business)}</small></span><span class="di-phone-more">⋮</span></div><div class="di-phone-thread"><div class="di-chat-date">${escape(text.today)}</div>${message(text.phoneQuestion, true, '09:41')}${message(text.phoneAnswer, false, '09:42')}${message(text.phoneReply, true, '09:42')}${message(text.phoneFinal, false, '09:43')}</div><div class="di-phone-compose"><span>＋</span><span>${escape(text.phoneCompose)}</span><span class="di-phone-send">↑</span></div>`;
  return <div className="di-conversation-scene">
    <div className="di-phone-slot"><div className="john-phone-frame di-phone" dangerouslySetInnerHTML={{ __html: phoneScreenMarkup(content, phoneSignalIcons) }} /></div>
    <div className="di-inbox-side"><div className="di-inbox-heading"><span className="di-feature-icon"><MessageCircle size={19} /></span><div className="di-large-title">{text.inbox}</div><p className="di-muted">{text.inboxBody}</p></div>
      <div className="di-inbox-card"><div className="di-toolbar"><MessageCircle size={15} /><strong>{text.external}</strong><MoreHorizontal size={15} /></div><div className="di-inbox-customer"><Avatar>{text.customer.slice(0, 1)}</Avatar><span><strong>{text.customer}</strong><small>{text.website}</small></span><span className="di-online-dot" /></div><div className="di-inbox-message">{text.lastMessage}<small>{text.now}</small></div><div className="di-inbox-reply">{text.humanReply}<ArrowUpRight size={14} /></div></div>
    </div>
  </div>;
}

function Knowledge({ text }: { text: Copy }) {
  return <Window text={text} kind="knowledge"><div className="di-toolbar"><BookOpen size={17} /><strong>{text.knowledge}</strong><Plus size={16} /></div>
    <div className="di-content"><div className="di-breadcrumb">{text.spaces}<span>/</span>{text.workspace}</div><div className="di-folder-title"><Folder size={19} /><strong>{text.service}</strong></div><div className="di-file-list"><div className="di-table-head"><span>{text.files}</span><span>{text.status}</span></div>{[text.policy, text.faq].map((file) => <div className="di-file" key={file}><FileText size={17} /><span>{file}</span><span className="di-status"><Check size={11} />{text.ready}</span></div>)}</div><div className="di-access"><ShieldCheck size={16} /><span>{text.audience}<strong>{text.externalAudience}</strong></span></div><div className="di-note"><CircleCheck size={14} />{text.knowledgeNote}</div></div>
  </Window>;
}

function Automation({ text }: { text: Copy }) {
  return <Window text={text} kind="automation"><div className="di-toolbar"><Zap size={17} /><strong>{text.automationName}</strong><MoreHorizontal size={16} /></div>
    <div className="di-content"><div className="di-section-label">{text.instructions}</div><div className="di-instructions">{text.instructionBody}</div><div className="di-trigger"><Clock3 size={17} /><span><small>{text.trigger}</small><strong>{text.schedule}</strong></span></div>
      <div className="di-preview"><div className="di-preview-head"><span><Zap size={14} />{text.preview}</span><span className="di-status"><Check size={11} />{text.complete}</span></div><strong>{text.previewResult}</strong><p>{text.previewOnly}</p></div><div className="di-history"><Clock3 size={13} />{text.runHistory}<ArrowUpRight size={13} /></div>
    </div>
  </Window>;
}

function UserAccess({ text }: { text: Copy }) {
  return <Window text={text} kind="users"><div className="di-toolbar"><Users size={17} /><strong>{text.users}</strong><Search size={15} /></div>
    <div className="di-content"><div className="di-tab-line"><strong>{text.customerRecords}</strong><span>{text.userTypes}</span></div><div className="di-users-list">{[text.customer, text.customerTwo, text.customerThree].map((name, index) => <div className="di-user-row" key={name}><Avatar>{name.slice(0, 1)}</Avatar><span>{name}<small>{['maya', 'jamie', 'alex'][index]}@example.com</small></span><span className="di-user-type">{text.customerType}</span></div>)}</div>
      <div className="di-members"><div className="di-members-heading"><strong>{text.workspaceMembers}</strong><span className="di-text-action">{text.invite}<Plus size={12} /></span></div><div className="di-member"><span>sam@example.com<small>{text.invited}</small></span><span className="di-user-type">{text.member}</span></div></div>
    </div>
  </Window>;
}

const illustrations = { workspace: Workspace, support: Support, conversations: Conversation, knowledge: Knowledge, automation: Automation, users: UserAccess };
const descriptions = { workspace: 'workspaceAlt', support: 'supportAlt', conversations: 'conversationAlt', knowledge: 'knowledgeAlt', automation: 'automationAlt', users: 'usersAlt' } as const;

/** Static, accessible illustrations. The article owns its figure caption. */
export default function DocsIllustration({ kind, language }: { kind: DocsIllustrationKind; language: Language }) {
  const text = copy[language];
  const Illustration = illustrations[kind];
  return <div className={`docs-illustration docs-illustration-${kind}`} role="img" aria-label={text[descriptions[kind]]}>
    <div aria-hidden="true"><Illustration text={text} /></div>
  </div>;
}
