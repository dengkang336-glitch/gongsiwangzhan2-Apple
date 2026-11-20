// 法务页文案。每一节 = { h: 标题, p: [段落...] }
// 段落支持简单 HTML（<a>、<b>）。

export const privacy = {
  zh: {
    intro: [
      "本政策说明广州云枢方舟科技有限公司（下称「我们」）在本网站以及我们发布的移动应用与 Web 产品（合称「服务」）中如何处理信息。我们尽量把话说清楚，不写看不懂的条款。",
      "一句话版本：能在设备上算的，我们不上传；能不收集的，我们不收集；需要账号的产品，会在这里逐项写明存了什么、存在哪里、怎么删除。",
    ],
    sections: [
      {
        h: "1. 适用范围",
        p: [
          "本政策适用于 <b>ysfangzhou.xyz</b> 网站，以及我们发布并标注适用本政策的 iOS、iPadOS、macOS 应用与 Web 产品。第三方网站或服务（包括 App Store 本身）按其各自的隐私政策处理数据。",
        ],
      },
      {
        h: "2. 网站",
        p: [
          "本站不设账号系统，不投放广告，不使用第三方统计或追踪脚本，也不使用 Cookie 做跨站追踪。",
          "与所有网站一样，服务器会为安全与排障记录访问日志，包括 IP 地址、访问时间、请求路径与浏览器标识。这些日志仅用于排查故障与防止滥用，保留不超过 30 天。",
          "当你通过邮件联系我们时，我们会收到你的邮箱地址、邮件正文与附件。这些内容只用于回复与跟进本次沟通，保留不超过 2 年，你可以随时要求提前删除。",
        ],
      },
      {
        h: "3. 移动应用：默认只在本机",
        p: [
          "<b>Vivace 心跃、眠屿 NightIsle：</b>在你授权后读取系统「健康」中的心率、HRV、血氧、睡眠、体温与训练数据，用于在本机生成摘要、趋势与报告。我们不上传、不存储这些健康数据，也不建立账号。你可以随时在系统「健康」App 中撤销授权。",
          "<b>兔子扫描 Tuziscan：</b>相机、相册与扫描件只在本机处理与保存。只有当你主动导出或分享时，文件才会离开设备，去向由你选择。",
          "<b>掌光 PalmGlow：</b>相机与相册权限仅用于取景、拍照与录像；照片与视频写入你的系统相册，不上传。",
          "<b>拾音 Shiyin：</b>麦克风仅在你按下录音时开启，录音以 m4a 保存在本机。应用无网络请求、无账号、无埋点。",
          "<b>Tunison：</b>麦克风用于调音与音量分析，练习记录保存在本机，不上传。",
          "<b>纸鸢 Kite：</b>节点、订阅与分流配置保存在本机的 App Group 容器内，不上传。连接日志仅在本机显示，不发送到我们的服务器。该客户端本身不收集使用统计。",
        ],
      },
      {
        h: "4. 需要服务端的产品",
        p: [
          "<b>念园 Memorial Grove、灯下小院 Lampside</b> 需要账号才能立碑与保存内容。这类产品会收集：",
          "· 账号信息：邮箱地址（或你选择的第三方登录标识）、显示名与登录凭据的哈希值；",
          "· 你主动提交的内容：碑文、照片、留言、祭品与献花记录；",
          "· 安全审计信息：IP 地址、登录时间与设备标识，用于防止滥用与找回账号。",
          "这些数据存储在我们租用的云服务器与对象存储中。公开内容先审后发；设为私密的内容不会出现在公共视图里，也不会被推荐。我们不会把这些内容用于广告或训练模型。",
        ],
      },
      {
        h: "5. 系统权限",
        p: [
          "只有在相应功能被使用时，应用才会请求权限：健康（读取健康与睡眠数据）、麦克风（录音、调音）、相机与相册（扫描、补光拍照）、通知（本地提醒与提醒事项）、本地网络（连接你配置的节点）。",
          "拒绝任何一项权限，只会影响对应功能，不影响其他部分的使用。",
        ],
      },
      {
        h: "6. 第三方服务",
        p: [
          "我们使用少量第三方服务来运行产品：Apple（App Store 分发、内购、HealthKit 与系统框架）、云主机与对象存储、邮件服务。它们仅在我们委托的范围内处理数据，并受各自隐私政策约束。",
          "我们不出售、出租或交换个人数据，也不向广告平台提供用户数据。",
        ],
      },
      {
        h: "7. 保留与删除",
        p: [
          "访问日志不超过 30 天；支持邮件不超过 2 年；账号与用户内容保留至你删除账号或要求删除为止。",
          "需要删除账号时，请用注册邮箱写信至 <a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a>，注明要删除的账号。我们会在 7 个工作日内完成删除并回复确认；法律要求保留的记录除外。",
        ],
      },
      {
        h: "8. 儿童",
        p: [
          "我们的服务不面向 13 岁以下儿童（在中国大陆为不满 14 周岁的未成年人），也不会在知情的情况下收集其个人信息。若发现误收集，我们会尽快删除。",
        ],
      },
      {
        h: "9. 你的权利",
        p: [
          "你有权访问、更正、删除我们持有的你的个人信息，有权撤回授权、反对特定处理，或要求我们提供数据副本。行使这些权利请写信至支持邮箱，我们会在 15 个工作日内答复。",
          "如果你认为我们的处理侵犯了你的权益，可以向所在地的个人信息保护监管机构投诉。",
        ],
      },
      {
        h: "10. 数据跨境",
        p: [
          "我们主要在中国境内运营。部分云服务或邮件服务可能位于境外，这意味着相关数据可能被传输到境外处理。发生这种情况时，我们会选择有合同与安全保障的服务商，并仅传输提供服务所必需的数据。",
        ],
      },
      {
        h: "11. 政策变更",
        p: [
          "本政策可能更新。更新后会在本页发布并修改文末日期；涉及权利实质变化的，我们会通过网站公告或邮件提前告知。",
        ],
      },
      {
        h: "12. 联系我们",
        p: [
          "广州云枢方舟科技有限公司<br>地址：广州市花都区建设北路 190 号亿能大厦 1207 室 A293<br>邮箱：<a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a>",
        ],
      },
    ],
  },
  en: {
    intro: [
      "This policy explains how Guangzhou Yunshu Ark Technology Co., Ltd. (\"we\", \"us\") handles information on this website and in the mobile and web products we publish (together, the \"services\"). We have tried to write it plainly.",
      "The short version: if something can be computed on your device, we do not upload it; if it does not need to be collected, we do not collect it; products with accounts spell out exactly what is stored, where, and how to delete it.",
    ],
    sections: [
      {
        h: "1. Scope",
        p: [
          "This policy covers <b>ysfangzhou.xyz</b> and the iOS, iPadOS, macOS and web products we publish under it. Third-party sites and services — including the App Store itself — handle data under their own privacy policies.",
        ],
      },
      {
        h: "2. This website",
        p: [
          "This site has no accounts, no advertising, no third-party analytics or tracking scripts, and no cookies used for cross-site tracking.",
          "Like any website, our server keeps access logs for security and troubleshooting: IP address, time, request path and browser identifier. These logs are used only to diagnose failures and prevent abuse, and are kept for no more than 30 days.",
          "When you email us, we receive your address, the message and any attachments. That correspondence is used only to reply and follow up, is kept for no more than two years, and you can ask us to delete it earlier at any time.",
        ],
      },
      {
        h: "3. Mobile apps: on-device by default",
        p: [
          "<b>Vivace, NightIsle:</b> with your permission, these read heart rate, HRV, blood oxygen, sleep, temperature and workout data from Apple Health to build summaries, trends and reports on your device. We do not upload or store this health data and do not create an account. You can revoke access at any time in the Health app.",
          "<b>Tuziscan:</b> camera, photo library and scans are processed and stored on device. Files leave the device only when you choose to export or share them, and only to where you send them.",
          "<b>PalmGlow:</b> camera and photo access is used for the viewfinder, photos and video. Media is written to your system photo library and never uploaded.",
          "<b>Shiyin:</b> the microphone opens only while you are recording. Recordings are saved locally as m4a. The app makes no network requests, has no account and no analytics.",
          "<b>Tunison:</b> the microphone is used for tuning and level analysis. Practice history is stored locally and never uploaded.",
          "<b>Kite:</b> nodes, subscriptions and routing profiles are stored in the app's local App Group container and are not uploaded. Connection logs are shown on device only and are not sent to our servers. The client itself collects no usage statistics.",
        ],
      },
      {
        h: "4. Products with a server",
        p: [
          "<b>Memorial Grove and Lampside</b> require an account to create stones and keep content. For these products we collect:",
          "· account information: email address (or the identifier of the sign-in provider you choose), display name, and a hash of your credentials;",
          "· content you submit: inscriptions, photos, messages, offerings and flower records;",
          "· security information: IP address, sign-in time and device identifier, used to prevent abuse and recover accounts.",
          "This data is stored on cloud servers and object storage we rent. Public content is reviewed before it appears; content marked private does not appear in the public view and is not recommended. We do not use it for advertising or to train models.",
        ],
      },
      {
        h: "5. System permissions",
        p: [
          "Apps request permissions only when the relevant feature is used: Health (reading health and sleep data), microphone (recording, tuning), camera and photo library (scanning, fill-light capture), notifications (local reminders) and local network (connecting to nodes you configure).",
          "Declining any permission only disables that feature; the rest of the app keeps working.",
        ],
      },
      {
        h: "6. Third parties",
        p: [
          "We use a small number of services to run the products: Apple (App Store distribution, in-app purchase, HealthKit and system frameworks), cloud hosting and object storage, and email. They process data only within the scope we instruct and under their own policies.",
          "We do not sell, rent or trade personal data, and we do not give user data to advertising platforms.",
        ],
      },
      {
        h: "7. Retention and deletion",
        p: [
          "Access logs are kept for no more than 30 days; support email for no more than two years; accounts and user content until you delete the account or ask us to remove it.",
          "To delete an account, email <a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a> from the registered address and name the account. We will delete it and confirm within seven business days, except for records we are legally required to keep.",
        ],
      },
      {
        h: "8. Children",
        p: [
          "Our services are not directed to children under 13 (under 14 in mainland China), and we do not knowingly collect their personal information. If we learn we have, we will delete it promptly.",
        ],
      },
      {
        h: "9. Your rights",
        p: [
          "You may access, correct or delete the personal information we hold about you, withdraw consent, object to specific processing, or ask for a copy. Write to our support address; we will respond within 15 business days.",
          "If you believe our processing infringes your rights, you may complain to the data protection authority where you live.",
        ],
      },
      {
        h: "10. International transfers",
        p: [
          "We operate primarily from mainland China. Some cloud or email providers may be located outside the country, which means data may be transferred abroad for processing. When that happens we choose providers with contractual and security safeguards, and transfer only what is necessary to provide the service.",
        ],
      },
      {
        h: "11. Changes",
        p: [
          "We may update this policy. Changes are published on this page with a new date at the end. If a change materially affects your rights, we will announce it on the site or by email in advance.",
        ],
      },
      {
        h: "12. Contact",
        p: [
          "Guangzhou Yunshu Ark Technology Co., Ltd.<br>Room 1207-A293, Yineng Building, 190 Jianshe North Road, Huadu District, Guangzhou, Guangdong, China<br>Email: <a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a>",
        ],
      },
    ],
  },
};

export const terms = {
  zh: {
    intro: [
      "本条款适用于你使用广州云枢方舟科技有限公司（下称「我们」）运营的 ysfangzhou.xyz 网站，以及通过该网站了解或获取的产品与服务。使用本网站即表示你接受本条款。",
    ],
    sections: [
      {
        h: "1. 网站的使用",
        p: [
          "本网站用于介绍我们的公司与产品。你可以浏览、下载页面用于个人参考，也可以按页面提供的联系方式与我们沟通。",
          "你不得以自动化方式大量抓取本网站内容，不得干扰网站正常运行，不得冒用我们的名义发布信息或进行商业活动。",
        ],
      },
      {
        h: "2. 知识产权",
        p: [
          "本网站的文字、界面设计、图形、图标、产品名称与代码，除另有注明外，均由我们创作并享有权利。未经书面许可，不得复制、修改、分发或用于商业用途。",
          "文中提及的第三方商标、平台名称（如 Apple、App Store、iOS、macOS）归其各自权利人所有，仅用于说明兼容性或平台信息。",
        ],
      },
      {
        h: "3. 产品许可",
        p: [
          "通过 App Store 获取的移动应用，其许可条件适用 Apple 的标准最终用户许可协议（Standard EULA）以及产品页面标注的附加条款。",
          "Web 产品在浏览器中提供，我们授予你个人、非独占、不可转让的使用权。产品内的素材（如音库、图形、场景）不得被单独提取、再分发或用于训练其他模型。",
        ],
      },
      {
        h: "4. 使用限制",
        p: [
          "你不得利用我们的产品从事违法活动、侵犯他人权利、绕过产品的技术限制、逆向工程（法律允许的除外），或将产品用于危害他人安全与隐私的用途。",
          "念园与灯下小院允许你为逝者或宠物建立纪念内容。你需保证上传的照片、文字与个人信息已获得必要授权，且不包含违法、诽谤、仇恨或侵犯他人隐私的内容。我们有权对违反规则的内容不予发布或删除。",
        ],
      },
      {
        h: "5. 付费、订阅与退款",
        p: [
          "移动应用的内购与订阅由 Apple 处理，价格以 App Store 页面显示为准。订阅会自动续期，你可以在系统设置中随时取消。",
          "通过 App Store 支付的订单，退款由 Apple 按其政策处理（reportaproblem.apple.com）。我们无法代为退款，但可以协助说明情况。",
          "通过其他渠道购买的服务，按购买时展示的价格、期限与退款规则执行。",
        ],
      },
      {
        h: "6. 第三方链接与服务",
        p: [
          "本网站可能包含指向第三方网站或服务的链接。我们不对其内容、可用性与隐私做法负责，访问前请阅读其条款。",
        ],
      },
      {
        h: "7. 免责声明",
        p: [
          "本网站与产品按「现状」提供。我们会尽力保持准确与可用，但不保证内容无误、服务不中断，也不保证产品适合你的特定用途。",
          "健康类产品（Vivace、眠屿）展示的数据与建议仅供个人参考，不构成医疗诊断或治疗建议。如有健康问题，请咨询专业医生。",
        ],
      },
      {
        h: "8. 责任限制",
        p: [
          "在适用法律允许的最大范围内，对于因使用或无法使用本网站与产品而产生的间接、附带或后果性损失，我们不承担责任。就某一产品产生的直接损失，我们的累计责任不超过你在过去十二个月为该产品支付的金额。",
        ],
      },
      {
        h: "9. 终止",
        p: [
          "如果你违反本条款，我们可以暂停或终止你对相关产品的访问。你可以随时停止使用，并按隐私政策申请删除账号与数据。",
        ],
      },
      {
        h: "10. 适用法律与争议解决",
        p: [
          "本条款适用中华人民共和国法律（不含冲突规范）。因本条款产生的争议，双方应先友好协商；协商不成的，提交广州市花都区有管辖权的人民法院处理。",
        ],
      },
      {
        h: "11. 条款变更",
        p: [
          "我们可能更新本条款，更新后在本页发布并修改日期。继续使用本网站即视为接受更新后的条款。",
        ],
      },
      {
        h: "12. 联系方式",
        p: [
          "广州云枢方舟科技有限公司<br>地址：广州市花都区建设北路 190 号亿能大厦 1207 室 A293<br>邮箱：<a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a>",
        ],
      },
    ],
  },
  en: {
    intro: [
      "These terms apply to your use of ysfangzhou.xyz, operated by Guangzhou Yunshu Ark Technology Co., Ltd. (\"we\", \"us\"), and to the products and services described on it. By using this site you accept these terms.",
    ],
    sections: [
      {
        h: "1. Using this website",
        p: [
          "This site describes our company and products. You may browse it, keep copies of pages for personal reference, and contact us using the details provided.",
          "You may not scrape the site at scale by automated means, interfere with its operation, or publish information or conduct business in our name without permission.",
        ],
      },
      {
        h: "2. Intellectual property",
        p: [
          "Unless stated otherwise, the text, interface design, graphics, icons, product names and code on this site were created by us and are ours. They may not be copied, modified, distributed or used commercially without written permission.",
          "Third-party trademarks and platform names mentioned here (such as Apple, App Store, iOS and macOS) belong to their respective owners and are used only to describe compatibility or platform information.",
        ],
      },
      {
        h: "3. Product licences",
        p: [
          "Mobile apps obtained through the App Store are licensed under Apple's Standard End User License Agreement and any additional terms shown on the product page.",
          "Web products are provided in the browser under a personal, non-exclusive, non-transferable licence. Assets inside a product (sound banks, artwork, scenes) may not be extracted, redistributed or used to train other models.",
        ],
      },
      {
        h: "4. Acceptable use",
        p: [
          "You may not use our products for unlawful activity, to infringe the rights of others, to circumvent technical limits, to reverse engineer them (except where the law permits), or in ways that endanger the safety or privacy of others.",
          "Memorial Grove and Lampside let you create memorial content for people or pets. You confirm that you have the necessary permission for any photo, text or personal information you upload, and that it is not unlawful, defamatory, hateful or invasive of another person's privacy. We may decline to publish or may remove content that breaks these rules.",
        ],
      },
      {
        h: "5. Purchases, subscriptions and refunds",
        p: [
          "In-app purchases and subscriptions for mobile apps are handled by Apple, and prices are those shown on the App Store. Subscriptions renew automatically and can be cancelled at any time in system settings.",
          "Orders paid through the App Store are refunded by Apple under its policy (reportaproblem.apple.com). We cannot issue the refund ourselves but can help explain the situation.",
          "Services bought elsewhere follow the price, term and refund rules shown at the time of purchase.",
        ],
      },
      {
        h: "6. Third-party links and services",
        p: [
          "This site may link to third-party sites or services. We are not responsible for their content, availability or privacy practices; read their terms before using them.",
        ],
      },
      {
        h: "7. Disclaimer",
        p: [
          "This site and the products are provided \"as is\". We work to keep them accurate and available, but do not warrant that the content is error-free, that the service will be uninterrupted, or that a product fits a particular purpose.",
          "Data and suggestions shown by the health products (Vivace, NightIsle) are for personal reference only and are not medical diagnosis or treatment advice. Consult a qualified doctor for health concerns.",
        ],
      },
      {
        h: "8. Limitation of liability",
        p: [
          "To the maximum extent permitted by law, we are not liable for indirect, incidental or consequential loss arising from the use of, or inability to use, this site or the products. For direct loss relating to a product, our total liability will not exceed the amount you paid for that product in the previous twelve months.",
        ],
      },
      {
        h: "9. Termination",
        p: [
          "If you breach these terms we may suspend or end your access to the relevant products. You may stop using them at any time and request deletion of your account and data under the privacy policy.",
        ],
      },
      {
        h: "10. Governing law and disputes",
        p: [
          "These terms are governed by the laws of the People's Republic of China, excluding conflict-of-law rules. Disputes should first be discussed in good faith; if that fails, they will be heard by the competent court in Huadu District, Guangzhou.",
        ],
      },
      {
        h: "11. Changes",
        p: [
          "We may update these terms. Changes are published on this page with a new date. Continuing to use the site means you accept the updated terms.",
        ],
      },
      {
        h: "12. Contact",
        p: [
          "Guangzhou Yunshu Ark Technology Co., Ltd.<br>Room 1207-A293, Yineng Building, 190 Jianshe North Road, Huadu District, Guangzhou, Guangdong, China<br>Email: <a href=\"mailto:support@ysfangzhou.xyz\">support@ysfangzhou.xyz</a>",
        ],
      },
    ],
  },
};
