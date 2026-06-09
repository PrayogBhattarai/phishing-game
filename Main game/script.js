const screen = document.getElementById('screen');

let game;
let currentInbox = 0;
let currentAttack = 0;
let currentPassword = 0;
let currentMaze = 0;
let currentRecovery = 0;
let pendingNextAction = null;
let activeTimer = null;
let timeLeft = 0;
let randomAttackActive = false;
let lastRandomEventAt = -1;
let currentPasswordOptions = [];
let currentPasswordQuestionKey = '';
let currentMazeOptions = [];
let currentMazeQuestionKey = '';
let featureInfoTimer = null;

const TIMER_SECONDS = 30;

const stateTemplate = () => ({
  phase: 'menu',
  level: 0,
  score: 0,
  lives: 5,
  breach: 0,
  difficulty: 'normal',
  xp: 0,
  badges: [],
  evidence: [],
  mistakes: [],
  learned: [],
  attackLog: [],
  streak: 0,
  hintsUsed: 0,
  randomEventsSolved: 0,
  timeouts: 0,
  muted: false,
  language: localStorage.getItem('phish_escape_lang') || 'en'
});

game = stateTemplate();

const LANG = {
  en: {
    name: 'English',
    brandSub: 'ADAPTIVE CYBER INVESTIGATION',
    navHome: 'HOME', navMissions: 'MISSIONS', navDesktop: 'DESKTOP', navReport: 'REPORT', language: 'Language',
    missionTag: '● SYSTEM BREACH DETECTED',
    heroLine1: 'Escape the', heroLine2: 'Phishing Trap',
    heroText: 'Expanded prototype with a fake desktop environment, 30-second timers, combo streaks, random attack popups, sound effects, breach meter, badges, final ranking, and full language support.',
    start: '▶ START FULL MISSION', how: '📘 HOW TO PLAY',
    addonTitle: 'New Add-ons Included', fakeDesktop: 'Fake Desktop', fakeDesktopText: 'Inbox, browser, files, terminal, and security apps.',
    timer30: '30s Timer', timer30Text: 'Every mission question gives 30 seconds to respond.', comboSystem: 'Combo System', comboText: '3 correct answers activate Firewall Boost.',
    randomPopups: 'Random Popups', randomPopupsText: 'Unexpected simulated attacks can appear anytime.', soundFx: 'Sound FX', soundFxText: 'Success, fail, warning, click, and combo sounds.',
    finalRanking: 'Final Ranking', finalRankingText: 'Vulnerable User to Elite Incident Commander.', footer: 'Built by Team VOID · Educational Cyber Security Game Prototype',
    mission: 'MISSION', score: 'SCORE', lives: 'LIVES', streak: 'STREAK', mode: 'MODE', hackerAccess: 'HACKER ACCESS', responseTimer: '⏱ RESPONSE TIMER', soundOn: '🔊 SOUND ON', soundOff: '🔇 SOUND OFF',
    modes: { normal: 'Normal', hard: 'Hard', support: 'Support Mode', pressure: 'Pressure Training' },
    apps: { Inbox:'Inbox', Browser:'Browser', Files:'Files', Terminal:'Terminal', Security:'Security' },
    hackerLabel: '⚠ HACKER TRANSMISSION:',
    hackerLines: ['I am hiding inside your inbox...', 'Your password habits are predictable.', 'Malware packets are spreading through the network.', 'Too slow. The breach level is rising.', 'Can you recover the system before lockdown?'],
    howTitle: 'How to Play', howP1: 'You are trapped inside a hacked university system. Complete five missions to regain control.',
    rules: 'Wrong answers: +15% hacker access and -1 life. Correct answers: -5% hacker access. Hint: +5% hacker access. 3 correct answers in a row activates Firewall Boost.',
    correctAction: '✅ Correct action:', correctActionText: 'Score + XP, hacker access -5%.', wrongAction: '❌ Wrong action:', wrongActionText: 'Lose 1 life, hacker access +15%.', threeStreak: '🔥 3 streak:', threeStreakText: 'Firewall Boost, hacker access -10%.', hintRule: '💡 Hint:', hintRuleText: 'Clue shown, hacker access +5%.', back: 'Back',
    briefingTitle: 'Incident Briefing', scenario: 'Scenario:', scenarioText: 'A phishing email opened a breach inside the system. Your job is to investigate, contain, and recover.', beginInvestigation: 'Begin Investigation',
    missions: ['Mission 1: Phishing Inbox Investigation','Mission 2: Simulated Attack Response','Mission 3: Password Defence Terminal','Mission 4: Malware Containment Map','Mission 5: System Recovery Centre'],
    inboxTitle: 'Mission 1: Phishing Inbox Investigation', from: 'From:', subject: 'Subject:', attachment: 'Attachment:', none: 'None', markPhishing: 'Mark as Phishing', markSafe: 'Mark as Safe', hint: '💡 Hint (+5%)', emailWord: 'Email', of: 'of',
    liveAttack: '🚨 LIVE SIMULATED ATTACK', attackWord: 'Attack', challengeWord: 'Challenge', nodeWord: 'Node', recoveryTaskWord: 'Recovery task',
    passwordTitle: 'Mission 3: Password Defence Terminal', mazeTitle: 'Mission 4: Malware Containment Map', recoveryTitle: 'Mission 5: System Recovery Centre', detectedThreat: 'Detected threat:', bestResponse: 'Best response required.', systemTask: 'SYSTEM TASK', approve: 'Approve Action', reject: 'Reject Action',
    continueBtn: 'Continue', correctResponse: '✅ Correct Response', riskIncreased: '❌ Risk Increased', hintUsedTitle: '💡 Hint Used', hintUsed: 'Hint used (+5% hacker access):', comboBoost: '🔥 Firewall Boost Activated: -10% hacker access bonus!',
    randomPopup: '⚡ RANDOM ATTACK POPUP', randomMini: 'Respond before the popup spreads.',
    finalReport: 'Final Incident Report', finalRank: '🏆 Final Ranking:', rankScale: ['0-500 Vulnerable User','500-1000 Junior Analyst','1000-1500 Cyber Defender','1500+ Elite Incident Commander'],
    ranks: { vulnerable:'Vulnerable User', junior:'Junior Analyst', defender:'Cyber Defender', elite:'Elite Incident Commander' },
    finalScore: 'Final Score', livesLeft: 'Lives Left', badges: 'Badges', hintsUsed: 'Hints Used', randomSolved: 'Random Attacks Solved', timeouts: 'Timeouts', finalBreach: 'Final Hacker Access', badgesEarned: 'Badges Earned', noBadges: 'No badges earned yet', evidenceLog: 'Evidence Log', learningSummary: 'Learning Summary', replay: 'Replay Mission', mainMenu: 'Main Menu',
    gameOverTitle: '💀 SYSTEM COMPROMISED', gameOverText: 'The hacker gained too much access or your lives reached zero.', rankAttempt: 'Rank Attempt:', tryAgain: 'Try Again',
    timeoutJudgement: 'Timed out. Cyber incidents require quick but careful judgement.', timeExpired: 'Time expired.', timeoutAttack: 'Timed out. Fast containment matters during live attacks.', timeoutPassword: 'Timed out. Account security decisions need quick attention.', timeoutMalware: 'Timed out. Malware can spread quickly if containment is delayed.', timeoutRecovery: 'Timed out. Recovery decisions must be documented and completed quickly.',
    labels: { correctly: 'correctly classified', misclassified: 'misclassified', noResponse: 'No response', randomResponse: 'Random popup response', randomTimeout: 'Timed out during random attack', correctContainment: 'Correct containment at', wrongContainment: 'Wrong containment at', malwareTrusted: 'malware response must be active and trusted.', recoveryDecision: 'Recovery decision:', recoveryTimeout: 'Recovery timeout:', response: 'response:' },
    status: { cleaned:'Cleaned', infected:'Infected', locked:'Locked' },
    cleanAdvice: 'Use trusted security controls. Avoid random cleaners and do not ignore active malware.',
    badgesNames: { threat:'Threat Spotter', defender:'System Defender', breach:'Breach Controller', rapid:'Rapid Responder', combo:'Firewall Combo', inbox:'Inbox Analyst', attack:'Attack Responder', password:'Password Guardian', malware:'Malware Cleaner', incident:'Incident Commander' },
    evidenceCombo: '🔥 Firewall Boost Activated: 3 correct responses in a row (-10% hacker access).',
    inboxScenarios: [
      { from:'IT Service Desk <it.helpdesk@coventry.ac.uk>', subject:'Scheduled MFA maintenance notice', preview:'MFA maintenance will happen tonight. No password is required. Contact the official IT portal for help.', url:'https://coventry.ac.uk/it-support', attachment:'None', threat:false, clue:'Official domain, no password request, calm language.' },
      { from:'Student Finance <refund@coventry-payments.ru>', subject:'URGENT: £480 refund expires today!!!', preview:'Click the link now and enter your student login. If you ignore this your account will be closed.', url:'http://coventry-refund-login.ru/claim', attachment:'refund-form.exe', threat:true, clue:'Suspicious domain, urgency, HTTP link, password request, executable file.' },
      { from:'Microsoft 365 <security@micros0ft-login.com>', subject:'Mailbox storage full', preview:'Your email storage is full. Verify your password immediately to prevent deletion.', url:'http://micros0ft-login.com/verify', attachment:'None', threat:true, clue:'Misspelled brand domain, HTTP link, asks for password.' },
      { from:'Library Services <library@coventry.ac.uk>', subject:'Book renewal reminder', preview:'Your borrowed book is due soon. Login through the university library page to renew it.', url:'https://library.coventry.ac.uk/account', attachment:'None', threat:false, clue:'Trusted domain and normal information with no pressure.' },
      { from:'Instagram Security <support@insta-login-help.xyz>', subject:'Someone reported your account', preview:'Your account will be deleted in 2 hours. Confirm username and password now.', url:'http://insta-login-help.xyz/appeal', attachment:'account_review.zip', threat:true, clue:'Fake domain, threatening message, credential request, zipped attachment.' },
      { from:'HR Portal <jobs@coventry-careers.ac.uk>', subject:'Placement workshop reminder', preview:'Reminder: your cyber placement workshop is tomorrow. Login using the normal student portal if you need to reschedule.', url:'https://careers.coventry.ac.uk/events', attachment:'calendar.ics', threat:false, clue:'Relevant service, official domain, harmless calendar file, no credential pressure.' },
      { from:'Delivery Notice <tracking@royalmail-redelivery.help>', subject:'Missed parcel - pay £1.99 now', preview:'Your parcel is held. Pay redelivery charge immediately to avoid return.', url:'http://royalmail-redelivery.help/pay', attachment:'invoice.zip', threat:true, clue:'Fake delivery domain, urgent payment demand, and risky zip attachment.' }
    ],
    attackScenarios: [
      { title:'Unknown File Executing', alert:'download_update.exe is requesting administrator permission.', choices:[{text:'Run the file', safe:false, feedback:'Unsafe. Unknown executables can install malware.'},{text:'Scan and quarantine', safe:true, feedback:'Correct. Quarantine stops possible malware.'},{text:'Ignore the warning', safe:false, feedback:'Unsafe. Ignoring alerts allows infection to continue.'}] },
      { title:'MFA Push Bombing', alert:'You receive 7 login approval requests, but you did not try to sign in.', choices:[{text:'Approve one request', safe:false, feedback:'Unsafe. Never approve unexpected MFA prompts.'},{text:'Deny request and reset password', safe:true, feedback:'Correct. Deny, reset password, and report it.'},{text:'Turn off MFA', safe:false, feedback:'Unsafe. MFA protects you from stolen passwords.'}] },
      { title:'Data Exfiltration Alert', alert:'A hidden process is sending files to an unknown external server.', choices:[{text:'Disconnect the device from network', safe:true, feedback:'Correct. Isolation limits data loss.'},{text:'Close the alert window', safe:false, feedback:'Unsafe. Closing alerts does not stop data theft.'},{text:'Upload backup folder', safe:false, feedback:'Unsafe. More files may be stolen.'}] },
      { title:'Fake Browser Update', alert:'A popup says: install SecureBrowser_Update_now.zip to continue.', choices:[{text:'Download and install', safe:false, feedback:'Unsafe. Fake updates are common malware tricks.'},{text:'Close popup and update from official settings', safe:true, feedback:'Correct. Only update from trusted sources.'},{text:'Share link with friends', safe:false, feedback:'Unsafe. That spreads the attack.'}] }
    ],
    randomEvents: [
      { title:'Suspicious USB Detected', alert:'A new USB device tries to run autorun.inf.', safeText:'Block USB and scan', unsafeText:'Open files now', feedback:'USB devices can carry autorun malware. Block and scan first.' },
      { title:'Ransomware Note Appears', alert:'A window says your files are encrypted and asks for payment.', safeText:'Disconnect and report incident', unsafeText:'Pay immediately', feedback:'Disconnecting limits spread; reporting starts incident response.' },
      { title:'Clipboard Hijack Warning', alert:'Copied bank details changed suddenly.', safeText:'Stop transaction and verify', unsafeText:'Paste anyway', feedback:'Clipboard hijacking can replace payment details.' },
      { title:'Unexpected Admin Login', alert:'Admin login detected from another country.', safeText:'Revoke session and reset password', unsafeText:'Ignore alert', feedback:'Unexpected sessions should be revoked and investigated.' }
    ],
    passwordChallenges: [
      { prompt:'Choose the safest password for a student portal.', options:[{text:'prashanna123', safe:false, reason:'Uses name and common numbers.'},{text:'Coventry2026', safe:false, reason:'Predictable word plus year.'},{text:'R!ver-Cloud7-Mango#92', safe:true, reason:'Long, mixed, and hard to guess.'}] },
      { prompt:'Your password was leaked. What should you do first?', options:[{text:'Reuse it but add 1 at the end', safe:false, reason:'Small changes are easy to guess.'},{text:'Create unique password and enable MFA', safe:true, reason:'Unique password plus MFA reduces account takeover risk.'},{text:'Ignore it because only one site leaked', safe:false, reason:'Attackers try leaked passwords on many sites.'}] },
      { prompt:'Which password habit is most secure?', options:[{text:'Use one strong password everywhere', safe:false, reason:'One breach can expose all accounts.'},{text:'Store passwords in plain notes', safe:false, reason:'Plain notes can be exposed.'},{text:'Use a password manager and unique passwords', safe:true, reason:'This improves security and usability.'}] }
    ],
    mazeNodes: [
      { name:'Downloads Folder', icon:'📁', threat:'trojan.exe', safeMove:'Quarantine file' }, { name:'Browser Cache', icon:'🌐', threat:'fake update script', safeMove:'Clear suspicious cache' }, { name:'USB Drive', icon:'💾', threat:'autorun malware', safeMove:'Disable autorun and scan' }, { name:'Startup Apps', icon:'⚙️', threat:'unknown startup process', safeMove:'Disable and investigate' }, { name:'Network Port', icon:'📡', threat:'unknown outgoing traffic', safeMove:'Block connection' }
    ],
    recoveryTasks: [
      { task:'Enable MFA for admin accounts', correct:true, lesson:'MFA protects accounts even if passwords leak.' }, { task:'Delete backups to save space', correct:false, lesson:'Backups help recovery after ransomware or data loss.' }, { task:'Block suspicious email sender/domain', correct:true, lesson:'Blocking known phishing sources reduces future exposure.' }, { task:'Share the admin password in group chat', correct:false, lesson:'Passwords must not be shared insecurely.' }, { task:'Restore clean backup after malware removal', correct:true, lesson:'Clean backups support safe recovery.' }, { task:'Document incident evidence and actions', correct:true, lesson:'Incident records support learning and accountability.' }
    ]
  },
  hi: {},
  ne: {}
};

Object.assign(LANG.hi, LANG.en, {
  name:'हिन्दी', brandSub:'अनुकूल साइबर जांच', navHome:'होम', navMissions:'मिशन', navDesktop:'डेस्कटॉप', navReport:'रिपोर्ट', language:'भाषा', missionTag:'● सिस्टम में सेंध मिली', heroLine1:'बचकर निकलें', heroLine2:'फिशिंग जाल से',
  heroText:'इस बड़े प्रोटोटाइप में नकली डेस्कटॉप, 30 सेकंड टाइमर, कॉम्बो स्ट्रीक, अचानक हमले वाले पॉपअप, ध्वनि प्रभाव, हैकर एक्सेस मीटर, बैज, अंतिम रैंकिंग और पूरा भाषा समर्थन है।',
  start:'▶ पूरा मिशन शुरू करें', how:'📘 कैसे खेलें', addonTitle:'नए फीचर जोड़े गए', fakeDesktop:'नकली डेस्कटॉप', fakeDesktopText:'इनबॉक्स, ब्राउज़र, फाइलें, टर्मिनल और सुरक्षा ऐप्स।', timer30:'30 सेकंड टाइमर', timer30Text:'हर मिशन प्रश्न का जवाब देने के लिए 30 सेकंड मिलते हैं।', comboSystem:'कॉम्बो सिस्टम', comboText:'लगातार 3 सही जवाब Firewall Boost चालू करते हैं।', randomPopups:'अचानक पॉपअप', randomPopupsText:'नकली साइबर हमले कभी भी दिख सकते हैं।', soundFx:'ध्वनि प्रभाव', soundFxText:'सफलता, गलती, चेतावनी, क्लिक और कॉम्बो ध्वनियां।', finalRanking:'अंतिम रैंकिंग', finalRankingText:'Vulnerable User से Elite Incident Commander तक।', footer:'Team VOID द्वारा बनाया गया · शैक्षणिक साइबर सुरक्षा गेम प्रोटोटाइप',
  mission:'मिशन', score:'स्कोर', lives:'लाइफ', streak:'स्ट्रीक', mode:'मोड', hackerAccess:'हैकर एक्सेस', responseTimer:'⏱ जवाब टाइमर', soundOn:'🔊 आवाज चालू', soundOff:'🔇 आवाज बंद',
  modes:{normal:'सामान्य', hard:'कठिन', support:'सहायता मोड', pressure:'दबाव प्रशिक्षण'}, apps:{Inbox:'इनबॉक्स', Browser:'ब्राउज़र', Files:'फाइलें', Terminal:'टर्मिनल', Security:'सुरक्षा'}, hackerLabel:'⚠ हैकर संदेश:',
  hackerLines:['मैं तुम्हारे इनबॉक्स में छिपा हूँ...', 'तुम्हारी पासवर्ड आदतें अनुमान लगाने योग्य हैं।', 'मैलवेयर पैकेट नेटवर्क में फैल रहे हैं।', 'बहुत धीमे। सेंध स्तर बढ़ रहा है।', 'क्या तुम लॉकडाउन से पहले सिस्टम बचा सकते हो?'],
  howTitle:'कैसे खेलें', howP1:'आप एक हैक किए गए यूनिवर्सिटी सिस्टम में फंस गए हैं। नियंत्रण वापस पाने के लिए पांच मिशन पूरे करें।', rules:'गलत जवाब: +15% हैकर एक्सेस और -1 लाइफ। सही जवाब: -5% हैकर एक्सेस। हिंट: +5% हैकर एक्सेस। लगातार 3 सही जवाब Firewall Boost चालू करते हैं।', correctAction:'✅ सही कार्रवाई:', correctActionText:'स्कोर + XP, हैकर एक्सेस -5%।', wrongAction:'❌ गलत कार्रवाई:', wrongActionText:'1 लाइफ कम, हैकर एक्सेस +15%।', threeStreak:'🔥 3 स्ट्रीक:', threeStreakText:'Firewall Boost, हैकर एक्सेस -10%।', hintRule:'💡 हिंट:', hintRuleText:'संकेत दिखेगा, हैकर एक्सेस +5%।', back:'वापस',
  briefingTitle:'घटना ब्रीफिंग', scenario:'स्थिति:', scenarioText:'एक फिशिंग ईमेल ने सिस्टम में सेंध खोल दी। आपका काम जांचना, रोकना और सिस्टम को ठीक करना है।', beginInvestigation:'जांच शुरू करें', missions:['मिशन 1: फिशिंग इनबॉक्स जांच','मिशन 2: नकली हमले का जवाब','मिशन 3: पासवर्ड रक्षा टर्मिनल','मिशन 4: मैलवेयर नियंत्रण मैप','मिशन 5: सिस्टम रिकवरी सेंटर'],
  inboxTitle:'मिशन 1: फिशिंग इनबॉक्स जांच', from:'भेजने वाला:', subject:'विषय:', attachment:'अटैचमेंट:', none:'कोई नहीं', markPhishing:'फिशिंग चिन्हित करें', markSafe:'सुरक्षित चिन्हित करें', hint:'💡 हिंट (+5%)', emailWord:'ईमेल', of:'में से', liveAttack:'🚨 लाइव नकली हमला', attackWord:'हमला', challengeWord:'चुनौती', nodeWord:'नोड', recoveryTaskWord:'रिकवरी कार्य', passwordTitle:'मिशन 3: पासवर्ड रक्षा टर्मिनल', mazeTitle:'मिशन 4: मैलवेयर नियंत्रण मैप', recoveryTitle:'मिशन 5: सिस्टम रिकवरी सेंटर', detectedThreat:'मिला खतरा:', bestResponse:'सबसे अच्छा जवाब चाहिए।', systemTask:'सिस्टम कार्य', approve:'कार्रवाई स्वीकार करें', reject:'कार्रवाई अस्वीकार करें',
  continueBtn:'जारी रखें', correctResponse:'✅ सही जवाब', riskIncreased:'❌ जोखिम बढ़ा', hintUsedTitle:'💡 हिंट इस्तेमाल हुआ', hintUsed:'हिंट इस्तेमाल (+5% हैकर एक्सेस):', comboBoost:'🔥 Firewall Boost चालू: -10% हैकर एक्सेस बोनस!', randomPopup:'⚡ अचानक हमला पॉपअप', randomMini:'पॉपअप फैलने से पहले जवाब दें।', finalReport:'अंतिम घटना रिपोर्ट', finalRank:'🏆 अंतिम रैंकिंग:', rankScale:['0-500 Vulnerable User','500-1000 Junior Analyst','1000-1500 Cyber Defender','1500+ Elite Incident Commander'], ranks:{vulnerable:'Vulnerable User', junior:'Junior Analyst', defender:'Cyber Defender', elite:'Elite Incident Commander'}, finalScore:'अंतिम स्कोर', livesLeft:'बची लाइफ', badges:'बैज', hintsUsed:'इस्तेमाल हिंट', randomSolved:'हल किए अचानक हमले', timeouts:'टाइम आउट', finalBreach:'अंतिम हैकर एक्सेस', badgesEarned:'मिले बैज', noBadges:'अभी कोई बैज नहीं', evidenceLog:'सबूत लॉग', learningSummary:'सीखने का सारांश', replay:'मिशन फिर खेलें', mainMenu:'मुख्य मेनू', gameOverTitle:'💀 सिस्टम समझौता हो गया', gameOverText:'हैकर को बहुत ज्यादा एक्सेस मिल गया या आपकी लाइफ खत्म हो गई।', rankAttempt:'रैंक प्रयास:', tryAgain:'फिर कोशिश करें',
  timeoutJudgement:'समय खत्म। साइबर घटनाओं में तेज लेकिन सावधान निर्णय चाहिए।', timeExpired:'समय खत्म।', timeoutAttack:'समय खत्म। लाइव हमले में तेजी से रोकथाम जरूरी है।', timeoutPassword:'समय खत्म। अकाउंट सुरक्षा निर्णय जल्दी लेने होते हैं।', timeoutMalware:'समय खत्म। रोकथाम देर होने पर मैलवेयर जल्दी फैल सकता है।', timeoutRecovery:'समय खत्म। रिकवरी फैसले जल्दी और दस्तावेज़ के साथ पूरे होने चाहिए।', labels:{correctly:'सही वर्गीकृत', misclassified:'गलत वर्गीकृत', noResponse:'कोई जवाब नहीं', randomResponse:'अचानक पॉपअप जवाब', randomTimeout:'अचानक हमले में समय खत्म', correctContainment:'सही नियंत्रण', wrongContainment:'गलत नियंत्रण', malwareTrusted:'मैलवेयर जवाब सक्रिय और भरोसेमंद होना चाहिए।', recoveryDecision:'रिकवरी निर्णय:', recoveryTimeout:'रिकवरी समय खत्म:', response:'जवाब:'}, status:{cleaned:'साफ किया', infected:'संक्रमित', locked:'बंद'}, cleanAdvice:'भरोसेमंद सुरक्षा नियंत्रण इस्तेमाल करें। अचानक दिखे क्लीनर से बचें और सक्रिय मैलवेयर को अनदेखा न करें।', badgesNames:{threat:'Threat Spotter', defender:'System Defender', breach:'Breach Controller', rapid:'Rapid Responder', combo:'Firewall Combo', inbox:'Inbox Analyst', attack:'Attack Responder', password:'Password Guardian', malware:'Malware Cleaner', incident:'Incident Commander'}, evidenceCombo:'🔥 Firewall Boost चालू: लगातार 3 सही जवाब (-10% हैकर एक्सेस)।',
  inboxScenarios:[
    {from:'IT Service Desk <it.helpdesk@coventry.ac.uk>', subject:'निर्धारित MFA रखरखाव सूचना', preview:'MFA रखरखाव आज रात होगा। कोई पासवर्ड जरूरी नहीं है। मदद के लिए आधिकारिक IT पोर्टल से संपर्क करें।', url:'https://coventry.ac.uk/it-support', attachment:'कोई नहीं', threat:false, clue:'आधिकारिक डोमेन, पासवर्ड की मांग नहीं, शांत भाषा।'},
    {from:'Student Finance <refund@coventry-payments.ru>', subject:'तुरंत: £480 रिफंड आज खत्म!!!', preview:'लिंक पर अभी क्लिक करें और अपना छात्र लॉगिन दर्ज करें। अनदेखा करने पर आपका अकाउंट बंद हो जाएगा।', url:'http://coventry-refund-login.ru/claim', attachment:'refund-form.exe', threat:true, clue:'संदिग्ध डोमेन, जल्दबाजी, HTTP लिंक, पासवर्ड मांगना, executable फाइल।'},
    {from:'Microsoft 365 <security@micros0ft-login.com>', subject:'मेलबॉक्स स्टोरेज भर गया', preview:'आपका ईमेल स्टोरेज भर गया है। डिलीट होने से बचाने के लिए तुरंत पासवर्ड सत्यापित करें।', url:'http://micros0ft-login.com/verify', attachment:'कोई नहीं', threat:true, clue:'ब्रांड डोमेन गलत लिखा है, HTTP लिंक, पासवर्ड मांगता है।'},
    {from:'Library Services <library@coventry.ac.uk>', subject:'किताब नवीनीकरण याद दिलाना', preview:'आपकी ली गई किताब जल्द देय है। नवीनीकरण के लिए यूनिवर्सिटी लाइब्रेरी पेज से लॉगिन करें।', url:'https://library.coventry.ac.uk/account', attachment:'कोई नहीं', threat:false, clue:'विश्वसनीय डोमेन और सामान्य सूचना, कोई दबाव नहीं।'},
    {from:'Instagram Security <support@insta-login-help.xyz>', subject:'किसी ने आपका अकाउंट रिपोर्ट किया', preview:'आपका अकाउंट 2 घंटे में डिलीट होगा। अभी username और password पुष्टि करें।', url:'http://insta-login-help.xyz/appeal', attachment:'account_review.zip', threat:true, clue:'नकली डोमेन, धमकी भरा संदेश, लॉगिन जानकारी की मांग, zip अटैचमेंट।'},
    {from:'HR Portal <jobs@coventry-careers.ac.uk>', subject:'प्लेसमेंट वर्कशॉप याद दिलाना', preview:'याद दिलाना: आपकी साइबर प्लेसमेंट वर्कशॉप कल है। बदलना हो तो सामान्य छात्र पोर्टल से लॉगिन करें।', url:'https://careers.coventry.ac.uk/events', attachment:'calendar.ics', threat:false, clue:'संबंधित सेवा, आधिकारिक डोमेन, सुरक्षित calendar फाइल, पासवर्ड दबाव नहीं।'},
    {from:'Delivery Notice <tracking@royalmail-redelivery.help>', subject:'छूटा पार्सल - अभी £1.99 भुगतान करें', preview:'आपका पार्सल रोका गया है। वापस जाने से बचाने के लिए तुरंत redelivery शुल्क दें।', url:'http://royalmail-redelivery.help/pay', attachment:'invoice.zip', threat:true, clue:'नकली delivery डोमेन, जल्द भुगतान दबाव, risky zip अटैचमेंट।'}],
  attackScenarios:[
    {title:'अज्ञात फाइल चल रही है', alert:'download_update.exe administrator permission मांग रहा है।', choices:[{text:'फाइल चलाएं', safe:false, feedback:'असुरक्षित। अज्ञात executables मैलवेयर इंस्टॉल कर सकते हैं।'},{text:'स्कैन और quarantine करें', safe:true, feedback:'सही। Quarantine संभावित मैलवेयर रोकता है।'},{text:'चेतावनी अनदेखी करें', safe:false, feedback:'असुरक्षित। चेतावनी अनदेखी करने से infection जारी रह सकता है।'}]},
    {title:'MFA Push Bombing', alert:'आपको 7 login approval requests मिलती हैं, जबकि आपने sign in नहीं किया।', choices:[{text:'एक request approve करें', safe:false, feedback:'असुरक्षित। अनपेक्षित MFA prompts कभी approve न करें।'},{text:'Request deny करके password reset करें', safe:true, feedback:'सही। Deny करें, password reset करें और report करें।'},{text:'MFA बंद करें', safe:false, feedback:'असुरक्षित। MFA stolen passwords से बचाता है।'}]},
    {title:'Data Exfiltration Alert', alert:'एक hidden process files को unknown external server पर भेज रहा है।', choices:[{text:'Device को network से disconnect करें', safe:true, feedback:'सही। Isolation data loss कम करता है।'},{text:'Alert window बंद करें', safe:false, feedback:'असुरक्षित। Alert बंद करने से data theft नहीं रुकता।'},{text:'Backup folder upload करें', safe:false, feedback:'असुरक्षित। और फाइलें चोरी हो सकती हैं।'}]},
    {title:'नकली Browser Update', alert:'Popup कहता है: continue करने के लिए SecureBrowser_Update_now.zip install करें।', choices:[{text:'Download और install करें', safe:false, feedback:'असुरक्षित। Fake updates मैलवेयर trick होते हैं।'},{text:'Popup बंद करके official settings से update करें', safe:true, feedback:'सही। केवल trusted sources से update करें।'},{text:'Link दोस्तों को भेजें', safe:false, feedback:'असुरक्षित। इससे attack फैलता है।'}]}],
  randomEvents:[
    {title:'संदिग्ध USB मिला', alert:'नया USB device autorun.inf चलाने की कोशिश करता है।', safeText:'USB block करके scan करें', unsafeText:'Files अभी खोलें', feedback:'USB devices autorun malware ला सकते हैं। पहले block और scan करें।'},
    {title:'Ransomware Note दिखा', alert:'एक window कहती है कि आपकी files encrypted हैं और payment मांगती है।', safeText:'Disconnect करके incident report करें', unsafeText:'तुरंत भुगतान करें', feedback:'Disconnect spread कम करता है; report incident response शुरू करता है।'},
    {title:'Clipboard Hijack चेतावनी', alert:'Copy किए bank details अचानक बदल गए।', safeText:'Transaction रोककर verify करें', unsafeText:'फिर भी paste करें', feedback:'Clipboard hijacking payment details बदल सकता है।'},
    {title:'Unexpected Admin Login', alert:'दूसरे देश से admin login detected है।', safeText:'Session revoke करके password reset करें', unsafeText:'Alert अनदेखा करें', feedback:'Unexpected sessions revoke करके investigate करने चाहिए।'}],
  passwordChallenges:[
    {prompt:'Student portal के लिए सबसे सुरक्षित password चुनें।', options:[{text:'prashanna123', safe:false, reason:'नाम और common numbers इस्तेमाल हुए हैं।'},{text:'Coventry2026', safe:false, reason:'Predictable word और year है।'},{text:'R!ver-Cloud7-Mango#92', safe:true, reason:'लंबा, mixed और guess करना कठिन है।'}]},
    {prompt:'आपका password leak हो गया। सबसे पहले क्या करना चाहिए?', options:[{text:'वही password reuse करके अंत में 1 जोड़ें', safe:false, reason:'छोटे बदलाव आसानी से guess होते हैं।'},{text:'Unique password बनाएं और MFA enable करें', safe:true, reason:'Unique password और MFA account takeover risk कम करते हैं।'},{text:'Ignore करें क्योंकि केवल एक site leak हुई', safe:false, reason:'Attackers leaked passwords कई sites पर try करते हैं।'}]},
    {prompt:'कौन सी password habit सबसे secure है?', options:[{text:'हर जगह एक strong password इस्तेमाल करें', safe:false, reason:'एक breach सभी accounts expose कर सकता है।'},{text:'Passwords plain notes में रखें', safe:false, reason:'Plain notes expose हो सकते हैं।'},{text:'Password manager और unique passwords इस्तेमाल करें', safe:true, reason:'यह security और usability दोनों बेहतर करता है।'}]}],
  mazeNodes:[{name:'Downloads Folder', icon:'📁', threat:'trojan.exe', safeMove:'File quarantine करें'}, {name:'Browser Cache', icon:'🌐', threat:'fake update script', safeMove:'संदिग्ध cache साफ करें'}, {name:'USB Drive', icon:'💾', threat:'autorun malware', safeMove:'Autorun disable करके scan करें'}, {name:'Startup Apps', icon:'⚙️', threat:'unknown startup process', safeMove:'Disable करके investigate करें'}, {name:'Network Port', icon:'📡', threat:'unknown outgoing traffic', safeMove:'Connection block करें'}],
  recoveryTasks:[{task:'Admin accounts के लिए MFA enable करें', correct:true, lesson:'MFA password leak होने पर भी accounts बचाता है।'}, {task:'Space बचाने के लिए backups delete करें', correct:false, lesson:'Backups ransomware या data loss के बाद recovery में मदद करते हैं।'}, {task:'Suspicious email sender/domain block करें', correct:true, lesson:'Known phishing sources block करने से future exposure कम होता है।'}, {task:'Admin password group chat में share करें', correct:false, lesson:'Passwords insecure तरीके से share नहीं करने चाहिए।'}, {task:'Malware removal के बाद clean backup restore करें', correct:true, lesson:'Clean backups safe recovery support करते हैं।'}, {task:'Incident evidence और actions document करें', correct:true, lesson:'Incident records learning और accountability support करते हैं।'}]
});

Object.assign(LANG.ne, LANG.hi, {
  name:'नेपाली', brandSub:'अनुकूल साइबर अनुसन्धान', navHome:'गृह', navMissions:'मिसन', navDesktop:'डेस्कटप', navReport:'रिपोर्ट', language:'भाषा', missionTag:'● सिस्टममा घुसपैठ भेटियो', heroLine1:'बचेर निस्कनुहोस्', heroLine2:'फिसिङ जालबाट',
  heroText:'यस ठूलो प्रोटोटाइपमा नक्कली डेस्कटप, ३० सेकेन्ड टाइमर, combo streak, अचानक attack popups, sound effects, hacker access meter, badges, final ranking र पूर्ण भाषा समर्थन छ।',
  start:'▶ पूरा मिसन सुरु गर्नुहोस्', how:'📘 कसरी खेल्ने', addonTitle:'नयाँ सुविधाहरू थपिएका छन्', fakeDesktop:'नक्कली डेस्कटप', fakeDesktopText:'इनबक्स, ब्राउजर, फाइलहरू, टर्मिनल र सुरक्षा apps।', timer30:'३० सेकेन्ड टाइमर', timer30Text:'हरेक मिसन प्रश्नको जवाफ दिन ३० सेकेन्ड हुन्छ।', comboSystem:'Combo System', comboText:'लगातार ३ सही उत्तरले Firewall Boost चलाउँछ।', randomPopups:'अचानक Popups', randomPopupsText:'नक्कली साइबर हमला जुनसुकै बेला आउन सक्छ।', soundFx:'Sound FX', soundFxText:'सफलता, गल्ती, चेतावनी, क्लिक र combo आवाज।', finalRanking:'अन्तिम Ranking', finalRankingText:'Vulnerable User देखि Elite Incident Commander सम्म।', footer:'Team VOID द्वारा बनाइएको · शैक्षिक साइबर सुरक्षा गेम प्रोटोटाइप',
  mission:'मिसन', score:'स्कोर', lives:'लाइफ', streak:'स्ट्रीक', mode:'मोड', hackerAccess:'ह्याकर पहुँच', responseTimer:'⏱ उत्तर टाइमर', soundOn:'🔊 आवाज चालु', soundOff:'🔇 आवाज बन्द',
  modes:{normal:'सामान्य', hard:'कठिन', support:'सहयोग मोड', pressure:'दबाब प्रशिक्षण'}, apps:{Inbox:'इनबक्स', Browser:'ब्राउजर', Files:'फाइलहरू', Terminal:'टर्मिनल', Security:'सुरक्षा'}, hackerLabel:'⚠ ह्याकर सन्देश:',
  hackerLines:['म तिम्रो इनबक्समा लुकेको छु...', 'तिम्रो password बानी अनुमान गर्न सजिलो छ।', 'Malware packets network मा फैलिँदैछन्।', 'धेरै ढिलो। breach level बढ्दैछ।', 'Lockdown अघि system बचाउन सक्छौ?'],
  howTitle:'कसरी खेल्ने', howP1:'तपाईं hacked university system भित्र फस्नुभएको छ। नियन्त्रण फिर्ता लिन पाँच मिसन पूरा गर्नुहोस्।', rules:'गलत उत्तर: +15% hacker access र -1 life। सही उत्तर: -5% hacker access। hint: +5% hacker access। लगातार ३ सही उत्तरले Firewall Boost चलाउँछ।', correctAction:'✅ सही कार्य:', correctActionText:'Score + XP, hacker access -5%।', wrongAction:'❌ गलत कार्य:', wrongActionText:'1 life घट्छ, hacker access +15%।', threeStreak:'🔥 ३ streak:', threeStreakText:'Firewall Boost, hacker access -10%।', hintRule:'💡 Hint:', hintRuleText:'संकेत देखिन्छ, hacker access +5%।', back:'फिर्ता',
  briefingTitle:'घटना Briefing', scenario:'स्थिति:', scenarioText:'एउटा phishing email ले system भित्र breach खोल्यो। तपाईंको काम investigate, contain र recover गर्नु हो।', beginInvestigation:'अनुसन्धान सुरु गर्नुहोस्', missions:['मिसन १: Phishing Inbox अनुसन्धान','मिसन २: Simulated Attack Response','मिसन ३: Password Defence Terminal','मिसन ४: Malware Containment Map','मिसन ५: System Recovery Centre'],
  inboxTitle:'मिसन १: Phishing Inbox अनुसन्धान', from:'प्रेषक:', subject:'विषय:', attachment:'Attachment:', none:'छैन', markPhishing:'Phishing चिन्ह लगाउनुहोस्', markSafe:'Safe चिन्ह लगाउनुहोस्', hint:'💡 Hint (+5%)', emailWord:'इमेल', of:'मध्ये', liveAttack:'🚨 LIVE SIMULATED ATTACK', attackWord:'Attack', challengeWord:'Challenge', nodeWord:'Node', recoveryTaskWord:'Recovery task', passwordTitle:'मिसन ३: Password Defence Terminal', mazeTitle:'मिसन ४: Malware Containment Map', recoveryTitle:'मिसन ५: System Recovery Centre', detectedThreat:'भेटिएको खतरा:', bestResponse:'सबैभन्दा राम्रो response चाहिन्छ।', systemTask:'SYSTEM TASK', approve:'Action approve गर्नुहोस्', reject:'Action reject गर्नुहोस्',
  continueBtn:'जारी राख्नुहोस्', correctResponse:'✅ सही उत्तर', riskIncreased:'❌ जोखिम बढ्यो', hintUsedTitle:'💡 Hint प्रयोग भयो', hintUsed:'Hint प्रयोग (+5% hacker access):', comboBoost:'🔥 Firewall Boost चालु: -10% hacker access bonus!', randomPopup:'⚡ अचानक Attack Popup', randomMini:'Popup फैलिनुअघि उत्तर दिनुहोस्।', finalReport:'अन्तिम Incident Report', finalRank:'🏆 अन्तिम Ranking:', finalScore:'अन्तिम Score', livesLeft:'बाँकी Life', badges:'Badges', hintsUsed:'प्रयोग भएका Hints', randomSolved:'Solved Random Attacks', timeouts:'Timeouts', finalBreach:'अन्तिम Hacker Access', badgesEarned:'प्राप्त Badges', noBadges:'अहिले कुनै badge छैन', evidenceLog:'Evidence Log', learningSummary:'Learning Summary', replay:'Mission फेरि खेल्नुहोस्', mainMenu:'मुख्य Menu', gameOverTitle:'💀 SYSTEM COMPROMISED', gameOverText:'Hacker ले धेरै access पायो वा तपाईंको lives सकिए।', rankAttempt:'Rank Attempt:', tryAgain:'फेरि प्रयास गर्नुहोस्',
  timeoutJudgement:'समय सकियो। Cyber incidents मा छिटो तर सावधानीपूर्वक judgement चाहिन्छ।', timeExpired:'समय सकियो।', timeoutAttack:'समय सकियो। Live attack मा छिटो containment जरूरी हुन्छ।', timeoutPassword:'समय सकियो। Account security decisions छिटो लिनुपर्छ।', timeoutMalware:'समय सकियो। Containment ढिलो भयो भने malware छिटो फैलिन सक्छ।', timeoutRecovery:'समय सकियो। Recovery decisions छिटो document गरेर पूरा गर्नुपर्छ।', labels:{correctly:'सही classify भयो', misclassified:'गलत classify भयो', noResponse:'उत्तर छैन', randomResponse:'Random popup response', randomTimeout:'Random attack मा time out', correctContainment:'सही containment', wrongContainment:'गलत containment', malwareTrusted:'malware response active र trusted हुनुपर्छ।', recoveryDecision:'Recovery decision:', recoveryTimeout:'Recovery timeout:', response:'response:'}, status:{cleaned:'सफा भयो', infected:'संक्रमित', locked:'बन्द'}, cleanAdvice:'Trusted security controls प्रयोग गर्नुहोस्। Random cleaners बाट बच्नुहोस् र active malware ignore नगर्नुहोस्।', evidenceCombo:'🔥 Firewall Boost चालु: लगातार ३ सही उत्तर (-10% hacker access)।',
  inboxScenarios:[
    {from:'IT Service Desk <it.helpdesk@coventry.ac.uk>', subject:'निर्धारित MFA maintenance notice', preview:'MFA maintenance आज राति हुनेछ। Password आवश्यक छैन। सहयोगका लागि official IT portal प्रयोग गर्नुहोस्।', url:'https://coventry.ac.uk/it-support', attachment:'छैन', threat:false, clue:'Official domain, password request छैन, भाषा शान्त छ।'},
    {from:'Student Finance <refund@coventry-payments.ru>', subject:'URGENT: £480 refund आजै सकिन्छ!!!', preview:'Link मा अहिले click गरेर student login लेख्नुहोस्। Ignore गरे account बन्द हुनेछ।', url:'http://coventry-refund-login.ru/claim', attachment:'refund-form.exe', threat:true, clue:'Suspicious domain, urgency, HTTP link, password request, executable file।'},
    {from:'Microsoft 365 <security@micros0ft-login.com>', subject:'Mailbox storage भरियो', preview:'तपाईंको email storage भरियो। Deletion रोक्न तुरुन्त password verify गर्नुहोस्।', url:'http://micros0ft-login.com/verify', attachment:'छैन', threat:true, clue:'Brand domain misspelled छ, HTTP link छ, password माग्छ।'},
    {from:'Library Services <library@coventry.ac.uk>', subject:'Book renewal reminder', preview:'लिएको किताब छिट्टै due छ। Renew गर्न university library page बाट login गर्नुहोस्।', url:'https://library.coventry.ac.uk/account', attachment:'छैन', threat:false, clue:'Trusted domain र सामान्य जानकारी, pressure छैन।'},
    {from:'Instagram Security <support@insta-login-help.xyz>', subject:'कसैले तपाईंको account report गर्यो', preview:'तपाईंको account २ घण्टामा delete हुनेछ। Username र password अहिले confirm गर्नुहोस्।', url:'http://insta-login-help.xyz/appeal', attachment:'account_review.zip', threat:true, clue:'Fake domain, threatening message, credential request, zipped attachment।'},
    {from:'HR Portal <jobs@coventry-careers.ac.uk>', subject:'Placement workshop reminder', preview:'Reminder: तपाईंको cyber placement workshop भोलि छ। Reschedule गर्न normal student portal प्रयोग गर्नुहोस्।', url:'https://careers.coventry.ac.uk/events', attachment:'calendar.ics', threat:false, clue:'Relevant service, official domain, harmless calendar file, credential pressure छैन।'},
    {from:'Delivery Notice <tracking@royalmail-redelivery.help>', subject:'छुटेको parcel - अहिले £1.99 तिर्नुहोस्', preview:'तपाईंको parcel hold मा छ। Return हुन नदिन redelivery charge तुरुन्त तिर्नुहोस्।', url:'http://royalmail-redelivery.help/pay', attachment:'invoice.zip', threat:true, clue:'Fake delivery domain, urgent payment demand, risky zip attachment।'}],
  attackScenarios:[
    {title:'Unknown File Executing', alert:'download_update.exe administrator permission माग्दैछ।', choices:[{text:'File run गर्नुहोस्', safe:false, feedback:'Unsafe। Unknown executables ले malware install गर्न सक्छ।'},{text:'Scan and quarantine गर्नुहोस्', safe:true, feedback:'Correct। Quarantine ले possible malware रोक्छ।'},{text:'Warning ignore गर्नुहोस्', safe:false, feedback:'Unsafe। Alerts ignore गर्दा infection जारी रहन्छ।'}]},
    {title:'MFA Push Bombing', alert:'तपाईंले sign in नगर्दा पनि 7 login approval requests आयो।', choices:[{text:'एउटा request approve गर्नुहोस्', safe:false, feedback:'Unsafe। Unexpected MFA prompts approve नगर्नुहोस्।'},{text:'Request deny गरेर password reset गर्नुहोस्', safe:true, feedback:'Correct। Deny, password reset र report गर्नुहोस्।'},{text:'MFA off गर्नुहोस्', safe:false, feedback:'Unsafe। MFA stolen passwords बाट बचाउँछ।'}]},
    {title:'Data Exfiltration Alert', alert:'Hidden process ले files unknown external server मा पठाउँदैछ।', choices:[{text:'Device network बाट disconnect गर्नुहोस्', safe:true, feedback:'Correct। Isolation ले data loss सीमित गर्छ।'},{text:'Alert window बन्द गर्नुहोस्', safe:false, feedback:'Unsafe। Alert बन्द गर्दा data theft रोकिँदैन।'},{text:'Backup folder upload गर्नुहोस्', safe:false, feedback:'Unsafe। थप files चोरी हुन सक्छन्।'}]},
    {title:'Fake Browser Update', alert:'Popup भन्छ: continue गर्न SecureBrowser_Update_now.zip install गर्नुहोस्।', choices:[{text:'Download and install गर्नुहोस्', safe:false, feedback:'Unsafe। Fake updates malware tricks हुन्।'},{text:'Popup बन्द गरेर official settings बाट update गर्नुहोस्', safe:true, feedback:'Correct। Trusted sources बाट मात्र update गर्नुहोस्।'},{text:'Link friends लाई share गर्नुहोस्', safe:false, feedback:'Unsafe। यसले attack फैलाउँछ।'}]}],
  randomEvents:[
    {title:'Suspicious USB Detected', alert:'नयाँ USB device ले autorun.inf run गर्न खोज्दैछ।', safeText:'USB block गरेर scan गर्नुहोस्', unsafeText:'Files अहिले खोल्नुहोस्', feedback:'USB devices ले autorun malware ल्याउन सक्छ। पहिला block र scan गर्नुहोस्।'},
    {title:'Ransomware Note Appears', alert:'Window ले files encrypted छन् र payment माग्छ।', safeText:'Disconnect गरेर incident report गर्नुहोस्', unsafeText:'तुरुन्त pay गर्नुहोस्', feedback:'Disconnect ले spread कम गर्छ; report ले incident response सुरु गर्छ।'},
    {title:'Clipboard Hijack Warning', alert:'Copied bank details अचानक change भयो।', safeText:'Transaction रोक्नुहोस् र verify गर्नुहोस्', unsafeText:'त्यसै paste गर्नुहोस्', feedback:'Clipboard hijacking ले payment details replace गर्न सक्छ।'},
    {title:'Unexpected Admin Login', alert:'अर्को देशबाट admin login detected भयो।', safeText:'Session revoke गरेर password reset गर्नुहोस्', unsafeText:'Alert ignore गर्नुहोस्', feedback:'Unexpected sessions revoke र investigate गर्नुपर्छ।'}],
  passwordChallenges:[
    {prompt:'Student portal का लागि सबैभन्दा safe password छान्नुहोस्।', options:[{text:'prashanna123', safe:false, reason:'Name र common numbers प्रयोग भएको छ।'},{text:'Coventry2026', safe:false, reason:'Predictable word plus year हो।'},{text:'R!ver-Cloud7-Mango#92', safe:true, reason:'Long, mixed र guess गर्न गाह्रो छ।'}]},
    {prompt:'तपाईंको password leak भयो। पहिले के गर्नुपर्छ?', options:[{text:'त्यही password reuse गरेर अन्त्यमा 1 थप्नुहोस्', safe:false, reason:'Small changes guess गर्न सजिलो हुन्छ।'},{text:'Unique password बनाउनुहोस् र MFA enable गर्नुहोस्', safe:true, reason:'Unique password plus MFA ले account takeover risk घटाउँछ।'},{text:'Ignore गर्नुहोस् किनकि एक site मात्र leak भयो', safe:false, reason:'Attackers leaked passwords धेरै sites मा try गर्छन्।'}]},
    {prompt:'कुन password habit सबैभन्दा secure हो?', options:[{text:'सबैतिर एउटै strong password प्रयोग गर्नुहोस्', safe:false, reason:'एक breach ले सबै accounts expose गर्न सक्छ।'},{text:'Passwords plain notes मा राख्नुहोस्', safe:false, reason:'Plain notes expose हुन सक्छ।'},{text:'Password manager र unique passwords प्रयोग गर्नुहोस्', safe:true, reason:'यसले security र usability सुधार्छ।'}]}],
  mazeNodes:[{name:'Downloads Folder', icon:'📁', threat:'trojan.exe', safeMove:'File quarantine गर्नुहोस्'}, {name:'Browser Cache', icon:'🌐', threat:'fake update script', safeMove:'Suspicious cache clear गर्नुहोस्'}, {name:'USB Drive', icon:'💾', threat:'autorun malware', safeMove:'Autorun disable गरेर scan गर्नुहोस्'}, {name:'Startup Apps', icon:'⚙️', threat:'unknown startup process', safeMove:'Disable गरेर investigate गर्नुहोस्'}, {name:'Network Port', icon:'📡', threat:'unknown outgoing traffic', safeMove:'Connection block गर्नुहोस्'}],
  recoveryTasks:[{task:'Admin accounts का लागि MFA enable गर्नुहोस्', correct:true, lesson:'MFA ले passwords leak भए पनि accounts protect गर्छ।'}, {task:'Space बचाउन backups delete गर्नुहोस्', correct:false, lesson:'Backups ले ransomware वा data loss पछि recovery मा मद्दत गर्छ।'}, {task:'Suspicious email sender/domain block गर्नुहोस्', correct:true, lesson:'Known phishing sources block गर्दा future exposure कम हुन्छ।'}, {task:'Admin password group chat मा share गर्नुहोस्', correct:false, lesson:'Passwords insecure तरिकाले share गर्नु हुँदैन।'}, {task:'Malware removal पछि clean backup restore गर्नुहोस्', correct:true, lesson:'Clean backups ले safe recovery support गर्छ।'}, {task:'Incident evidence र actions document गर्नुहोस्', correct:true, lesson:'Incident records ले learning र accountability support गर्छ।'}]
});



// Extra home-screen interactive feature translations
Object.assign(LANG.en, {
  featureHackerTitle: 'Hacker Access',
  featureHackerDesc: 'Shows how close the hacker is to taking over the system. Wrong actions increase it; correct actions reduce it.',
  featureComboTitle: 'Combo System',
  featureComboDesc: 'Get 3 correct answers in a row to activate Firewall Boost and reduce hacker access by 10%.',
  featurePopupTitle: 'Random Popups',
  featurePopupDesc: 'Unexpected simulated cyber attacks can appear during missions, making the game feel alive and realistic.',
  projectTabTitle: 'Project Explanation',
  projectTabDesc: 'Phish Escape is an adaptive cyber-security investigation game. Players learn to identify phishing, respond to simulated attacks, protect passwords, stop malware, and recover a compromised system through interactive missions.',
  projectTabPoint1: 'Target audience: teenagers and college students.',
  projectTabPoint2: 'Main learning topics: phishing, MFA, passwords, malware, backups, and incident response.',
  projectTabPoint3: 'Game value: replayable scenarios, timers, feedback, badges, and final learning report.',
  clickFeature: 'Click feature cards for details. Click the fish logo for project explanation.'
});
Object.assign(LANG.hi, {
  featureHackerTitle: 'हैकर एक्सेस',
  featureHackerDesc: 'यह दिखाता है कि हैकर सिस्टम takeover के कितना करीब है। गलत actions इसे बढ़ाते हैं और सही actions इसे घटाते हैं।',
  featureComboTitle: 'कॉम्बो सिस्टम',
  featureComboDesc: 'लगातार 3 सही जवाब देने पर Firewall Boost activate होता है और hacker access 10% कम होता है।',
  featurePopupTitle: 'अचानक पॉपअप',
  featurePopupDesc: 'Mission के दौरान simulated cyber attacks अचानक दिख सकते हैं, जिससे game ज्यादा realistic लगता है।',
  projectTabTitle: 'Project Explanation',
  projectTabDesc: 'Phish Escape एक adaptive cyber-security investigation game है। Players phishing पहचानना, simulated attacks का जवाब देना, passwords protect करना, malware रोकना और compromised system recover करना सीखते हैं।',
  projectTabPoint1: 'Target audience: teenagers और college students।',
  projectTabPoint2: 'Main learning topics: phishing, MFA, passwords, malware, backups और incident response।',
  projectTabPoint3: 'Game value: replayable scenarios, timers, feedback, badges और final learning report।',
  clickFeature: 'Feature cards पर click करें। Fish logo पर click करके project explanation देखें।'
});
Object.assign(LANG.ne, {
  featureHackerTitle: 'ह्याकर पहुँच',
  featureHackerDesc: 'यसले hacker system takeover गर्न कति नजिक छ भनेर देखाउँछ। गलत actions ले बढाउँछ, सही actions ले घटाउँछ।',
  featureComboTitle: 'Combo System',
  featureComboDesc: 'लगातार ३ सही उत्तर दिएपछि Firewall Boost activate हुन्छ र hacker access 10% घट्छ।',
  featurePopupTitle: 'अचानक Popups',
  featurePopupDesc: 'Mission चल्दा simulated cyber attacks अचानक आउन सक्छन्, जसले game लाई realistic बनाउँछ।',
  projectTabTitle: 'Project Explanation',
  projectTabDesc: 'Phish Escape एउटा adaptive cyber-security investigation game हो। Players ले phishing चिन्ने, simulated attacks respond गर्ने, passwords protect गर्ने, malware रोक्ने र compromised system recover गर्ने सिक्छन्।',
  projectTabPoint1: 'Target audience: teenagers र college students।',
  projectTabPoint2: 'Main learning topics: phishing, MFA, passwords, malware, backups र incident response।',
  projectTabPoint3: 'Game value: replayable scenarios, timers, feedback, badges र final learning report।',
  clickFeature: 'Feature cards click गर्नुहोस्। Fish logo click गरेर project explanation हेर्नुहोस्।'
});

function T(key) { return LANG[game?.language || 'en'][key] ?? LANG.en[key] ?? key; }
function D() { return LANG[game?.language || 'en']; }
function languageSelector() {
  return `<select class="language-select" onchange="setLanguage(this.value)"><option value="en" ${game.language==='en'?'selected':''}>English</option><option value="hi" ${game.language==='hi'?'selected':''}>हिन्दी</option><option value="ne" ${game.language==='ne'?'selected':''}>नेपाली</option></select>`;
}
function setLanguage(lang) {
  game.language = lang;
  localStorage.setItem('phish_escape_lang', lang);
  clearGameTimer();
  if (game.phase === 'menu') showMenu();
  else rerenderCurrentMission();
}
function modeText() { return T('modes')[game.difficulty] || game.difficulty; }


function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

function boot() { showMenu(); }

function resetGame() {
  clearGameTimer();
  const selectedLanguage = game.language;
  const soundMuted = game.muted;
  game = stateTemplate();
  game.language = selectedLanguage;
  game.muted = soundMuted;
  currentInbox = 0; currentAttack = 0; currentPassword = 0; currentMaze = 0; currentRecovery = 0;
  pendingNextAction = null; randomAttackActive = false; lastRandomEventAt = -1; currentMazeOptions = []; currentMazeQuestionKey = ''; currentPasswordOptions = []; currentPasswordQuestionKey = '';
  showMissionBrief();
}

function awardBadge(key) {
  const name = T('badgesNames')[key] || key;
  if (!game.badges.includes(name)) game.badges.push(name);
}

function playSound(type) {
  if (game?.muted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const tones = { success: 720, fail: 180, alert: 120, click: 520, combo: 980, type: 360 };
    osc.frequency.value = tones[type] || 440;
    osc.type = type === 'alert' || type === 'fail' ? 'sawtooth' : 'sine';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.24);
  } catch (e) {}
}



function stopSpeech() {
  try { window.speechSynthesis.cancel(); } catch (e) {}
}

function speechLangCode() {
  if (game.language === 'hi') return 'hi-IN';
  if (game.language === 'ne') return 'ne-NP';
  return 'en-GB';
}

function speakText(text) {
  if (game?.muted || !text || !('speechSynthesis' in window)) return;
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(String(text).replace(/<[^>]*>/g, ' '));
  utterance.lang = speechLangCode();
  utterance.rate = 1.35;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function shuffleArrayCopy(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getCurrentQuestionSpeech() {
  const d = D();
  const optionsWord = game.language === 'en' ? 'Options' : game.language === 'hi' ? 'विकल्प' : 'विकल्पहरू';

  if (game.level === 1 && d.inboxScenarios?.[currentInbox]) {
    const email = d.inboxScenarios[currentInbox];
    return `${d.inboxTitle}. ${d.from} ${email.from}. ${d.subject} ${email.subject}. ${email.preview}. ${optionsWord}: ${d.markPhishing}. ${d.markSafe}.`;
  }

  if (game.level === 2 && d.attackScenarios?.[currentAttack]) {
    const atk = d.attackScenarios[currentAttack];
    return `${d.liveAttack}. ${atk.title}. ${atk.alert}. ${optionsWord}: ${atk.choices.map(c => c.text).join('. ')}.`;
  }

  if (game.level === 3 && d.passwordChallenges?.[currentPassword]) {
    const q = d.passwordChallenges[currentPassword];
    const speechOptions = currentPasswordOptions && currentPasswordOptions.length ? currentPasswordOptions : q.options;
    return `${d.passwordTitle}. ${q.prompt}. ${optionsWord}: ${speechOptions.map(o => o.text).join('. ')}.`;
  }

  if (game.level === 4 && d.mazeNodes?.[currentMaze]) {
    const node = d.mazeNodes[currentMaze];
    const speechOptions = currentMazeOptions && currentMazeOptions.length ? currentMazeOptions : buildMazeOptions(node);
    return `${d.mazeTitle}. ${node.name}. ${d.detectedThreat} ${node.threat}. ${optionsWord}: ${speechOptions.map(o => o.text).join('. ')}.`;
  }

  if (game.level === 5 && d.recoveryTasks?.[currentRecovery]) {
    const task = d.recoveryTasks[currentRecovery];
    return `${d.recoveryTitle}. ${task.task}. ${optionsWord}: ${d.approve}. ${d.reject}.`;
  }

  return '';
}

function readCurrentQuestion() {
  speakText(getCurrentQuestionSpeech());
}

function autoReadCurrentQuestion() {
  setTimeout(readCurrentQuestion, 250);
}

function toggleSound() { game.muted = !game.muted; stopSpeech(); if (!game.muted) readCurrentQuestion(); refreshHudOnly(); }
function refreshHudOnly() { const hudEl = document.querySelector('.hud-area'); if (hudEl) hudEl.innerHTML = hud(); }

function applyResult(correct, label, lesson, options = {}) {
  clearGameTimer();
  if (correct) {
    game.score += options.random ? 80 : 120;
    game.xp += options.random ? 35 : 50;
    game.breach = Math.max(0, game.breach - 5);
    game.streak += 1;
    game.evidence.push('✅ ' + label);
    if (lesson) game.learned.push(lesson);
    playSound('success');
    if (game.streak > 0 && game.streak % 3 === 0) {
      game.breach = Math.max(0, game.breach - 10);
      game.score += 75;
      game.xp += 25;
      game.evidence.push(T('evidenceCombo'));
      awardBadge('combo');
      playSound('combo');
    }
  } else {
    game.lives -= options.noLifeLoss ? 0 : 1;
    game.breach = Math.min(100, game.breach + 15);
    game.streak = 0;
    game.mistakes.push('❌ ' + label);
    if (lesson) game.learned.push(lesson);
    playSound('fail');
  }
  game.difficulty = game.score > 1000 ? 'hard' : game.lives <= 1 ? 'support' : 'normal';
  if (game.randomEventsSolved >= 2) awardBadge('rapid');
  if (game.timeouts >= 2) game.difficulty = 'pressure';
  if (game.score >= 300) awardBadge('threat');
  if (game.score >= 650) awardBadge('defender');
  if (game.breach <= 15) awardBadge('breach');
  if (game.lives <= 0 || game.breach >= 100) { showGameOver(); return false; }
  return true;
}

function getGenericHint() {
  if (game.language === 'hi') return 'ऐसा विकल्प चुनें जो जोखिम कम करे, आधिकारिक स्रोतों का उपयोग करे, और संदिग्ध गतिविधि को रोके।';
  if (game.language === 'ne') return 'जोखिम घटाउने, official source प्रयोग गर्ने, र suspicious activity रोक्ने विकल्प छान्नुहोस्।';
  return 'Choose the option that reduces risk, uses official sources, and stops suspicious activity.';
}

function useHint(text) {
  clearGameTimer();
  game.hintsUsed += 1;
  game.breach = Math.min(100, game.breach + 5);
  game.streak = 0;
  playSound('alert');
  if (game.breach >= 100) { showGameOver(); return; }
  showFeedback(false, `${T('hintUsed')} ${text}`, () => rerenderCurrentMission(), { noPenaltyTitle: T('hintUsedTitle') });
}

function hud() {
  return `<div class="hud">
    <div>${T('mission')} ${game.level}/5</div><div>${T('score')}: ${game.score}</div><div>XP: ${game.xp}</div><div>${T('lives')}: ${'❤'.repeat(game.lives)}${'♡'.repeat(Math.max(0,5-game.lives))}</div><div>${T('streak')}: ${game.streak}</div><div>${T('mode')}: ${modeText()}</div><div><button class="sound-btn" onclick="toggleSound()">${game.muted ? T('soundOff') : T('soundOn')}</button></div><div>${T('language')}: ${languageSelector()}</div>
  </div><div class="breach-box"><div class="breach-label"><span>${T('hackerAccess')}</span><span>${game.breach}%</span></div><div class="breach-bar"><span style="width:${game.breach}%"></span></div></div><div class="timer-box"><span>${T('responseTimer')}</span><strong id="timer-count">--</strong></div>`;
}

function hackerBox(line = null) {
  const lines = T('hackerLines');
  const chosen = line || lines[Math.floor(Math.random() * lines.length)];
  return `<div class="hacker-box"><span>${T('hackerLabel')}</span> ${chosen}</div>`;
}

function desktopShell(content, activeApp = 'Inbox') {
  const appNames = T('apps');
  const appList = ['Inbox', 'Browser', 'Files', 'Terminal', 'Security'];
  return `<div class="desktop"><div class="desktop-top"><span>VOID OS // Cyber Training Desktop</span><span>${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div><div class="desktop-body"><aside class="desktop-dock">${appList.map(app => `<div class="dock-icon ${activeApp===app?'active':''}">${app==='Inbox'?'📧':app==='Browser'?'🌐':app==='Files'?'📁':app==='Terminal'?'⌨️':'🛡️'}<small>${appNames[app]}</small></div>`).join('')}</aside><main class="desktop-window"><div class="window-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span><b>${appNames[activeApp] || activeApp}</b></div><div class="window-content">${content}</div></main></div></div>`;
}

function startTimer(seconds, onTimeout) {
  clearGameTimer();
  timeLeft = seconds;
  updateTimerDisplay();
  activeTimer = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 5 && timeLeft > 0) playSound('type');
    if (timeLeft <= 0) { clearGameTimer(); game.timeouts += 1; onTimeout(); }
  }, 1000);
}
function clearGameTimer() { if (activeTimer) clearInterval(activeTimer); activeTimer = null; stopSpeech(); }
function updateTimerDisplay() { const el = document.getElementById('timer-count'); if (el) el.textContent = timeLeft > 0 ? `${timeLeft}s` : '--'; }

function maybeRandomAttack() {
  if (randomAttackActive || game.phase === 'menu' || game.level <= 0 || game.level >= 6) return;
  const positionKey = `${game.level}-${currentInbox}-${currentPassword}-${currentMaze}-${currentRecovery}-${currentAttack}`;
  if (lastRandomEventAt === positionKey) return;
  if (Math.random() < 0.22) { lastRandomEventAt = positionKey; setTimeout(showRandomAttackPopup, 650); }
}

function showRandomAttackPopup() {
  if (document.querySelector('.modal') || randomAttackActive) return;
  randomAttackActive = true;
  clearGameTimer();
  playSound('alert');
  const events = T('randomEvents');
  const event = events[Math.floor(Math.random() * events.length)];
  const modal = document.createElement('div');
  modal.className = 'modal random-modal';
  const popupChoices = [
    { correct: true, text: event.safeText },
    { correct: false, text: event.unsafeText }
  ].sort(() => Math.random() - 0.5);
  modal.innerHTML = `<div class="modal-card fail random-card"><div class="blink">${T('randomPopup')}</div><h2>${event.title}</h2><p>${event.alert}</p><div class="mini-timer">${T('randomMini')}</div><div class="actions vertical">${popupChoices.map(choice => `<button class="random-option-btn" onclick="answerRandomAttack(${choice.correct}, '${escapeText(event.feedback)}')">${choice.text}</button>`).join('')}</div></div>`;
  screen.appendChild(modal);
  startTimer(TIMER_SECONDS, () => answerRandomAttack(false, event.feedback, true));
  speakText(`${T('randomPopup')}. ${event.title}. ${event.alert}. ${event.safeText}. ${event.unsafeText}.`);
}

function escapeText(str) { return String(str).replace(/'/g, "&#39;").replace(/"/g, '&quot;'); }

function answerRandomAttack(correct, feedback, timeout = false) {
  const modal = document.querySelector('.random-modal');
  if (modal) modal.remove();
  randomAttackActive = false;
  if (correct) game.randomEventsSolved += 1;
  const alive = applyResult(correct, timeout ? T('labels').randomTimeout : T('labels').randomResponse, feedback, { random: true });
  if (!alive) return;
  showFeedback(correct, timeout ? `${T('timeExpired')} ${feedback}` : feedback, () => rerenderCurrentMission());
}

function rerenderCurrentMission() {
  if (game.level === 1) showInbox();
  else if (game.level === 2) showAttack();
  else if (game.level === 3) showPassword();
  else if (game.level === 4) showMaze();
  else if (game.level === 5) showRecovery();
  else if (game.level === 6) showFinalReport();
  else showMissionBrief();
}

function showMenu() {
  clearGameTimer();
  game.phase = 'menu';
  screen.innerHTML = `<div class="landing-page"><nav class="landing-nav"><div class="brand"><span class="brand-icon">🛡️</span><div><div class="brand-title">PHISH ESCAPE</div><div class="brand-sub">${T('brandSub')}</div></div></div><div class="nav-links"><span onclick="showMenu()">${T('navHome')}</span><span onclick="showMissionsPreview()">${T('navMissions')}</span><span onclick="showDesktopPreview()">${T('navDesktop')}</span><span onclick="showReportPreview()">${T('navReport')}</span><span>${T('language')}: ${languageSelector()}</span></div></nav><section class="hero-section"><div class="hero-left"><div class="mission-tag">${T('missionTag')}</div><h1 class="hero-title">${T('heroLine1')}<br><span>${T('heroLine2')}</span></h1><p class="hero-text">${T('heroText')}</p><button class="hero-btn" onclick="resetGame()">${T('start')}</button><button class="ghost-btn" onclick="showInstructions()">${T('how')}</button><button class="ghost-btn" onclick="enterFullscreen()">⛶ FULLSCREEN</button></div><div class="hero-right"><button class="cyber-orb orb-click" onclick="openProjectAnimation()" title="${T('projectTabTitle')}">🎣</button><button class="floating-card card-one feature-chip" onclick="showFeatureInfo('hacker')">${T('hackerAccess')}</button><button class="floating-card card-two feature-chip" onclick="showFeatureInfo('combo')">${T('comboSystem')}</button><button class="floating-card card-three feature-chip" onclick="showFeatureInfo('popup')">${T('randomPopups')}</button><div id="hero-feature-info" class="hero-feature-info"><span>${T('clickFeature')}</span></div></div></section><section class="mission-steps"><h2>${T('addonTitle')}</h2><div class="steps-grid"><div class="step-card"><div class="step-icon">🖥️</div><h3>${T('fakeDesktop')}</h3><p>${T('fakeDesktopText')}</p></div><div class="step-card"><div class="step-icon">⏱️</div><h3>${T('timer30')}</h3><p>${T('timer30Text')}</p></div><div class="step-card"><div class="step-icon">🔥</div><h3>${T('comboSystem')}</h3><p>${T('comboText')}</p></div><div class="step-card"><div class="step-icon">⚡</div><h3>${T('randomPopups')}</h3><p>${T('randomPopupsText')}</p></div><div class="step-card"><div class="step-icon">🔊</div><h3>${T('soundFx')}</h3><p>${T('soundFxText')}</p></div><div class="step-card"><div class="step-icon">🏆</div><h3>${T('finalRanking')}</h3><p>${T('finalRankingText')}</p></div></div></section><footer class="landing-footer">${T('footer')}</footer></div>`;
}

function showInstructions() {
  clearGameTimer();
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}<div class="panel wide"><h2>${T('howTitle')}</h2><p>${T('howP1')}</p><p class="language-note">${T('rules')}</p><div class="mini-grid"><div><b>${T('correctAction')}</b><br>${T('correctActionText')}</div><div><b>${T('wrongAction')}</b><br>${T('wrongActionText')}</div><div><b>${T('threeStreak')}</b><br>${T('threeStreakText')}</div><div><b>${T('hintRule')}</b><br>${T('hintRuleText')}</div></div><button class="primary" onclick="showMenu()">${T('back')}</button></div></div>`;
}

function showMissionBrief() {
  game.level = 0;
  const missions = T('missions').map(m => `<li>${m}</li>`).join('');
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}<div class="panel wide briefing"><h2>${T('briefingTitle')}</h2><p><b>${T('scenario')}</b> ${T('scenarioText')}</p><ul>${missions}</ul><button class="primary" onclick="showInbox()">${T('beginInvestigation')}</button></div></div>`;
}

function showInbox() {
  game.phase = 'playing'; game.level = 1;
  const email = T('inboxScenarios')[currentInbox];
  const content = `<h2>${T('inboxTitle')}</h2><div class="email-card"><div><b>${T('from')}</b> ${email.from}</div><div><b>${T('subject')}</b> ${email.subject}</div><p>${email.preview}</p><div class="url-box">🔗 ${email.url}</div><div class="attach">📎 ${T('attachment')} ${email.attachment}</div></div><div class="actions"><button onclick="answerInbox(true)">${T('markPhishing')}</button><button onclick="answerInbox(false)">${T('markSafe')}</button><button onclick="useHint('${escapeText(email.clue)}')">${T('hint')}</button></div><p class="small">${T('emailWord')} ${currentInbox + 1} ${T('of')} ${T('inboxScenarios').length}</p>`;
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Inbox')}</div>`;
  startTimer(TIMER_SECONDS, () => answerInbox(null, true));
  autoReadCurrentQuestion();
  maybeRandomAttack();
}

function answerInbox(markThreat, timeout = false) {
  const email = T('inboxScenarios')[currentInbox];
  const correct = timeout ? false : markThreat === email.threat;
  const label = timeout ? `${email.subject} — ${T('timeExpired')}` : `${email.subject} — ${correct ? T('labels').correctly : T('labels').misclassified}`;
  const alive = applyResult(correct, label, timeout ? T('timeoutJudgement') : email.clue);
  if (!alive) return;
  showFeedback(correct, timeout ? `${T('timeExpired')} ${email.clue}` : email.clue, () => { currentInbox++; if (currentInbox >= T('inboxScenarios').length) { awardBadge('inbox'); showAttack(); } else showInbox(); });
}

function showAttack() {
  game.phase = 'playing'; game.level = 2;
  const atk = T('attackScenarios')[currentAttack];
  const content = `<div class="attack-popup in-desktop"><div class="blink">${T('liveAttack')}</div><h2>${atk.title}</h2><p>${atk.alert}</p><div class="actions vertical">${atk.choices.map((c,i)=>`<button onclick="answerAttack(${i})">${c.text}</button>`).join('')}<button onclick="useHint('${escapeText(getGenericHint())}')">${T('hint')}</button></div><p class="small">${T('attackWord')} ${currentAttack + 1} ${T('of')} ${T('attackScenarios').length}</p></div>`;
  screen.innerHTML = `<div class="game-screen danger-bg"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Security')}</div>`;
  playSound('alert');
  startTimer(TIMER_SECONDS, () => answerAttack(-1, true));
  autoReadCurrentQuestion();
}

function answerAttack(i, timeout = false) {
  const atk = T('attackScenarios')[currentAttack];
  const choice = timeout ? { text: T('labels').noResponse, safe: false, feedback: T('timeoutAttack') } : atk.choices[i];
  game.attackLog.push(`${atk.title}: ${choice.text}`);
  const alive = applyResult(choice.safe, `${atk.title} ${T('labels').response} ${choice.text}`, choice.feedback);
  if (!alive) return;
  showFeedback(choice.safe, choice.feedback, () => { currentAttack++; if (currentAttack >= T('attackScenarios').length) { awardBadge('attack'); showPassword(); } else showAttack(); });
}

function showPassword() {
  game.phase = 'playing'; game.level = 3;
  const q = T('passwordChallenges')[currentPassword];
  const key = `${game.language}-${currentPassword}`;
  if (currentPasswordQuestionKey !== key || !currentPasswordOptions.length) {
    currentPasswordQuestionKey = key;
    currentPasswordOptions = shuffleArrayCopy(q.options);
  }
  const content = `<div class="terminal"><h2>${T('passwordTitle')}</h2><p>${q.prompt}</p><div class="actions vertical">${currentPasswordOptions.map((o,i)=>`<button onclick="answerPassword(${i})">${o.text}</button>`).join('')}<button onclick="useHint('${escapeText(getGenericHint())}')">${T('hint')}</button></div><p class="small">${T('challengeWord')} ${currentPassword + 1} ${T('of')} ${T('passwordChallenges').length}</p></div>`;
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Terminal')}</div>`;
  startTimer(TIMER_SECONDS, () => answerPassword(-1, true));
  autoReadCurrentQuestion();
  maybeRandomAttack();
}

function answerPassword(i, timeout = false) {
  const opt = timeout ? { text: T('labels').noResponse, safe: false, reason: T('timeoutPassword') } : currentPasswordOptions[i];
  const alive = applyResult(opt.safe, `${T('passwordTitle')}: ${opt.text}`, opt.reason);
  if (!alive) return;
  showFeedback(opt.safe, opt.reason, () => {
    currentPassword++;
    currentPasswordOptions = [];
    currentPasswordQuestionKey = '';
    if (currentPassword >= T('passwordChallenges').length) { awardBadge('password'); showMaze(); } else showPassword();
  });
}


function getMazeTrapOptions(node) {
  const lang = game.language;
  const packs = {
    en: {
      Downloads: [
        { text: 'Open the file in normal mode to check it', safe: false, reason: 'Unsafe. Suspicious executables should not be opened directly.' },
        { text: 'Upload the file to a random online cleaner', safe: false, reason: 'Unsafe. Unknown cleaners can expose files or install malware.' }
      ],
      Browser: [
        { text: 'Install the browser optimizer suggested by the popup', safe: false, reason: 'Unsafe. Popups offering cleaner tools are often malware.' },
        { text: 'Disable browser protection temporarily', safe: false, reason: 'Unsafe. Disabling protection increases risk.' }
      ],
      USB: [
        { text: 'Open the USB files to identify the owner', safe: false, reason: 'Unsafe. Unknown USB files may trigger malware.' },
        { text: 'Copy important files before scanning', safe: false, reason: 'Unsafe. Copying files can spread infection.' }
      ],
      Startup: [
        { text: 'Allow the process because it starts automatically', safe: false, reason: 'Unsafe. Unknown startup apps must be investigated.' },
        { text: 'Rename the process and leave it running', safe: false, reason: 'Unsafe. Renaming does not remove the threat.' }
      ],
      Network: [
        { text: 'Allow the traffic to avoid breaking the internet', safe: false, reason: 'Unsafe. Unknown outgoing traffic can indicate data theft.' },
        { text: 'Send a test file to confirm the connection', safe: false, reason: 'Unsafe. Sending files may increase data loss.' }
      ]
    },
    hi: {
      Downloads: [
        { text: 'फाइल को normal mode में खोलकर check करें', safe: false, reason: 'असुरक्षित। संदिग्ध executable को directly open नहीं करना चाहिए।' },
        { text: 'फाइल को random online cleaner पर upload करें', safe: false, reason: 'असुरक्षित। Unknown cleaner files expose कर सकता है।' }
      ],
      Browser: [
        { text: 'Popup वाला browser optimizer install करें', safe: false, reason: 'असुरक्षित। Popup cleaners अक्सर malware होते हैं।' },
        { text: 'Browser protection temporarily disable करें', safe: false, reason: 'असुरक्षित। Protection बंद करने से risk बढ़ता है।' }
      ],
      USB: [
        { text: 'Owner पहचानने के लिए USB files खोलें', safe: false, reason: 'असुरक्षित। Unknown USB files malware चला सकती हैं।' },
        { text: 'Scan से पहले important files copy करें', safe: false, reason: 'असुरक्षित। Copy करने से infection फैल सकता है।' }
      ],
      Startup: [
        { text: 'Process को allow करें क्योंकि यह automatically start होता है', safe: false, reason: 'असुरक्षित। Unknown startup apps investigate करने चाहिए।' },
        { text: 'Process rename करके running रहने दें', safe: false, reason: 'असुरक्षित। Rename करने से threat remove नहीं होता।' }
      ],
      Network: [
        { text: 'Internet break न हो इसलिए traffic allow करें', safe: false, reason: 'असुरक्षित। Unknown outgoing traffic data theft हो सकता है।' },
        { text: 'Connection confirm करने के लिए test file भेजें', safe: false, reason: 'असुरक्षित। File send करने से data loss बढ़ सकता है।' }
      ]
    },
    ne: {
      Downloads: [
        { text: 'File normal mode मा खोलेर check गर्नुहोस्', safe: false, reason: 'Unsafe। Suspicious executable direct open गर्नु हुँदैन।' },
        { text: 'File random online cleaner मा upload गर्नुहोस्', safe: false, reason: 'Unsafe। Unknown cleaner ले files expose गर्न सक्छ।' }
      ],
      Browser: [
        { text: 'Popup ले भनेको browser optimizer install गर्नुहोस्', safe: false, reason: 'Unsafe। Popup cleaners प्राय malware हुन सक्छन्।' },
        { text: 'Browser protection temporarily disable गर्नुहोस्', safe: false, reason: 'Unsafe। Protection off गर्दा risk बढ्छ।' }
      ],
      USB: [
        { text: 'Owner identify गर्न USB files खोल्नुहोस्', safe: false, reason: 'Unsafe। Unknown USB files ले malware trigger गर्न सक्छ।' },
        { text: 'Scan गर्नु अघि important files copy गर्नुहोस्', safe: false, reason: 'Unsafe। Copy गर्दा infection फैलिन सक्छ।' }
      ],
      Startup: [
        { text: 'Automatically start हुन्छ भनेर process allow गर्नुहोस्', safe: false, reason: 'Unsafe। Unknown startup apps investigate गर्नुपर्छ।' },
        { text: 'Process rename गरेर running छोड्नुहोस्', safe: false, reason: 'Unsafe। Rename गर्दा threat हट्दैन।' }
      ],
      Network: [
        { text: 'Internet नबिग्रियोस् भनेर traffic allow गर्नुहोस्', safe: false, reason: 'Unsafe। Unknown outgoing traffic data theft हुन सक्छ।' },
        { text: 'Connection confirm गर्न test file पठाउनुहोस्', safe: false, reason: 'Unsafe। File पठाउँदा data loss बढ्न सक्छ।' }
      ]
    }
  };
  const key = node.name.includes('Downloads') ? 'Downloads' : node.name.includes('Browser') ? 'Browser' : node.name.includes('USB') ? 'USB' : node.name.includes('Startup') ? 'Startup' : 'Network';
  return (packs[lang] || packs.en)[key];
}

function buildMazeOptions(node) {
  const safeOption = {
    text: node.safeMove,
    safe: true,
    reason: `${T('labels').correctContainment}: ${node.name} — ${node.safeMove}.`
  };
  return shuffleArrayCopy([safeOption, ...getMazeTrapOptions(node)]);
}

function showMaze() {
  game.phase = 'playing'; game.level = 4;
  const node = T('mazeNodes')[currentMaze];
  const key = `${game.language}-${currentMaze}`;
  if (currentMazeQuestionKey !== key || !currentMazeOptions.length) {
    currentMazeQuestionKey = key;
    currentMazeOptions = buildMazeOptions(node);
  }
  const content = `<h2>${T('mazeTitle')}</h2><div class="map-grid">${T('mazeNodes').map((n,idx)=>`<div class="map-node ${idx < currentMaze ? 'clean' : idx === currentMaze ? 'active' : ''}"><div>${n.icon}</div><b>${n.name}</b><small>${idx < currentMaze ? T('status').cleaned : idx === currentMaze ? T('status').infected : T('status').locked}</small></div>`).join('')}</div><div class="threat-card"><h3>${node.name}</h3><p>${T('detectedThreat')} <b>${node.threat}</b></p><p>${T('bestResponse')}</p></div><div class="actions">${currentMazeOptions.map((o,i)=>`<button onclick="answerMaze(${i})">${o.text}</button>`).join('')}<button onclick="useHint('${escapeText(getGenericHint())}')">${T('hint')}</button></div><p class="small">${T('nodeWord')} ${currentMaze + 1} ${T('of')} ${T('mazeNodes').length}</p>`;
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Files')}</div>`;
  startTimer(TIMER_SECONDS, () => answerMaze(-1, true));
  autoReadCurrentQuestion();
  maybeRandomAttack();
}

function answerMaze(i, timeout = false) {
  const node = T('mazeNodes')[currentMaze];
  const opt = timeout ? { safe: false, text: T('labels').noResponse, reason: T('timeoutMalware') } : currentMazeOptions[i];
  const correct = !!opt.safe;
  const lesson = opt.reason || (correct ? `${T('labels').correctContainment}: ${node.name} — ${node.safeMove}.` : `${T('labels').wrongContainment}: ${node.name} — ${T('labels').malwareTrusted}`);
  const alive = applyResult(correct && !timeout, `${node.name} containment: ${opt.text}`, lesson);
  if (!alive) return;
  showFeedback(correct && !timeout, lesson, () => {
    currentMaze++;
    currentMazeOptions = [];
    currentMazeQuestionKey = '';
    if (currentMaze >= T('mazeNodes').length) { awardBadge('malware'); showRecovery(); } else showMaze();
  });
}

function showRecovery() {
  game.phase = 'playing'; game.level = 5;
  const task = T('recoveryTasks')[currentRecovery];
  const content = `<h2>${T('recoveryTitle')}</h2><div class="recovery-console"><div class="console-line">${T('systemTask')} ${currentRecovery + 1}</div><h3>${task.task}</h3></div><div class="actions"><button onclick="answerRecovery(true)">${T('approve')}</button><button onclick="answerRecovery(false)">${T('reject')}</button><button onclick="useHint('${escapeText(task.lesson)}')">${T('hint')}</button></div><p class="small">${T('recoveryTaskWord')} ${currentRecovery + 1} ${T('of')} ${T('recoveryTasks').length}</p>`;
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Security')}</div>`;
  startTimer(TIMER_SECONDS, () => answerRecovery(null, true));
  autoReadCurrentQuestion();
  maybeRandomAttack();
}

function answerRecovery(approve, timeout = false) {
  const task = T('recoveryTasks')[currentRecovery];
  const correct = timeout ? false : approve === task.correct;
  const alive = applyResult(correct, timeout ? `${T('labels').recoveryTimeout} ${task.task}` : `${T('labels').recoveryDecision} ${task.task}`, timeout ? T('timeoutRecovery') : task.lesson);
  if (!alive) return;
  showFeedback(correct, timeout ? `${T('timeExpired')} ${task.lesson}` : task.lesson, () => { currentRecovery++; if (currentRecovery >= T('recoveryTasks').length) { awardBadge('incident'); showFinalReport(); } else showRecovery(); });
}

function continueMission() { const fn = pendingNextAction; pendingNextAction = null; if (typeof fn === 'function') fn(); }

function showFeedback(correct, text, nextFn, opts = {}) {
  clearGameTimer();
  pendingNextAction = nextFn;
  const modal = document.createElement('div');
  modal.className = 'modal';
  const title = opts.noPenaltyTitle || (correct ? T('correctResponse') : T('riskIncreased'));
  const combo = game.streak > 0 && game.streak % 3 === 0 && correct ? `<p class="combo-text">${T('comboBoost')}</p>` : '';
  modal.innerHTML = `<div class="modal-card ${correct ? 'success' : 'fail'}"><h2>${title}</h2><p>${text}</p>${combo}<button class="primary" onclick="continueMission()">${T('continueBtn')}</button></div>`;
  screen.appendChild(modal);
}

function getRank() {
  const r = T('ranks');
  if (game.score >= 1500) return r.elite;
  if (game.score >= 1000) return r.defender;
  if (game.score >= 500) return r.junior;
  return r.vulnerable;
}

function showFinalReport() {
  clearGameTimer();
  game.level = 6;
  const rank = getRank();
  screen.innerHTML = `<div class="game-screen report-bg"><div class="hud-area">${hud()}</div><div class="panel wide report"><h2>${T('finalReport')}</h2><h3>${T('finalRank')} ${rank}</h3><div class="rank-scale">${T('rankScale').map(item => `<span>${item}</span>`).join('')}</div><div class="report-grid"><div><b>${T('finalScore')}</b><span>${game.score}</span></div><div><b>XP</b><span>${game.xp}</span></div><div><b>${T('livesLeft')}</b><span>${game.lives}</span></div><div><b>${T('badges')}</b><span>${game.badges.length}</span></div><div><b>${T('hintsUsed')}</b><span>${game.hintsUsed}</span></div><div><b>${T('randomSolved')}</b><span>${game.randomEventsSolved}</span></div><div><b>${T('timeouts')}</b><span>${game.timeouts}</span></div><div><b>${T('finalBreach')}</b><span>${game.breach}%</span></div></div><h3>${T('badgesEarned')}</h3><div class="badges">${game.badges.map(b=>`<span>🎖 ${b}</span>`).join('') || `<span>${T('noBadges')}</span>`}</div><h3>${T('evidenceLog')}</h3><ul class="log">${game.evidence.slice(-10).map(e=>`<li>${e}</li>`).join('')}</ul><h3>${T('learningSummary')}</h3><ul class="log">${[...new Set(game.learned)].slice(0,12).map(l=>`<li>${l}</li>`).join('')}</ul><button class="primary" onclick="resetGame()">${T('replay')}</button><button class="ghost-btn" onclick="showMenu()">${T('mainMenu')}</button></div></div>`;
}

function showGameOver() {
  clearGameTimer();
  screen.innerHTML = `<div class="game-screen danger-bg"><div class="panel wide"><h1>${T('gameOverTitle')}</h1><p>${T('gameOverText')}</p><p>${T('score')}: ${game.score}</p><p>${T('rankAttempt')} ${getRank()}</p><button class="primary" onclick="resetGame()">${T('tryAgain')}</button><button class="ghost-btn" onclick="showMenu()">${T('mainMenu')}</button></div></div>`;
}



function showMissionsPreview() {
  clearGameTimer();
  playSound('click');
  game.phase = 'menu';
  game.level = 0;
  const missions = T('missions').map((m, i) => `<div class="preview-card"><b>${i + 1}. ${m}</b><p>${i === 0 ? T('inboxTitle') : i === 1 ? T('liveAttack') : i === 2 ? T('passwordTitle') : i === 3 ? T('mazeTitle') : T('recoveryTitle')}</p></div>`).join('');
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}
    <div class="panel wide"><h2>${T('navMissions')}</h2>
      <p>${T('scenarioText')}</p>
      <div class="preview-grid">${missions}</div>
      <p class="small">This tab is for project information only. Use the main Start Mission button to play the game.</p>
      <button class="ghost-btn" onclick="showMenu()">${T('back')}</button>
    </div></div>`;
}

function showDesktopPreview() {
  clearGameTimer();
  playSound('click');
  game.phase = 'menu';
  game.level = 0;
  const content = `<h2>${T('fakeDesktop')}</h2>
    <p>${T('fakeDesktopText')}</p>
    <div class="mini-grid">
      <div><b>📧 ${T('apps').Inbox}</b><br>${T('inboxTitle')}</div>
      <div><b>🌐 ${T('apps').Browser}</b><br>${T('projectTabPoint2')}</div>
      <div><b>⌨️ ${T('apps').Terminal}</b><br>${T('passwordTitle')}</div>
      <div><b>🛡️ ${T('apps').Security}</b><br>${T('recoveryTitle')}</div>
    </div>
    <button class="ghost-btn" onclick="showMenu()">${T('back')}</button>`;
  screen.innerHTML = `<div class="game-screen"><div class="hud-area">${hud()}</div>${hackerBox()}${desktopShell(content, 'Desktop')}</div>`;
}

function showReportPreview() {
  clearGameTimer();
  playSound('click');
  game.phase = 'menu';
  game.level = 0;
  screen.innerHTML = `<div class="game-screen report-bg"><div class="hud-area">${hud()}</div>
    <div class="panel wide report"><h2>${T('finalReport')}</h2>
      <h3>${T('finalRank')} ${T('ranks').defender}</h3>
      <div class="report-grid">
        <div><b>${T('finalScore')}</b><span>1200</span></div>
        <div><b>XP</b><span>500</span></div>
        <div><b>${T('livesLeft')}</b><span>4</span></div>
        <div><b>${T('badges')}</b><span>5</span></div>
      </div>
      <h3>${T('learningSummary')}</h3>
      <ul class="log">
        <li>${T('projectTabPoint2')}</li>
        <li>${T('projectTabPoint3')}</li>
      </ul>
      <button class="ghost-btn" onclick="showMenu()">${T('back')}</button>
    </div></div>`;
}

function showFeatureInfo(type) {
  playSound('click');
  const box = document.getElementById('hero-feature-info');
  if (!box) return;
  if (featureInfoTimer) clearTimeout(featureInfoTimer);
  const map = {
    hacker: ['featureHackerTitle', 'featureHackerDesc'],
    combo: ['featureComboTitle', 'featureComboDesc'],
    popup: ['featurePopupTitle', 'featurePopupDesc']
  };
  const keys = map[type] || map.hacker;
  box.innerHTML = `<h3>${T(keys[0])}</h3><p>${T(keys[1])}</p>`;
  box.classList.remove('info-pop');
  void box.offsetWidth;
  box.classList.add('info-pop');
  featureInfoTimer = setTimeout(() => {
    const currentBox = document.getElementById('hero-feature-info');
    if (currentBox) {
      currentBox.classList.remove('info-pop');
      currentBox.innerHTML = `<span>${T('clickFeature')}</span>`;
    }
  }, 10000);
}

function openProjectAnimation() {
  playSound('combo');
  const overlay = document.createElement('div');
  overlay.className = 'project-overlay';
  overlay.innerHTML = `
    <div class="project-animation-card">
      <div class="big-fish-logo">🎣</div>
      <div class="scan-ring"></div>
      <div class="fish-line"></div>
      <div class="project-loading">PHISHING SIMULATION LOADING...</div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.innerHTML = `
      <div class="project-tab">
        <button class="close-project" onclick="this.closest('.project-overlay').remove()">×</button>
        <div class="project-tab-logo">🎣</div>
        <h2>${T('projectTabTitle')}</h2>
        <p>${T('projectTabDesc')}</p>
        <ul>
          <li>${T('projectTabPoint1')}</li>
          <li>${T('projectTabPoint2')}</li>
          <li>${T('projectTabPoint3')}</li>
        </ul>
        <button class="primary" onclick="this.closest('.project-overlay').remove()">${T('continueBtn')}</button>
      </div>`;
  }, 1700);
}

boot();
