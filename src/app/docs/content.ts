/** Customer documentation. Tuple order follows the site's language selector. */
export type LocalizedText = readonly [string, string, string];
export function localize(value: LocalizedText, language: 'EN' | 'CN' | 'HK'): string {
  return value[language === 'CN' ? 1 : language === 'HK' ? 2 : 0];
}

export type DocFigure = 'workspace' | 'support' | 'conversations' | 'knowledge' | 'automation' | 'users';
export type DocBlock =
  | { type: 'paragraph'; text: LocalizedText }
  | { type: 'steps' | 'list'; items: readonly LocalizedText[] }
  | { type: 'note'; title: LocalizedText; text: LocalizedText }
  | { type: 'code'; label: string; code: string }
  | { type: 'accordion'; title: LocalizedText; body: readonly LocalizedText[] };
export type DocSection = { id: string; title: LocalizedText; blocks: readonly DocBlock[] };
export type DocArticle = {
  path: string;
  title: LocalizedText;
  description: LocalizedText;
  group: 'start' | 'work' | 'manage';
  figure: DocFigure;
  sections: readonly DocSection[];
  /** Maintainer references in the JohnCRM app repository; not public links. */
  sources: readonly string[];
};

export const DOC_ARTICLES: readonly DocArticle[] = [
  {
    path: '/docs',
    title: ['Getting started', '快速入门', '快速入門'],
    description: ['Get into your workspace, find your way around, and take your first steps with JOHN CRM.', '进入工作区、熟悉各项功能，开始使用 JOHN CRM。', '進入工作區、熟悉各項功能，開始使用 JOHN CRM。'],
    group: 'start', figure: 'workspace',
    sections: [
      { id: 'sign-in', title: ['Sign in to JOHN CRM', '登录 JOHN CRM', '登入 JOHN CRM'], blocks: [
        { type: 'steps', items: [
          ['Open your team’s JOHN CRM sign-in page. Use your email and password, or Continue with Google.', '打开团队的 JOHN CRM 登录页面，使用邮箱和密码登录，或选择通过 Google 继续。', '開啟團隊的 JOHN CRM 登入頁面，使用電郵和密碼登入，或選擇透過 Google 繼續。'],
          ['If you received an invitation, open its link and use the invited email address to create an account or sign in.', '如果您收到了邀请，请打开邀请链接，并使用受邀邮箱创建账号或登录。', '如果您收到邀請，請開啟邀請連結，並使用獲邀的電郵地址建立帳戶或登入。'],
          ['Forgot your password? Use the password reset option on the sign-in page and follow the email link.', '忘记密码时，请使用登录页面的密码重置选项，再打开邮件中的链接。', '忘記密碼時，請使用登入頁面的密碼重設選項，再開啟電郵中的連結。'],
        ] },
      ] },
      { id: 'your-workspace', title: ['Create or join a workspace', '创建或加入工作区', '建立或加入工作區'], blocks: [
        { type: 'paragraph', text: ['Your workspace brings together your team’s customers, conversations, knowledge and settings. Check its name before making changes.', '工作区集中管理团队的客户、对话、知识和配置。进行更改前，请确认当前工作区名称。', '工作區集中管理團隊的客戶、對話、知識和配置。進行變更前，請確認目前工作區名稱。'] },
        { type: 'steps', items: [
          ['On the welcome screen, choose Add Workspace. Create My Own starts a workspace for your team; follow the name, connection and invitation steps shown.', '在欢迎页面选择添加工作区。选择创建我自己的工作区，然后按照页面提示填写名称、连接渠道并邀请成员。', '在歡迎頁面選擇新增工作區。選擇建立我自己的工作區，然後按照頁面提示填寫名稱、連接渠道並邀請成員。'],
          ['To join an existing team, choose Join a Workspace and paste the invitation link or token. You can also accept a pending invitation from the invitations inbox.', '要加入现有团队，请选择加入工作区并粘贴邀请链接或令牌。您也可以在邀请收件箱接受待处理的邀请。', '要加入現有團隊，請選擇加入工作區並貼上邀請連結或權杖。您亦可在邀請收件箱接受待處理的邀請。'],
          ['Complete any plan setup shown before using the CRM. An invitation alone does not add you to a workspace: accept it to join.', '使用 CRM 前，请完成页面要求的套餐设置。收到邀请并不代表已经加入工作区，您需要接受邀请。', '使用 CRM 前，請完成頁面要求的方案設定。收到邀請並不代表已加入工作區，您需要接受邀請。'],
        ] },
      ] },
      { id: 'switch-workspaces', title: ['Switch between workspaces', '切换工作区', '切換工作區'], blocks: [
        { type: 'paragraph', text: ['Open the workspace switcher at the bottom of the sidebar, or in Settings → Profile, and select a workspace you belong to. The app reloads with that workspace’s data and your permissions there. Finish any unsaved edits before switching.', '打开侧边栏底部或设置 → 个人资料中的工作区切换器，选择您已加入的工作区。应用会重新加载该工作区的数据及您的对应权限。切换前请完成尚未保存的编辑。', '開啟側邊欄底部或設定 → 個人資料中的工作區切換器，選擇您已加入的工作區。應用程式會重新載入該工作區的資料及您的對應權限。切換前請完成尚未儲存的編輯。'] },
        { type: 'note', title: ['Working with more than one team', '与多个团队协作', '與多個團隊協作'], text: ['Each workspace keeps its own records. Joining another team does not copy customers, conversations or knowledge into it. Some branded workspaces keep the switcher hidden.', '每个工作区独立保存记录。加入其他团队不会将客户、对话或知识复制到该工作区。部分品牌工作区会隐藏切换器。', '每個工作區獨立保存記錄。加入其他團隊不會將客戶、對話或知識複製到該工作區。部分品牌工作區會隱藏切換器。'] },
      ] },
      { id: 'find-your-way', title: ['Find your way around', '了解主要功能', '了解主要功能'], blocks: [
        { type: 'list', items: [
          ['Users holds customer records. Workspace → Members manages the people who sign in and work with you.', '用户页面保存客户记录；工作区 → 成员管理登录应用并与您协作的团队成员。', '用戶頁面儲存客戶記錄；工作區 → 成員管理登入應用程式並與您協作的團隊成員。'],
          ['Internal Chat holds customer conversations. External Chat holds website visitor conversations. Calendar shows appointments, scheduled messages and automation runs.', '内部聊天管理客户对话，外部聊天管理网站访客对话。日历显示预约、定时消息和自动化运行。', '內部聊天管理客戶對話，外部對話管理網站訪客對話。日曆顯示預約、排程訊息和自動化執行。'],
          ['Knowledge Base supplies information for AI replies. Automations runs recurring or triggered work. John Support helps you use and configure the app.', '知识库为 AI 回复提供资料，自动化执行定期或触发式任务，John 支持帮助您使用和配置应用。', '知識庫為 AI 回覆提供資料，自動化執行定期或觸發式工作，John 支援協助您使用和配置應用程式。'],
          ['Settings contains personal preferences. Configurations contains workspace behaviour and connections.', '设置管理个人偏好，配置管理工作区行为和连接。', '設定管理個人偏好，配置管理工作區行為和連線。'],
        ] },
      ] },
      { id: 'first-steps', title: ['Take your first steps', '开始您的第一项工作', '開始您的第一項工作'], blocks: [
        { type: 'steps', items: [
          ['Open Users and add your first customer, or open an existing record to check its contact details.', '打开用户页面，添加第一位客户，或打开现有记录检查联系方式。', '開啟用戶頁面，新增第一位客戶，或開啟現有記錄檢查聯絡資料。'],
          ['Ask an administrator to check your messaging connection in Configurations. Add a short, current FAQ to Knowledge Base if you manage your team’s content.', '请管理员在配置中检查消息渠道连接。如果您负责团队内容，请在知识库添加一份简短且最新的常见问题。', '請管理員在配置中檢查訊息渠道連線。如果您負責團隊內容，請在知識庫新增一份簡短且最新的常見問題。'],
          ['Open John Support and ask a specific question, such as “How do I take over a conversation from the AI?”', '打开 John 支持并提出具体问题，例如：“如何接手 AI 正在处理的对话？”', '開啟 John 支援並提出具體問題，例如：「如何接手 AI 正在處理的對話？」'],
        ] },
        { type: 'accordion', title: ['A workspace or feature is missing', '找不到工作区或功能', '找不到工作區或功能'], body: [
          ['Check the signed-in email and current workspace first. An expired invitation needs a fresh link from the inviter. Feature availability also depends on your workspace and permissions; ask an owner or administrator, or contact John Support.', '先检查登录邮箱和当前工作区。邀请过期时，请邀请人发送新链接。功能是否可用也取决于工作区和您的权限，请咨询所有者或管理员，或联系 John 支持。', '先檢查登入電郵和目前工作區。邀請過期時，請邀請人傳送新連結。功能是否可用亦取決於工作區和您的權限，請諮詢擁有者或管理員，或聯絡 John 支援。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/getting-started.ts', 'server/services/john/guide/sections/account.ts', 'src/app/components/workspace-switcher.tsx', 'src/app/components/create-organization-modal.tsx', 'src/locales/en/nav.json'],
  },
  {
    path: '/docs/john-support',
    title: ['John Support', 'John 支持', 'John 支援'],
    description: ['Ask product questions, work with files, and make informed changes with John by your side.', '向 John 询问产品功能、处理文件，并清楚了解每次更改。', '向 John 詢問產品功能、處理檔案，並清楚了解每次變更。'],
    group: 'start', figure: 'support',
    sections: [
      { id: 'ask-john', title: ['Start with a question', '从一个问题开始', '從一個問題開始'], blocks: [
        { type: 'steps', items: [
          ['Select John Support in the sidebar. Start a New chat or return to a conversation in the left rail.', '在侧边栏选择 John 支持。新建对话，或从左侧列表返回之前的对话。', '在側邊欄選擇 John 支援。新增對話，或從左側清單返回之前的對話。'],
          ['Explain what you want to do and where you are in the app. Include the customer or setting name when relevant.', '说明您想完成的操作，以及当前所在的页面。必要时提供客户或设置名称。', '說明您想完成的操作，以及目前所在的頁面。需要時提供客戶或設定名稱。'],
          ['Send your question. Open the Based on references in the answer to read the guide excerpts behind it.', '发送问题，打开回答中的参考来源，查看相关指南摘录。', '傳送問題，開啟回答中的參考來源，查看相關指南摘錄。'],
        ] },
        { type: 'paragraph', text: ['Conversations belong to the current workspace. Use the conversation menu to rename or archive a session so you can find it later. You can write to John in your preferred language.', '对话属于当前工作区。通过对话菜单重命名或归档会话，方便日后查找。您可以使用自己习惯的语言向 John 提问。', '對話屬於目前工作區。透過對話選單重新命名或封存會話，方便日後查找。您可使用自己習慣的語言向 John 提問。'] },
      ] },
      { id: 'request-changes', title: ['Ask John to make a change', '让 John 执行更改', '讓 John 執行變更'], blocks: [
        { type: 'paragraph', text: ['John can inspect settings and make supported changes on your instruction. Be specific: “Set my auto-reply delay to quick” is a change request. “Explain the reply delay options” asks for information.', 'John 可以查看设置，并根据您的指示执行受支持的更改。请明确表达：“把自动回复延迟设为快速”是更改请求；“解释回复延迟选项”是咨询问题。', 'John 可查看設定，並根據您的指示執行支援的變更。請明確表達：「把自動回覆延遲設為快速」是變更要求；「解釋回覆延遲選項」是諮詢問題。'] },
        { type: 'note', title: ['Your instructions can take effect immediately', '您的指示可能立即生效', '您的指示可能立即生效'], text: ['A clear change request can be applied straight away. John asks for clarification when needed and may direct you to an app screen for a required step. Your own permissions still apply.', '明确的更改请求可能会立即执行。需要时 John 会询问细节，或引导您到应用页面完成必要步骤。操作仍受您本人的权限限制。', '明確的變更要求可能會立即執行。需要時 John 會詢問細節，或引導您到應用程式頁面完成必要步驟。操作仍受您本人的權限限制。'] },
      ] },
      { id: 'receipts-and-undo', title: ['Check receipts and Undo', '检查变更回执与撤销操作', '檢查變更記錄與還原操作'], blocks: [
        { type: 'steps', items: [
          ['Read each change receipt to see what changed, which records were affected, and whether the action completed or failed.', '阅读每张变更回执，确认更改内容、受影响的记录，以及操作是否完成或失败。', '閱讀每張變更記錄，確認變更內容、受影響的記錄，以及操作是否完成或失敗。'],
          ['Use Undo when the receipt offers it, then check the resulting status. Some actions are permanent and have no Undo.', '回执提供撤销按钮时，可点击撤销并检查结果。部分操作是永久性的，无法撤销。', '記錄提供還原按鈕時，可點擊還原並檢查結果。部分操作是永久性的，無法還原。'],
          ['If an automation has already started, open it to inspect its run and pause future runs if needed. Pausing does not recall messages already sent.', '如果自动化已经开始，请打开它查看运行记录，并按需暂停后续运行。暂停不会收回已经发送的消息。', '如果自動化已經開始，請開啟它查看執行記錄，並按需要暫停後續執行。暫停不會收回已傳送的訊息。'],
        ] },
      ] },
      { id: 'files-and-sources', title: ['Add files and source material', '添加文件与参考资料', '加入檔案與參考資料'], blocks: [
        { type: 'paragraph', text: ['Use the paperclip or drag a file into the chat, then explain what John should read or do with it. Supported documents include text-based PDFs, Word (.docx), plain text, Markdown, CSV and JSON. John reports when content could not be read or was only partly read.', '使用回形针按钮或将文件拖入对话，再说明希望 John 阅读或处理哪些内容。支持的文档包括含文字的 PDF、Word（.docx）、纯文本、Markdown、CSV 和 JSON。无法读取或仅部分读取的内容会明确说明。', '使用萬字夾按鈕或將檔案拖入對話，再說明希望 John 閱讀或處理哪些內容。支援的文件包括含文字的 PDF、Word（.docx）、純文字、Markdown、CSV 和 JSON。無法讀取或僅部分讀取的內容會明確說明。'] },
        { type: 'paragraph', text: ['An attachment stays with the conversation; it does not automatically become shared knowledge. Ask John to add it to Knowledge Base when you want customer-facing AI replies to use it. You can also provide a public HTTPS page for John to read.', '附件会保留在对话中，但不会自动成为共享知识。如果希望面向客户的 AI 回复使用这些资料，请要求 John 将其加入知识库。您也可以提供公开的 HTTPS 网页供 John 阅读。', '附件會保留在對話中，但不會自動成為共用知識。如果希望面向客戶的 AI 回覆使用這些資料，請要求 John 將其加入知識庫。您亦可提供公開的 HTTPS 網頁供 John 閱讀。'] },
      ] },
      { id: 'human-support', title: ['Get help from the team', '联系支持团队', '聯絡支援團隊'], blocks: [
        { type: 'paragraph', text: ['Choose Contact support in John Support, or use the support card John offers. Describe what happened, what you expected, and the affected workspace. Review and send the request; the team receives the conversation transcript and replies to your account email.', '在 John 支持中选择联系支持，或使用 John 提供的支持卡片。说明实际情况、预期结果和相关工作区。检查后发送请求；团队会收到对话记录，并回复到您的账号邮箱。', '在 John 支援中選擇聯絡支援，或使用 John 提供的支援卡片。說明實際情況、預期結果和相關工作區。檢查後傳送要求；團隊會收到對話記錄，並回覆到您的帳戶電郵。'] },
        { type: 'accordion', title: ['John cannot complete my request', 'John 无法完成我的请求', 'John 無法完成我的要求'], body: [
          ['Check the current workspace, your access and any receipt or on-screen error. Some connections require a setup wizard or scanning a QR code yourself. For unreadable documents, supply readable text or a text-based PDF. If the outcome of a change is unclear, inspect the affected record before asking John to repeat it.', '检查当前工作区、您的权限、变更回执及页面错误提示。部分连接需要使用设置向导或由您亲自扫描二维码。文件无法读取时，请提供可读文字或含文字的 PDF。如果不确定更改结果，请先检查相关记录，再决定是否要求 John 重试。', '檢查目前工作區、您的權限、變更記錄及頁面錯誤提示。部分連線需要使用設定精靈或由您親自掃描二維碼。檔案無法讀取時，請提供可讀文字或含文字的 PDF。如果不確定變更結果，請先檢查相關記錄，再決定是否要求 John 重試。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/getting-started.ts', 'server/services/john/attachments.ts', 'src/locales/en/john.json', 'src/locales/zh-CN/john.json', 'src/locales/zh-HK/john.json'],
  },
  {
    path: '/docs/conversations',
    title: ['Conversations & webchat', '对话与网站聊天', '對話與網站聊天'],
    description: ['Reply to customers, take over from AI, and connect your website to the same workspace.', '回复客户、接手 AI 对话，并将网站连接到同一个工作区。', '回覆客戶、接手 AI 對話，並將網站連接到同一個工作區。'],
    group: 'work', figure: 'conversations',
    sections: [
      { id: 'choose-an-inbox', title: ['Choose the right inbox', '选择对应的收件箱', '選擇對應的收件箱'], blocks: [
        { type: 'list', items: [
          ['Internal Chat brings together conversations with known customers. WhatsApp (QR Code) and WhatsApp Business API are the available WhatsApp connections; channels marked Coming Soon are not ready to connect.', '内部聊天集中显示已知客户的对话。您可以连接 WhatsApp（二维码）和 WhatsApp Business API；标记为即将推出的渠道尚不能连接。', '內部聊天集中顯示已知客戶的對話。您可連接 WhatsApp（二維碼）和 WhatsApp Business API；標示為即將推出的渠道尚不能連接。'],
          ['External Chat receives messages from website visitors. Visitors can start without signing in or providing a name or email.', '外部聊天接收网站访客的消息。访客无需登录或提供姓名、邮箱即可开始对话。', '外部對話接收網站訪客的訊息。訪客毋須登入或提供姓名、電郵即可開始對話。'],
          ['Create client in a visitor conversation turns that visitor into a customer record and moves the thread into Internal Chat. The visitor’s website session continues.', '在访客对话中选择创建客户，会将该访客转为客户记录，并将对话移至内部聊天。访客的网站会话会继续保留。', '在訪客對話中選擇建立客戶，會將該訪客轉為客戶記錄，並將對話移至內部聊天。訪客的網站會話會繼續保留。'],
        ] },
      ] },
      { id: 'reply-to-a-customer', title: ['Reply to a customer', '回复客户', '回覆客戶'], blocks: [
        { type: 'steps', items: [
          ['Select a conversation and read the recent messages. Check the customer and channel before sending.', '选择对话并阅读最近的消息，发送前确认客户和渠道。', '選擇對話並閱讀最近的訊息，傳送前確認客戶和渠道。'],
          ['Write your reply. On desktop, Enter sends and Shift+Enter adds a line. On touch devices, use the Send button.', '输入回复。在桌面设备上，Enter 发送，Shift+Enter 换行。在触屏设备上，请使用发送按钮。', '輸入回覆。在桌面裝置上，Enter 傳送，Shift+Enter 換行。在觸控裝置上，請使用傳送按鈕。'],
          ['In Internal Chat, use the paperclip to add supported files and wait for uploads to finish. Check delivery status after sending; use Retry when a message fails.', '在内部聊天中，可使用回形针添加受支持的文件，并等待上传完成。发送后检查投递状态，消息失败时可选择重试。', '在內部聊天中，可使用萬字夾加入支援的檔案，並等待上傳完成。傳送後檢查送達狀態，訊息失敗時可選擇重試。'],
        ] },
        { type: 'note', title: ['Website chat attachments', '网站聊天附件', '網站聊天附件'], text: ['Visitors can send images and PDFs. Agents currently send text replies through External Chat; sending attachments back to visitors is not supported.', '访客可以发送图片和 PDF。目前客服通过外部聊天发送文字回复，暂不支持向访客发送附件。', '訪客可傳送圖片和 PDF。目前客服透過外部對話傳送文字回覆，暫不支援向訪客傳送附件。'] },
      ] },
      { id: 'ai-and-human-handoff', title: ['Work alongside AI', '与 AI 协同处理对话', '與 AI 協同處理對話'], blocks: [
        { type: 'paragraph', text: ['A pending AI reply shows a countdown and controls to Edit, Send now or Hold. Hold pauses the reply so you can take over. By default, replying yourself pauses AI on that conversation; a manual reply always pauses AI in website chat.', '待发送的 AI 回复会显示倒计时，以及编辑、立即发送和暂停按钮。选择暂停即可接手。默认情况下，您亲自回复会暂停该对话的 AI；在网站聊天中，人工回复始终会暂停 AI。', '待傳送的 AI 回覆會顯示倒數，以及編輯、立即傳送和暫停按鈕。選擇暫停即可接手。預設情況下，您親自回覆會暫停該對話的 AI；在網站聊天中，人工回覆一律會暫停 AI。'] },
        { type: 'list', items: [
          ['Limited replies when confident, asks for clarification when unsure, and hands sensitive conversations to a person. Full allows a broader range of AI replies. Off leaves the conversation with a person.', '有限模式在有把握时回复，不确定时先询问澄清，并将敏感对话转交人工。完整模式允许更广泛的 AI 回复。关闭模式由人工处理对话。', '有限模式在有把握時回覆，不確定時先詢問澄清，並將敏感對話轉交人工。完整模式允許更廣泛的 AI 回覆。關閉模式由人工處理對話。'],
          ['Use Resume AI in the paused conversation banner when you are ready. If the mode is Off, first choose Limited or Full.', '准备交回 AI 时，点击暂停提示中的恢复 AI。如果当前模式为关闭，请先选择有限或完整模式。', '準備交回 AI 時，點擊暫停提示中的恢復 AI。如果目前模式為關閉，請先選擇有限或完整模式。'],
          ['Open Notifications to find conversations that need attention. Follow the linked message and review the customer’s request before responding.', '打开通知，查看需要处理的对话。进入关联消息，了解客户请求后再回复。', '開啟通知，查看需要處理的對話。進入相關訊息，了解客戶要求後再回覆。'],
        ] },
      ] },
      { id: 'embed-webchat', title: ['Add chat to your website', '在网站上添加聊天', '在網站上加入聊天'], blocks: [
        { type: 'steps', items: [
          ['Open Configurations → External Chat and enable website chat with an account that can manage workspace settings.', '使用有权管理工作区设置的账号，打开配置 → 外部聊天并启用网站聊天。', '使用有權管理工作區設定的帳戶，開啟配置 → 外部對話並啟用網站聊天。'],
          ['Set the chatbot name, greeting, colour and theme. Add a launcher icon or chatbot profile image if needed.', '设置聊天机器人名称、问候语、颜色和主题，并按需添加启动图标或机器人头像。', '設定聊天機械人名稱、問候語、顏色和主題，並按需要加入啟動圖示或機械人頭像。'],
          ['Copy the embed snippet provided by your workspace and add it to your website’s HTML or custom-code area. Publish the website change.', '复制工作区提供的嵌入代码，添加到网站的 HTML 或自定义代码区域，然后发布网站更改。', '複製工作區提供的嵌入程式碼，加入網站的 HTML 或自訂程式碼區域，然後發佈網站變更。'],
        ] },
        { type: 'code', label: 'HTML', code: '<script\n  src="https://YOUR_APP_DOMAIN/widget/chat.js"\n  data-site-key="YOUR_SITE_KEY"\n  async\n></script>' },
        { type: 'paragraph', text: ['This example shows the shape of the snippet. Use the app domain and site key from your own copied snippet. Rotating the site key invalidates the old snippet, so update every website using it.', '此示例展示嵌入代码的格式。请使用您复制的代码中的应用域名和网站密钥。轮换网站密钥会使旧代码失效，因此需要更新所有使用它的网站。', '此範例展示嵌入程式碼的格式。請使用您複製的程式碼中的應用程式網域和網站金鑰。輪換網站金鑰會令舊程式碼失效，因此需要更新所有使用它的網站。'] },
      ] },
      { id: 'test-your-chat', title: ['Test the conversation', '测试对话', '測試對話'], blocks: [
        { type: 'steps', items: [
          ['Open the published website in a private browser window, open chat, and send a simple question about your business.', '在隐私浏览窗口打开已发布的网站，打开聊天窗口，发送一个有关业务的简单问题。', '在私密瀏覽視窗開啟已發佈的網站，開啟聊天視窗，傳送一個有關業務的簡單問題。'],
          ['Find the visitor in External Chat. Check the AI answer against your knowledge, then send a manual reply and confirm it arrives on the website.', '在外部聊天中找到该访客。根据您的资料检查 AI 答案，再发送人工回复，确认网站端能收到。', '在外部對話中找到該訪客。根據您的資料檢查 AI 答案，再傳送人工回覆，確認網站端能收到。'],
        ] },
        { type: 'accordion', title: ['The widget is missing or a reply cannot send', '聊天组件未显示或无法发送回复', '聊天元件未顯示或無法傳送回覆'], body: [
          ['Confirm the widget is enabled, the published snippet uses the current site key, and your website allows the script to load. If allowed origins were configured, the website origin must match; John can help check that setting.', '确认聊天组件已启用、发布的代码使用当前网站密钥，并且网站允许加载脚本。如果已配置允许的来源，网站来源必须匹配；John 可以帮助检查该设置。', '確認聊天元件已啟用、發佈的程式碼使用目前網站金鑰，並且網站允許載入指令碼。如果已配置允許的來源，網站來源必須相符；John 可協助檢查該設定。'],
          ['A closed visitor chat disables sending to that session. For WhatsApp Business API, free-form replies require the customer to have messaged within the last 24 hours. Read the error before retrying.', '访客关闭聊天后，您无法继续向该会话发送消息。WhatsApp Business API 的自由格式回复要求客户在过去 24 小时内发送过消息。重试前请阅读错误提示。', '訪客關閉聊天後，您無法繼續向該會話傳送訊息。WhatsApp Business API 的自由格式回覆要求客戶在過去 24 小時內傳送過訊息。重試前請閱讀錯誤提示。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/chat.ts', 'server/services/john/guide/sections/channels.ts', 'src/app/components/webchat-integration-card.tsx', 'src/locales/en/chat.json', 'src/locales/en/settings.json'],
  },
  {
    path: '/docs/knowledge-base',
    title: ['Knowledge Base', '知识库', '知識庫'],
    description: ['Give AI useful source material, choose who can receive it, and test answers with evidence.', '为 AI 提供实用资料、设置适用对象，并根据来源验证回答。', '為 AI 提供實用資料、設定適用對象，並根據來源驗證回答。'],
    group: 'work', figure: 'knowledge',
    sections: [
      { id: 'spaces-and-folders', title: ['Organise spaces and folders', '整理空间和文件夹', '整理空間和資料夾'], blocks: [
        { type: 'paragraph', text: ['Open Knowledge Base in the sidebar. Spaces group folders by who can receive their content; folders organise related documents, websites and API endpoints. The page opens an existing folder, or invites you to create the first one.', '在侧边栏打开知识库。空间按内容适用对象划分文件夹；文件夹整理相关文档、网站和 API 端点。页面会打开现有文件夹，或提示您创建第一个文件夹。', '在側邊欄開啟知識庫。空間按內容適用對象劃分資料夾；資料夾整理相關文件、網站和 API 端點。頁面會開啟現有資料夾，或提示您建立第一個資料夾。'] },
        { type: 'steps', items: [
          ['Use Spaces in the toolbar to review your audience groups. Everyone is the default space for information available to all contacts.', '使用工具栏的空间查看对象分组。所有人是默认空间，内容可用于回答所有联系人。', '使用工具列的空間查看對象分組。所有人是預設空間，內容可用於回答所有聯絡人。'],
          ['Use the plus button beside a space to add a folder. Name it for one subject, such as opening hours or booking policies.', '点击空间旁的加号添加文件夹，以单一主题命名，例如营业时间或预约政策。', '點擊空間旁的加號新增資料夾，以單一主題命名，例如營業時間或預約政策。'],
          ['Open a folder’s menu to rename it or move it to another space. On a phone, open the tree from the toolbar to choose a folder.', '打开文件夹菜单可重命名或移至其他空间。在手机上，从工具栏打开目录树来选择文件夹。', '開啟資料夾選單可重新命名或移至其他空間。在手機上，從工具列開啟目錄樹來選擇資料夾。'],
        ] },
      ] },
      { id: 'add-sources', title: ['Add a note, file or website', '添加笔记、文件或网站', '加入筆記、檔案或網站'], blocks: [
        { type: 'steps', items: [
          ['Select a folder and use its add area. Choose Write a note, Upload files or Add a website; you can also drop files there.', '选择文件夹并使用其添加区域。选择撰写笔记、上传文件或添加网站，也可以将文件拖到该区域。', '選擇資料夾並使用其新增區域。選擇撰寫筆記、上傳檔案或加入網站，亦可將檔案拖到該區域。'],
          ['Write notes with clear headings and short question-and-answer pairs. Notes autosave; wait for the saved state before relying on the update.', '笔记应使用清晰的标题和简短的问答。笔记会自动保存，请确认保存完成后再使用更新内容。', '筆記應使用清晰的標題和簡短的問答。筆記會自動儲存，請確認儲存完成後再使用更新內容。'],
          ['Upload supported documents such as PDF, Word or text files, or provide one public HTTPS page. Check the resulting status and extracted content.', '上传 PDF、Word 或文本等受支持的文档，或提供一个公开的 HTTPS 网页。完成后检查状态和提取内容。', '上傳 PDF、Word 或文字等支援的文件，或提供一個公開的 HTTPS 網頁。完成後檢查狀態和擷取內容。'],
        ] },
        { type: 'paragraph', text: ['Ready content can be used by AI replies without a separate publishing step. Keep policies current and use the wording your customers use. The tree filter finds source names; KB test searches the content used for answers.', '内容就绪后，AI 回复即可使用，无需另行发布。请保持政策最新，并采用客户常用的表达。目录树筛选器查找来源名称；知识库测试检索用于回答的内容。', '內容就緒後，AI 回覆即可使用，毋須另行發佈。請保持政策最新，並採用客戶常用的表達。目錄樹篩選器查找來源名稱；知識庫測試檢索用於回答的內容。'] },
      ] },
      { id: 'check-processing', title: ['Check source readiness', '检查来源状态', '檢查來源狀態'], blocks: [
        { type: 'list', items: [
          ['Processing means the source is being prepared. Ready means the AI can use it. Ready, with notes means some material was left out; open the explanation to review it.', '处理中表示正在准备来源；就绪表示 AI 可以使用。就绪但有备注表示部分资料未包含在内，请打开说明查看。', '處理中表示正在準備來源；就緒表示 AI 可以使用。就緒但有備註表示部分資料未包含在內，請開啟說明查看。'],
          ['Couldn’t read means the source is unavailable to AI. Follow the error guidance; for scanned PDFs, supply readable text if text extraction is unavailable.', '无法读取表示 AI 无法使用该来源。请按照错误提示处理；扫描 PDF 无法提取文字时，可提供可读文本。', '無法讀取表示 AI 無法使用該來源。請按照錯誤提示處理；掃描 PDF 無法擷取文字時，可提供可讀文字。'],
          ['Out of date means a website changed and the saved version is still in use. Refresh now replaces it. Auto check can detect future changes; editing saved website text pauses automatic checks.', '已过期表示网站已更改，但仍在使用保存的版本。立即刷新可替换内容。自动检查可发现后续变化；编辑已保存的网页文字会暂停自动检查。', '已過期表示網站已變更，但仍在使用已儲存的版本。立即重新整理可替換內容。自動檢查可發現後續變化；編輯已儲存的網頁文字會暫停自動檢查。'],
        ] },
      ] },
      { id: 'audience-access', title: ['Choose who can receive an answer', '选择可以获得答案的对象', '選擇可以獲得答案的對象'], blocks: [
        { type: 'paragraph', text: ['In Spaces, leave general information open to everyone or restrict a space to selected User Types. A contact with any selected type can receive answers from it. Untyped contacts and unknown visitors receive only open-space content. A restricted space with no selected types answers no contacts.', '在空间中，将通用资料设为对所有人开放，或限制为指定用户类型。联系人拥有任一指定类型，即可获得该空间内容的回答。没有类型的联系人和未知访客只能获得开放空间的内容。受限空间未选择任何类型时，不会向任何联系人提供内容。', '在空間中，將通用資料設為對所有人開放，或限制為指定用戶類型。聯絡人擁有任一指定類型，即可獲得該空間內容的回答。沒有類型的聯絡人和未知訪客只能獲得開放空間的內容。受限空間未選擇任何類型時，不會向任何聯絡人提供內容。'] },
        { type: 'note', title: ['Review changes to access', '检查访问范围的变化', '檢查存取範圍的變化'], text: ['Moving content to a more widely accessible space can expose it to more contacts. Review the audience confirmation before continuing. Managing sources, spaces and retrieval tests requires the appropriate knowledge-base management permission.', '将内容移至访问范围更广的空间，可能使更多联系人获得这些内容。继续前请检查对象确认提示。管理来源、空间和检索测试需要相应的知识库管理权限。', '將內容移至存取範圍更廣的空間，可能令更多聯絡人獲得這些內容。繼續前請檢查對象確認提示。管理來源、空間和檢索測試需要相應的知識庫管理權限。'] },
      ] },
      { id: 'test-retrieval', title: ['Test an answer with evidence', '根据来源测试答案', '根據來源測試答案'], blocks: [
        { type: 'steps', items: [
          ['Open KB test in the toolbar and ask a question exactly as a customer would.', '打开工具栏中的知识库测试，以客户的实际表达方式提问。', '開啟工具列中的知識庫測試，以客戶的實際表達方式提問。'],
          ['Choose the asking audience: Everyone, a User Type or a specific user. Check the answer, any handoff, and the source sections included or left out.', '选择提问对象：所有人、某个用户类型或具体用户。检查答案、是否转交人工，以及纳入或遗漏的来源章节。', '選擇提問對象：所有人、某個用戶類型或具體用戶。檢查答案、是否轉交人工，以及納入或略過的來源章節。'],
          ['Open a source result to inspect the exact section. Improve the source or its audience settings, then test again. Pin useful questions to repeat after content changes.', '打开来源结果查看具体章节。改进来源或对象设置后再次测试。固定常用问题，方便内容变更后重复验证。', '開啟來源結果查看具體章節。改善來源或對象設定後再次測試。釘選常用問題，方便內容變更後重複驗證。'],
        ] },
        { type: 'note', title: ['What a test uses', '测试使用的资源', '測試使用的資源'], text: ['No customer is messaged and the rehearsal does not apply data changes. It does call read-only API endpoints when needed and uses your workspace’s AI credits. The test explains differences from a live conversation.', '测试不会向客户发送消息，也不会执行数据更改。但需要时会调用只读 API 端点，并消耗工作区的 AI 点数。测试中会说明与真实对话的区别。', '測試不會向客戶傳送訊息，亦不會執行資料變更。但需要時會呼叫唯讀 API 端點，並消耗工作區的 AI 點數。測試中會說明與真實對話的分別。'] },
        { type: 'accordion', title: ['The right answer is missing', '找不到正确答案', '找不到正確答案'], body: [
          ['Check that the source is Ready, the selected asker can access its space, and the relevant section appears in the evidence. Update unclear or outdated text and test with the customer’s wording. If a result matched but was left out, inspect the reason shown before changing the AI’s instructions.', '检查来源是否就绪、所选提问对象能否访问其空间，以及相关章节是否出现在依据中。更新不清晰或过时的文字，并使用客户的表达再次测试。若结果匹配但未纳入，请先查看原因，再考虑更改 AI 指示。', '檢查來源是否就緒、所選提問對象能否存取其空間，以及相關章節是否出現在依據中。更新不清晰或過時的文字，並使用客戶的表達再次測試。若結果相符但未納入，請先查看原因，再考慮變更 AI 指示。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/knowledge.ts', 'src/app/pages/knowledge-base.tsx', 'src/app/components/knowledge-base/retrieval/retrieval-panel.tsx', 'src/app/components/knowledge-base/retrieval/ask-as.tsx', 'src/locales/en/knowledgeBase.json'],
  },
  {
    path: '/docs/automations',
    title: ['Automations', '自动化', '自動化'],
    description: ['Describe a repeatable job, understand when it will run, and review what it actually does.', '描述可重复执行的任务，了解运行条件，并检查实际执行结果。', '描述可重複執行的工作，了解執行條件，並檢查實際執行結果。'],
    group: 'work', figure: 'automation',
    sections: [
      { id: 'describe-the-job', title: ['Describe the job clearly', '明确描述任务', '清楚描述工作'], blocks: [
        { type: 'paragraph', text: ['Open Automations and choose New Automation or Start from a template. Give the job a name and write instructions that specify the audience, timing and desired result. Creating and managing automations requires automation management permission; workspace members can read run history.', '打开自动化，选择新建自动化或从模板开始。为任务命名，并在指令中明确对象、时间和预期结果。创建和管理自动化需要自动化管理权限；工作区成员可以查看运行记录。', '開啟自動化，選擇新增自動化或從範本開始。為工作命名，並在指示中清楚說明對象、時間和預期結果。建立和管理自動化需要自動化管理權限；工作區成員可查看執行記錄。'] },
        { type: 'note', title: ['Be explicit about sending', '明确是否发送消息', '明確說明是否傳送訊息'], text: ['“Every Friday, report which customers need a follow-up; do not message anyone” requests a report. Instructions to send messages let the automation contact customers on its own. There is no approval queue for outgoing automation messages.', '“每周五报告哪些客户需要跟进，不要向任何人发送消息”请求的是报告。如果指令要求发送消息，自动化可以自行联系客户。自动化发出的消息没有待审批队列。', '「每逢星期五報告哪些客戶需要跟進，不要向任何人傳送訊息」要求的是報告。如果指示要求傳送訊息，自動化可自行聯絡客戶。自動化發出的訊息沒有待審批佇列。'] },
      ] },
      { id: 'triggers-and-settings', title: ['Check when it runs', '检查运行时间与条件', '檢查執行時間與條件'], blocks: [
        { type: 'paragraph', text: ['Include the intended schedule or event in your instructions. Available triggers include schedules, a one-time date, received messages, customer changes and customer dates. In the detailed editor, review When it runs and the timezone shown; do not assume it uses your device’s clock.', '在指令中说明计划时间或触发事件。可用触发方式包括定期计划、一次性日期、收到消息、客户信息变更和客户相关日期。在详细编辑器中检查运行时间与条件及显示的时区，不要默认使用设备时区。', '在指示中說明排程時間或觸發事件。可用觸發方式包括定期排程、一次性日期、收到訊息、客戶資料變更和客戶相關日期。在詳細編輯器中檢查執行時間與條件及顯示的時區，不要假設使用裝置時區。'] },
        { type: 'list', items: [
          ['Review the audience and whether the job reports information or sends messages. Name a channel in the instructions when the channel matters.', '检查对象，以及任务是生成报告还是发送消息。如果渠道有要求，请在指令中明确指定。', '檢查對象，以及工作是產生報告還是傳送訊息。如果渠道有要求，請在指示中明確指定。'],
          ['Choose the available knowledge sources and read-only API endpoints when the task needs them. Check the notification recipient and completion or failure options.', '任务需要时，选择可用的知识来源和只读 API 端点。检查通知接收人，以及完成或失败时的通知选项。', '工作需要時，選擇可用的知識來源和唯讀 API 端點。檢查通知接收人，以及完成或失敗時的通知選項。'],
        ] },
      ] },
      { id: 'preview-and-save', title: ['Understand preview and Save', '了解预览与保存', '了解預覽與儲存'], blocks: [
        { type: 'paragraph', text: ['In the detailed editor, open Sample output and choose Preview to rehearse against real workspace data. Inspect proposed messages, recipients and evidence. The preview sends no customer messages. Changes to the job can require a fresh preview before a sending automation can be saved.', '在详细编辑器中，打开输出示例并选择预览，使用工作区真实数据进行演练。检查建议消息、接收人和依据。预览不会向客户发送消息。更改任务后，发送消息的自动化可能需要重新预览才能保存。', '在詳細編輯器中，開啟輸出範例並選擇預覽，使用工作區真實資料進行演練。檢查建議訊息、接收人和依據。預覽不會向客戶傳送訊息。變更工作後，傳送訊息的自動化可能需要重新預覽才能儲存。'] },
        { type: 'note', title: ['Save can activate the automation', '保存可能启用自动化', '儲存可能啟用自動化'], text: ['In the compact New Automation form, Save interprets your instructions, automatically runs any required sending preview, and can create an active automation immediately. Missing information opens the detailed editor. Saving is not a promise of a separate review step: finish your instructions before selecting it, then check the automation’s status.', '在简洁的新建自动化表单中，保存会解析指令、自动执行发送所需的预览，并可能立即创建已启用的自动化。如果缺少信息，则会打开详细编辑器。保存并不保证出现独立的审核步骤：请先完成指令，再点击保存，并检查自动化状态。', '在簡潔的新增自動化表單中，儲存會解析指示、自動執行傳送所需的預覽，並可能立即建立已啟用的自動化。如果缺少資料，則會開啟詳細編輯器。儲存並不保證出現獨立的審核步驟：請先完成指示，再點擊儲存，並檢查自動化狀態。'] },
        { type: 'paragraph', text: ['Review Unreachable and Opted out recipients. Add missing contact information where appropriate, or remove a recipient from this automation. A preview is a sample: future runs determine their audience from the current data and instructions, while respecting saved exclusions.', '检查无法联系和已退出的接收人。按需补充联系方式，或将接收人从此自动化中移除。预览仅为示例：后续运行会根据当时的数据和指令确定对象，并遵守已保存的排除设置。', '檢查無法聯絡和已退出的接收人。按需要補充聯絡資料，或將接收人從此自動化中移除。預覽僅為範例：後續執行會根據當時的資料和指示確定對象，並遵守已儲存的排除設定。'] },
      ] },
      { id: 'pause-and-resume', title: ['Pause and resume work', '暂停与恢复任务', '暫停與恢復工作'], blocks: [
        { type: 'steps', items: [
          ['Open the automation’s row menu and choose Pause to stop future runs. Check its status in the list.', '打开自动化行菜单，选择暂停以停止后续运行，并在列表中确认状态。', '開啟自動化列選單，選擇暫停以停止後續執行，並在清單中確認狀態。'],
          ['Review or edit the job while paused. Saving an automation you paused manually keeps it paused; choose Resume when it is ready to run again.', '暂停期间可检查或编辑任务。手动暂停的自动化在保存后仍保持暂停；准备再次运行时，选择恢复。', '暫停期間可檢查或編輯工作。手動暫停的自動化在儲存後仍保持暫停；準備再次執行時，選擇恢復。'],
        ] },
        { type: 'paragraph', text: ['Pausing future work does not undo completed runs or recall sent messages. If the workspace Automations module was disabled, use the Restore action shown after it is re-enabled. Special workflows such as Item reservation have their own controls.', '暂停后续任务不会撤销已完成的运行，也不会收回已发送的消息。如果工作区的自动化模块曾被禁用，请在重新启用后使用页面显示的恢复操作。商品预留等特殊流程有各自的控制项。', '暫停後續工作不會還原已完成的執行，亦不會收回已傳送的訊息。如果工作區的自動化模組曾被停用，請在重新啟用後使用頁面顯示的還原操作。商品預留等特殊流程有各自的控制項。'] },
      ] },
      { id: 'run-history', title: ['Review run history', '查看运行记录', '查看執行記錄'], blocks: [
        { type: 'paragraph', text: ['Open Run History and select a run. Read the instructions that ran, its report, evidence and individual message outcomes. Succeeded means the run completed; Partial means some useful work completed before a problem. Quiet means it found nothing to report, while Skipped means it did not execute.', '打开运行记录并选择一次运行。查看实际执行的指令、报告、依据和每条消息的结果。成功表示运行完成；部分完成表示发生问题前完成了部分有效工作。静默表示没有需要报告的内容，已跳过表示没有执行。', '開啟執行記錄並選擇一次執行。查看實際執行的指示、報告、依據和每則訊息的結果。成功表示執行完成；部分完成表示發生問題前完成了部分有效工作。靜默表示沒有需要報告的內容，已略過表示沒有執行。'] },
        { type: 'accordion', title: ['The automation did not do what I expected', '自动化未按预期执行', '自動化未按預期執行'], body: [
          ['Check its active or paused status, trigger time and timezone, the run’s explanation, available AI credits and connected channels. Inspect per-customer outcomes before retrying a partial run. Tighten ambiguous instructions, then review the current preview and status before resuming.', '检查启用或暂停状态、触发时间和时区、运行说明、可用 AI 点数和渠道连接。部分完成的运行在重试前，应先查看每位客户的结果。明确含糊的指令，并在恢复前检查最新预览和状态。', '檢查啟用或暫停狀態、觸發時間和時區、執行說明、可用 AI 點數和渠道連線。部分完成的執行在重試前，應先查看每位客戶的結果。釐清含糊的指示，並在恢復前檢查最新預覽和狀態。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/bulk-automation.ts', 'src/app/components/automations/automation-compose-dialog.tsx', 'src/app/components/automations/use-automation-compose.ts', 'src/app/components/automations/automation-editor.tsx', 'src/locales/en/automation.json'],
  },
  {
    path: '/docs/users-and-access',
    title: ['Users & access', '用户与权限', '用戶與權限'],
    description: ['Keep customer records useful and give your teammates the right access to your workspace.', '维护实用的客户记录，并为团队成员分配合适的工作区权限。', '維護實用的客戶記錄，並為團隊成員分配合適的工作區權限。'],
    group: 'manage', figure: 'users',
    sections: [
      { id: 'customers-and-members', title: ['Understand customers and members', '区分客户与成员', '區分客戶與成員'], blocks: [
        { type: 'paragraph', text: ['Users is your customer list. A user on that page is a customer record, not a teammate with a JOHN CRM login. The people who work in your CRM are members, managed in Workspace → Members.', '用户页面是客户列表。该页面的用户是客户记录，并非可以登录 JOHN CRM 的同事。使用 CRM 工作的团队成员在工作区 → 成员中管理。', '用戶頁面是客戶清單。該頁面的用戶是客戶記錄，並非可以登入 JOHN CRM 的同事。使用 CRM 工作的團隊成員在工作區 → 成員中管理。'] },
        { type: 'note', title: ['Website visitors', '网站访客', '網站訪客'], text: ['Website visitors stay in External Chat until you choose Create client. Promoting a visitor makes the record visible in Users and moves the conversation to Internal Chat.', '网站访客保留在外部聊天中，直到您选择创建客户。转为客户后，该记录会显示在用户页面，对话会移至内部聊天。', '網站訪客保留在外部對話中，直到您選擇建立客戶。轉為客戶後，該記錄會顯示在用戶頁面，對話會移至內部聊天。'] },
      ] },
      { id: 'customer-records', title: ['Create and maintain a customer record', '创建与维护客户记录', '建立與維護客戶記錄'], blocks: [
        { type: 'steps', items: [
          ['Open Users and choose Add New User. Enter the full name, then add useful contact details. Include the country code for WhatsApp numbers.', '打开用户页面并选择新增用户。输入全名，再添加实用的联系方式。WhatsApp 号码应包含国家或地区代码。', '開啟用戶頁面並選擇新增用戶。輸入全名，再加入實用的聯絡資料。WhatsApp 號碼應包含國家或地區代碼。'],
          ['Choose applicable User Types and complete their fields. Add relevant, current notes to User Memory, then save the record.', '选择适用的用户类型并填写相关字段。在用户记忆中添加相关且最新的备注，然后保存记录。', '選擇適用的用戶類型並填寫相關欄位。在用戶記憶中加入相關且最新的備註，然後儲存記錄。'],
          ['Use search or User Type filters to find the customer again. Open the record to review details and use Edit when information changes.', '使用搜索或用户类型筛选再次找到客户。打开记录查看详情，信息变化时使用编辑更新。', '使用搜尋或用戶類型篩選再次找到客戶。開啟記錄查看詳情，資料變化時使用編輯更新。'],
        ] },
        { type: 'paragraph', text: ['Keep stored answers and their headings intact when editing User Memory. Notes help your team and AI understand the customer; editing a note does not grant messaging consent or change a customer’s opt-out.', '编辑用户记忆时，请保留已保存答案及其标题。备注帮助团队和 AI 了解客户，但修改备注不会授予消息许可，也不会改变客户的退出选择。', '編輯用戶記憶時，請保留已儲存答案及其標題。備註協助團隊和 AI 了解客戶，但修改備註不會授予訊息許可，亦不會改變客戶的退出選擇。'] },
      ] },
      { id: 'user-types', title: ['Organise customers with User Types', '使用用户类型整理客户', '使用用戶類型整理客戶'], blocks: [
        { type: 'paragraph', text: ['Manage User Types from Configurations → User Type, or the User types button on Users if your role allows it. Create a meaningful type, such as Member or Student, and define any fields it needs. Apply it in a customer’s record.', '如果您的角色允许，可通过配置 → 用户类型，或用户页面中的用户类型按钮进行管理。创建有意义的类型，例如会员或学生，并定义所需字段，然后在客户记录中应用。', '如果您的角色允許，可透過配置 → 用戶類型，或用戶頁面中的用戶類型按鈕進行管理。建立有意義的類型，例如會員或學生，並定義所需欄位，然後在客戶記錄中套用。'] },
        { type: 'list', items: [
          ['User Types support customer filtering and audiences. They can also grant access to restricted Knowledge Base spaces, so review that effect before changing a customer’s types.', '用户类型可用于筛选客户和选择对象，也可能授予受限知识库空间的访问权限。更改客户类型前，请检查这一影响。', '用戶類型可用於篩選客戶和選擇對象，亦可能授予受限知識庫空間的存取權限。變更客戶類型前，請檢查這項影響。'],
          ['Local fields are stored in JOHN CRM. API-backed types connect to another system; check the save result if the external source is unavailable or only partly updated.', '本地字段保存在 JOHN CRM。API 类型连接其他系统；外部来源不可用或仅部分更新时，请检查保存结果。', '本機欄位儲存在 JOHN CRM。API 類型連接其他系統；外部來源無法使用或僅部分更新時，請檢查儲存結果。'],
        ] },
      ] },
      { id: 'invite-your-team', title: ['Invite your team', '邀请团队成员', '邀請團隊成員'], blocks: [
        { type: 'steps', items: [
          ['As an owner or administrator with invitation permission, open Workspace → Members → Invite member.', '使用具有邀请权限的所有者或管理员账号，打开工作区 → 成员 → 邀请成员。', '使用具有邀請權限的擁有者或管理員帳戶，開啟工作區 → 成員 → 邀請成員。'],
          ['Enter the teammate’s email and choose the appropriate role. Send the invitation; pending invitations reserve workspace seats.', '输入同事的邮箱并选择合适的角色，然后发送邀请。待处理邀请会预留工作区席位。', '輸入同事的電郵並選擇合適的角色，然後傳送邀請。待處理邀請會預留工作區名額。'],
          ['Ask them to open the invitation using that email and accept it. Use Workspace → Invites to check pending invitations, resend a link or revoke one.', '请对方使用该邮箱打开并接受邀请。通过工作区 → 邀请可检查待处理邀请、重新发送链接或撤销邀请。', '請對方使用該電郵開啟並接受邀請。透過工作區 → 邀請可檢查待處理邀請、重新傳送連結或撤銷邀請。'],
        ] },
        { type: 'paragraph', text: ['Standard workspace invitations expire after seven days. If the seat limit is reached, review unused invitations and available seats before inviting again.', '标准工作区邀请在七天后过期。如果已达到席位上限，请先检查未使用的邀请和可用席位，再重新邀请。', '標準工作區邀請在七天後到期。如果已達名額上限，請先檢查未使用的邀請和可用名額，再重新邀請。'] },
      ] },
      { id: 'manage-permissions', title: ['Review roles and permissions', '检查角色与权限', '檢查角色與權限'], blocks: [
        { type: 'paragraph', text: ['A member’s base role and any custom roles determine their access. Workspace → Workspace Roles shows the available roles. Owners and administrators can manage roles within their own permission limits; some built-in roles are protected.', '成员的基础角色和自定义角色共同决定其权限。工作区 → 工作区角色显示可用角色。所有者和管理员可以在自身权限范围内管理角色；部分内置角色受到保护。', '成員的基本角色和自訂角色共同決定其權限。工作區 → 工作區角色顯示可用角色。擁有者和管理員可在自身權限範圍內管理角色；部分內置角色受到保護。'] },
        { type: 'paragraph', text: ['Open a member’s editor and Manage access to inspect effective permissions and the roles granting them. You cannot use role editing to raise someone above your own level or change your own access. Removing a member takes away access immediately and unassigns their customers; shared knowledge stays in the workspace.', '打开成员编辑器和管理访问权限，检查实际权限及其来源角色。您不能通过编辑角色将他人提升到高于自己的级别，也不能更改自身权限。移除成员会立即取消其访问权限，并解除其客户分配；共享知识仍保留在工作区。', '開啟成員編輯器和管理存取權限，檢查實際權限及其來源角色。您不能透過編輯角色將他人提升至高於自己的級別，亦不能變更自身權限。移除成員會立即取消其存取權限，並解除其客戶分配；共用知識仍保留在工作區。'] },
        { type: 'accordion', title: ['Someone cannot see or change a feature', '成员无法查看或更改功能', '成員無法查看或變更功能'], body: [
          ['Confirm their email, accepted membership and selected workspace. Then inspect their effective permissions rather than relying only on the role name: workspaces can customise some roles. Ask an owner or administrator to grant the necessary access. If the whole feature is unavailable, ask John Support about the workspace’s enabled features.', '确认对方的邮箱、已接受的成员资格及所选工作区。随后检查实际权限，不要只根据角色名称判断，因为工作区可以自定义部分角色。请所有者或管理员授予所需权限。如果整个功能不可用，请向 John 支持咨询工作区启用的功能。', '確認對方的電郵、已接受的成員資格及所選工作區。隨後檢查實際權限，不要只根據角色名稱判斷，因為工作區可自訂部分角色。請擁有者或管理員授予所需權限。如果整個功能無法使用，請向 John 支援查詢工作區已啟用的功能。'],
        ] },
      ] },
    ],
    sources: ['server/services/john/guide/sections/clients.ts', 'server/services/john/guide/sections/organization.ts', 'src/app/components/admin/members-tab.tsx', 'src/app/components/admin/member-editor-dialog.tsx', 'src/locales/en/nav.json', 'src/locales/en/admin.json'],
  },
];
