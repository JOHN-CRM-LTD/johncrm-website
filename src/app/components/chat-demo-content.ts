export type DemoLanguage = 'EN' | 'CN' | 'HK';
export type IndustryId = 'insurance' | 'retail' | 'property' | 'hospitality';

export type ChatScenario = {
  id: IndustryId;
  industry: string;
  question: string;
  standardReply: string;
  standardFollowUp: string;
  reply: string;
  followUp: string;
  finalReply: string;
};

export type DemoCopy = {
  heading: string;
  standard: string;
  industries: string;
  scenarios: ChatScenario[];
};

export const CHAT_DEMO_COPY: Record<DemoLanguage, DemoCopy> = {
  "EN": {
    "heading": "SEAMLESS DELIVERY",
    "standard": "Standard Chat",
    "industries": "Explore industries",
    "scenarios": [
      {
        "id": "insurance",
        "industry": "Insurance",
        "question": "Can I add my partner to my policy?",
        "standardReply": "Please call our helpline for policy changes.",
        "standardFollowUp": "Do I need to start all over again?",
        "reply": "Hi Alex. You can request this at renewal. Yours is coming up in October.",
        "followUp": "Great. What do you need from me?",
        "finalReply": "Your adviser can confirm the details. I’ll pass on this conversation."
      },
      {
        "id": "retail",
        "industry": "Retail",
        "question": "These trainers are a little small. Can I exchange them?",
        "standardReply": "Please check the returns page on our website.",
        "standardFollowUp": "I did. Where do I actually start?",
        "reply": "Hi Jamie. Unworn pairs can be exchanged within 30 days. You ordered last week.",
        "followUp": "Perfect. I need one size up.",
        "finalReply": "Got it. I’ll share your order and preferred size with the team."
      },
      {
        "id": "property",
        "industry": "Real estate",
        "question": "Is the two-bed on Park Road pet-friendly?",
        "standardReply": "Please contact the listing agent for details.",
        "standardFollowUp": "Can you at least tell me who to ask?",
        "reply": "Hi Sam. Pets are welcome at Park Road. There’s a shared garden, too.",
        "followUp": "Sounds ideal. Can I view it on Saturday?",
        "finalReply": "I’ll share your details with the agent to confirm a Saturday viewing."
      },
      {
        "id": "hospitality",
        "industry": "Hospitality",
        "question": "We’ll arrive around 11 pm. Is that okay?",
        "standardReply": "Check-in information is on our website.",
        "standardFollowUp": "But will someone be there that late?",
        "reply": "Hi Taylor. Reception is open 24 hours, so an 11 pm arrival is fine.",
        "followUp": "Lovely. Could we also have a cot?",
        "finalReply": "I’ll share your requests with reception. They’ll confirm cot availability."
      }
    ]
  },
  "CN": {
    "heading": "无缝交付",
    "standard": "普通聊天",
    "industries": "探索行业",
    "scenarios": [
      {
        "id": "insurance",
        "industry": "保险",
        "question": "我可以把伴侣加入保单吗？",
        "standardReply": "更改保单请致电我们的服务热线。",
        "standardFollowUp": "需要重新办理吗？",
        "reply": "陈先生，你好。可以在续保时提出申请，你的续保日期在十月。",
        "followUp": "好的，需要提供什么？",
        "finalReply": "顾问会为你确认详情。我会把这段对话一并转交。"
      },
      {
        "id": "retail",
        "industry": "零售",
        "question": "这双运动鞋有点小，可以换吗？",
        "standardReply": "请查看网站上的退换货页面。",
        "standardFollowUp": "看过了，但应该怎么开始？",
        "reply": "李小姐，你好。未穿过的鞋可在30天内换货。你的订单是上周下的。",
        "followUp": "太好了，我想换大一码。",
        "finalReply": "收到。我会把订单和尺码要求一并转交团队。"
      },
      {
        "id": "property",
        "industry": "房地产",
        "question": "公园路那套两居室可以养宠物吗？",
        "standardReply": "请联系房产经纪了解详情。",
        "standardFollowUp": "那我应该找谁呢？",
        "reply": "林先生，你好。可以，这套房源欢迎宠物，还有共用花园。",
        "followUp": "不错！周六可以看房吗？",
        "finalReply": "我会把周六看房的意向和你的资料交给经纪，确认具体时间。"
      },
      {
        "id": "hospitality",
        "industry": "酒店",
        "question": "我们大约晚上11点到，可以吗？",
        "standardReply": "入住信息请查看我们的网站。",
        "standardFollowUp": "那么晚还有人在吗？",
        "reply": "黄小姐，你好。前台24小时有人，晚上11点抵达没有问题。",
        "followUp": "很好，还能安排婴儿床吗？",
        "finalReply": "我会把两项需求转告前台，他们会确认婴儿床是否可用。"
      }
    ]
  },
  "HK": {
    "heading": "無縫交付",
    "standard": "一般聊天",
    "industries": "探索行業",
    "scenarios": [
      {
        "id": "insurance",
        "industry": "保險",
        "question": "我可以將伴侶加入保單嗎？",
        "standardReply": "更改保單請致電我們的服務熱線。",
        "standardFollowUp": "需要重新辦理嗎？",
        "reply": "陳先生，你好。可以在續保時提出申請，你的續保日期在十月。",
        "followUp": "好的，需要提供甚麼？",
        "finalReply": "顧問會為你確認詳情。我會將這段對話一併轉交。"
      },
      {
        "id": "retail",
        "industry": "零售",
        "question": "這雙運動鞋有點小，可以換嗎？",
        "standardReply": "請查看網站上的退換貨頁面。",
        "standardFollowUp": "看過了，但應該怎樣開始？",
        "reply": "李小姐，你好。未穿過的鞋可在30天內換貨。你的訂單是上星期下的。",
        "followUp": "太好了，我想換大一碼。",
        "finalReply": "收到。我會將訂單和尺碼要求一併轉交團隊。"
      },
      {
        "id": "property",
        "industry": "地產",
        "question": "公園道那個兩房單位可以養寵物嗎？",
        "standardReply": "請聯絡地產代理了解詳情。",
        "standardFollowUp": "那我應該找誰呢？",
        "reply": "林先生，你好。可以，這個單位歡迎寵物，還有共用花園。",
        "followUp": "不錯！星期六可以睇樓嗎？",
        "finalReply": "我會將星期六睇樓的意向和你的資料交給代理，確認具體時間。"
      },
      {
        "id": "hospitality",
        "industry": "酒店",
        "question": "我們大約晚上11點到，可以嗎？",
        "standardReply": "入住資訊請查看我們的網站。",
        "standardFollowUp": "那麼晚還有人在嗎？",
        "reply": "黃小姐，你好。前台24小時有人，晚上11點抵達沒有問題。",
        "followUp": "很好，還能安排嬰兒床嗎？",
        "finalReply": "我會將兩項需求轉告前台，他們會確認嬰兒床是否可用。"
      }
    ]
  }
};
