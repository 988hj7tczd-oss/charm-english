const RANKS = [
  { id: 'primary', name: '小学', icon: '🌱', sub: '零基础·趣味启蒙', style: 'primary',
    color: '#FF6B6B', lightColor: '#FFE8E8', desc: '同步小学课标，趣味启蒙' },
  { id: 'middle', name: '初中', icon: '🌿', sub: '中考备战·夯实基础', style: 'middle',
    color: '#FF922B', lightColor: '#FFF3E0', desc: '对标中考考纲，1600核心词' },
  { id: 'high', name: '高中', icon: '🌳', sub: '高考冲刺·高阶提升', style: 'high',
    color: '#FCC419', lightColor: '#FFF8E1', desc: '对标高考考纲，3500核心词' },
  { id: 'college', name: '大学', icon: '🏛️', sub: '四六级·通用英语', style: 'college',
    color: '#40C057', lightColor: '#EBFBEE', desc: '四六级应试+日常实用' },
  { id: 'graduate', name: '研究生', icon: '🔬', sub: '考研英语·学术基础', style: 'graduate',
    color: '#339AF0', lightColor: '#E3F0FF', desc: '对标考研英语，5500词汇' },
  { id: 'phd', name: '博士', icon: '🎯', sub: '学术英语·科研深造', style: 'phd',
    color: '#7950F2', lightColor: '#F0E6FF', desc: '学术科研英语全场景' }
];

const TOTAL_LEVELS = 15;

function generateLevels(rankId, vineType) {
  const levels = [];
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    levels.push({ id: `${rankId}-${vineType}-${i+1}`, num: i + 1, name: `${i+1}` });
  }
  return levels;
}

const QUESTIONS = {};

function q(rank, vine, level, data) {
  if (!QUESTIONS[rank]) QUESTIONS[rank] = {};
  if (!QUESTIONS[rank][vine]) QUESTIONS[rank][vine] = {};
  if (!QUESTIONS[rank][vine][level]) QUESTIONS[rank][vine][level] = [];
  QUESTIONS[rank][vine][level].push(...data);
}

function makeOpts(correct, wrongs) {
  const opts = [{ text: correct, correct: true }];
  wrongs.forEach(w => opts.push({ text: w, correct: false }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

function makeWordQ(question, correct, wrongs, humorStory, humorTag) {
  return { type: 'word', question, options: makeOpts(correct, wrongs), humorStory, humorTag };
}

function makeListenQ(question, correct, wrongs, audioText, humorStory, humorTag) {
  return { type: 'listening', question, options: makeOpts(correct, wrongs), audioText: audioText || correct, humorStory, humorTag };
}

// ==================== 小学 ====================
q('primary', 'word', 1, [
  makeWordQ('🍎 "apple" 的中文意思是？', '苹果', ['香蕉', '橙子', '葡萄'], '想象一个可爱的老奶奶"阿婆"在吃苹果 → 阿婆(apple)吃苹果，画面感满满！🍎', '谐音联想'),
  makeWordQ('🐱 "cat" 的中文意思是？', '猫', ['狗', '鸟', '鱼'], '小猫咪"cat"在追老鼠，cat\cat\cat → "开猫"！笑着就记住了😸', '童趣谐音'),
  makeWordQ('☀️ "sun" 的中文意思是？', '太阳', ['月亮', '星星', '云'], '太阳公公"sun"（森）站在森林上空发光，森林的太阳 → sun！🌞', '画面记忆'),
  makeWordQ('📚 "book" 的中文意思是？', '书', ['笔', '纸', '桌子'], '把book读成"不可"→ 不(book)可一日无书！爱读书的孩子最棒📖', '趣味谐音'),
  makeWordQ('🐕 "dog" 的中文意思是？', '狗', ['猫', '兔子', '老鼠'], '小狗"dog"（到哥） → 隔壁到哥家养了一只超可爱的小狗🐕', '谐音联想'),
]);
q('primary', 'word', 2, [
  makeWordQ('🐟 "fish" 的中文意思是？', '鱼', ['肉', '蛋', '牛奶'], '小鱼"fish"（费事） → 抓小鱼可费事了，滑溜溜抓不住🐟', '趣味谐音'),
  makeWordQ('🏠 "house" 的中文意思是？', '房子', ['学校', '公园', '商店'], '房子"house"（耗子） → 耗子在家打洞，房子就是耗子的家🏠', '童趣联想'),
  makeWordQ('🚗 "car" 的中文意思是？', '汽车', ['火车', '飞机', '船'], '小汽车"car"（卡） → 小汽车卡在路上了，滴滴！🚗', '谐音记忆'),
  makeWordQ('🌺 "flower" 的中文意思是？', '花', ['草', '树', '叶子'], '花"flower"（福拉窝）→ 福气拉满一窝花，美美哒💐', '趣味记忆'),
  makeWordQ('👀 "eye" 的中文意思是？', '眼睛', ['耳朵', '鼻子', '嘴巴'], 'eye像不像一双眼睛？两个e是两只眼，y是鼻子！eye=眼睛👁️', '象形记忆'),
]);
q('primary', 'word', 3, [
  makeWordQ('🎵 "music" 的中文意思是？', '音乐', ['美术', '体育', '数学'], 'music（谬贼克）→ 音乐课上的"谬贼"老师其实超有才华！🎵', '趣味谐音'),
  makeWordQ('🍚 "rice" 的中文意思是？', '米饭', ['面条', '面包', '蛋糕'], 'rice（来吃）→ 米饭来了，快来吃！🍚', '简单记忆'),
  makeWordQ('🐰 "rabbit" 的中文意思是？', '兔子', ['松鼠', '刺猬', '狐狸'], 'rabbit（rab-bit）→ 兔子"rab"一下咬了一"bit"口胡萝卜🐰', '拆分记忆'),
  makeWordQ('🌈 "rainbow" 的中文意思是？', '彩虹', ['下雨', '晴天', '下雪'], 'rain（雨）+bow（弓）= 雨后天空的弓形彩虹🌈', '组合记忆'),
  makeWordQ('🎂 "happy" 的中文意思是？', '快乐的', ['伤心的', '生气的', '疲惫的'], 'happy（嗨皮）→ 大家一起嗨皮就是最快乐的时光！🎉', '谐音记忆'),
]);
q('primary', 'word', 4, [
  makeWordQ('👨‍⚕️ "doctor" 的中文意思是？', '医生', ['老师', '警察', '司机'], 'doctor（多克特）→ 多看病人的"多克特"医生超厉害🩺', '谐音联想'),
  makeWordQ('🎒 "school" 的中文意思是？', '学校', ['医院', '超市', '图书馆'], 'school（斯库）→ 学校的"斯库"里充满知识！🏫', '趣味谐音'),
  makeWordQ('🍦 "ice cream" 的中文意思是？', '冰淇淋', ['蛋糕', '糖果', '饼干'], 'ice（冰）+cream（奶油）= 冰冰凉凉的奶油冰淇淋！🍨', '组合记忆'),
  makeWordQ('🐼 "panda" 的中文意思是？', '熊猫', ['老虎', '狮子', '大象'], 'panda（胖哒）→ 胖胖哒熊猫最可爱了🐼', '谐音记忆'),
  makeWordQ('🌙 "moon" 的中文意思是？', '月亮', ['太阳', '星星', '地球'], 'moon（木）→ 月亮上有一棵"木"桂花树🌙', '趣味联想'),
]);
q('primary', 'word', 5, [
  makeWordQ('🎄 "tree" 的中文意思是？', '树', ['花', '草', '山'], 'tree（吹）→ 风一吹，小树就摇啊摇🌳', '拟声记忆'),
  makeWordQ('🐦 "bird" 的中文意思是？', '鸟', ['鱼', '猫', '狗'], 'bird（伯德）→ 伯德先生养了一只小鸟🐦', '谐音联想'),
  makeWordQ('🌊 "sea" 的中文意思是？', '大海', ['河流', '湖泊', '池塘'], 'sea（西）→ 大海在西边，看到了吗？🌊', '方位联想'),
  makeWordQ('🍉 "watermelon" 的中文意思是？', '西瓜', ['苹果', '香蕉', '草莓'], 'water（水）+melon（瓜）= 水分超多的瓜→西瓜🍉', '组合记忆'),
  makeWordQ('🚲 "bike" 的中文意思是？', '自行车', ['汽车', '公交', '地铁'], 'bike（拜克）→ 拜拜了您嘞，我骑自行车走了🚲', '趣味谐音'),
]);

q('primary', 'listening', 1, [
  makeListenQ('👂 请听发音，选择正确的单词', 'apple', ['banana', 'cat', 'dog'], 'apple', 'apple → 阿婆吃苹果，画面感十足！🍎', '童趣记忆'),
  makeListenQ('👂 请听发音，选择对应的中文意思', '猫', ['狗', '鸟', '鱼'], 'cat', 'cat小猫咪 → 想想"开猫"这个有趣发音😸', '谐音联想'),
  makeListenQ('👂 请听发音，选择正确的单词', 'sun', ['moon', 'star', 'cloud'], 'sun', '太阳sun → 森林(sen)上空的太阳公公🌞', '画面联想'),
  makeListenQ('👂 请听发音，选择对应的中文意思', '书', ['笔', '尺子', '书包'], 'book', 'book不可一日无书！📚', '趣味短句'),
  makeListenQ('👂 请听发音，选择正确的单词', 'dog', ['cat', 'fish', 'bird'], 'dog', '到哥(dog)养的小狗汪汪叫🐕', '谐音记忆'),
]);
q('primary', 'listening', 2, [
  makeListenQ('👂 听音选词', 'fish', ['meat', 'egg', 'milk'], 'fish', '费事(fish)抓小鱼🐟', '谐音记忆'),
  makeListenQ('👂 听音选中文', '红色', ['蓝色', '绿色', '黄色'], 'red', '红色red像"热的"，热情的红色🔥', '联想记忆'),
  makeListenQ('👂 听音选词', 'blue', ['red', 'green', 'yellow'], 'blue', '蓝色blue"不露"→蓝色大海不露底💙', '谐音记忆'),
  makeListenQ('👂 听音选中文', '一', ['二', '三', '四'], 'one', 'one（完）→ 数到一就"完"了又从1开始🔢', '趣味记忆'),
  makeListenQ('👂 听音选词', 'two', ['one', 'three', 'four'], 'two', 'two（兔）→ 两只兔子🐰🐰', '谐音记忆'),
]);

// ==================== 初中 ====================
q('middle', 'word', 1, [
  makeWordQ('"beautiful" 的中文意思是？', '美丽的', ['丑陋的', '高大的', '矮小的'], 'beauty（美丽）+ful（充满）= 充满美丽的！beauty"标提"→ 标致的容貌✨', '拆解记忆'),
  makeWordQ('"different" 的中文意思是？', '不同的', ['相同的', '相似的', '相同的'], 'differ（不同）+ent（形容词）→ 不同的。diff"迪芙"+erent→迪芙的想法与众不同🤔', '拆解记忆'),
  makeWordQ('"important" 的中文意思是？', '重要的', ['次要的', '普通的', '无聊的'], 'im（向内）+port（港口）+ant → 进港口的货物是"重要的"📦', '联想记忆'),
  makeWordQ('"interesting" 的中文意思是？', '有趣的', ['无聊的', '困难的', '简单的'], 'interest（兴趣）+ing → 让人有兴趣的=有趣的。inter"因特"+est"最"→因特网最有趣🌐', '拆解记忆'),
  makeWordQ('"difficult" 的中文意思是？', '困难的', ['简单的', '容易的', '轻松的'], 'difi"迪飞"+cult→像迪斯尼飞起来的cult(狂热)很难！🤯', '脑洞记忆'),
]);
q('middle', 'word', 2, [
  makeWordQ('"environment" 的中文意思是？', '环境', ['天气', '气候', '温度'], 'environ（围绕）+ment（名词）→ 围绕我们的东西=环境🌍', '拆解记忆'),
  makeWordQ('"government" 的中文意思是？', '政府', ['公司', '学校', '医院'], 'govern（管理）+ment（名词）→ 管理的机构=政府🏛️', '词根记忆'),
  makeWordQ('"education" 的中文意思是？', '教育', ['娱乐', '健康', '交通'], 'e（出）+duc（引导）+ation → 引导人走出无知→教育📚', '词根记忆'),
  makeWordQ('"imagine" 的中文意思是？', '想象', ['记忆', '忘记', '思考'], 'image（图像）+ine → 在脑中画图像=想象。i"爱"+magic"魔法"+ine→我爱魔法想象✨', '拆解记忆'),
  makeWordQ('"knowledge" 的中文意思是？', '知识', ['力量', '勇气', '智慧'], 'know（知道）+ledge（名词）→ 知道的东西=知识。know"诺"+ledge"了己"→诺奖了己知📖', '拆解记忆'),
]);
q('middle', 'word', 3, [
  makeWordQ('形近词辨析："affect" 和 "effect" 哪个是"影响"（动词）？', 'affect', ['effect', '两个都是', '两个都不是'], 'a(f)fect → Action（行动）是动词，所以affect是动词"影响"💪', '形近辨析'),
  makeWordQ('"experience" 的中文意思是？', '经验；经历', ['实验', '表达', '探险'], 'ex（向外）+peri（尝试）+ence → 尝试过的东西=经验。ex"爱思"+"perience"佩瑞恩思"→爱思考佩瑞的经历🧠', '拆解记忆'),
  makeWordQ('"convenient" 的中文意思是？', '方便的', ['困难的', '复杂的', '麻烦的'], 'con（共同）+ven（来）+ient → 大家一起来使用=方便的。con"肯"+ven"文"+ient"易恩特"→肯德基取餐方便吗🏪', '拆解记忆'),
  makeWordQ('"pronunciation" 的中文意思是？', '发音', ['拼写', '语法', '词汇'], 'pro（向前）+nounce（说）+ation → 说出来的方式=发音。pro"普若"+nunc"囊"+"iation"→若能把音发准确🗣️', '拆解记忆'),
  makeWordQ('辨析："quite" 和 "quiet" 哪个是"安静"？', 'quiet', ['quite', '两个都是', '两个都不是'], 'quiet中有"et"→"e"像耳朵听，"t"像闭嘴→安静！而quite中有"e"在尾巴→"相当"活跃！🤫', '形近辨析'),
]);
q('middle', 'listening', 1, [
  makeListenQ('👂 短句听力：这句话的意思是？', '今天天气很好。', ['今天天气不好。', '今天很冷。', '今天下雨。'], 'It is a fine day today.', 'fine有"好的"和"罚款"的意思→今天天气好到要罚款？不！是天气很好☀️', '熟词生义'),
  makeListenQ('👂 短句听力：这句话的意思是？', '我想要一杯水。', ['我想要一杯茶。', '我想要一杯咖啡。', '我想要一杯牛奶。'], 'I would like a glass of water.', 'water"我特"→ 我特别想喝水💧', '谐音记忆'),
  makeListenQ('👂 情景听力：对话发生在哪里？', '图书馆', ['餐厅', '超市', '医院'], 'A: Can I help you? B: Yes, I am looking for a book on history.', '图书馆"library"→来(lai) bra(不累) ry(日)→来图书馆读书不累📚', '谐音联想'),
  makeListenQ('👂 短句听力：说话人是什么语气？', '疑问', ['肯定', '命令', '感叹'], 'Could you please tell me the way to the station?', '礼貌疑问句→"Could you please"是礼貌疑问语气，用于请求帮助🙏', '语法记忆'),
  makeListenQ('👂 情景听力：对话中的人物在做什么？', '问路', ['购物', '吃饭', '学习'], 'Excuse me, how can I get to the hospital?', '问路句型how can I get to → 怎么去... 记住"好坑爱给特吐"🗺️', '趣味记忆'),
]);

// ==================== 高中 ====================
q('high', 'word', 1, [
  makeWordQ('熟词生义："address" 除了"地址"还表示？', '演讲；处理', ['广告', '采纳', '前进'], 'ad（去）+dress（穿衣）→ 穿上正装去"演讲"或"处理"问题👔', '熟词生义'),
  makeWordQ('熟词生义："book" 除了"书"还表示？', '预订', ['阅读', '写作', '出版'], 'book作为动词→拿笔记下→"预订"。书上写满预订信息📝', '词义延伸'),
  makeWordQ('熟词生义："run" 除了"跑"还表示？', '经营；管理', ['跳', '走', '爬'], 'run a company → 跑着管理公司？其实是"经营"的意思🏃‍♂️', '场景记忆'),
  makeWordQ('"phenomenon" 的中文意思是？', '现象', ['奇迹', '灾难', '理论'], 'pheno（出现）+menon（名词）→ 出现在眼前的=现象。phe"菲"+"no"+"menon"→非一般的现象🧐', '拆解记忆'),
  makeWordQ('"sophisticated" 的中文意思是？', '复杂精密的；老练的', ['简单的', '原始的', '基础的'], 'soph（智慧）+isticated → 充满智慧的=精密的。so"苏"phis"菲斯"+"ticated"→苏菲斯很精密的思考者🧠', '拆解记忆'),
]);
q('high', 'word', 2, [
  makeWordQ('"contribute" 的中文意思是？', '贡献；捐献', ['分配', '接收', '拒绝'], 'con（一起）+tribute（给予）→ 大家一起给=贡献。con"康"+"tribute"吹彪特"→康康吹彪特贡献很大🎯', '拆解记忆'),
  makeWordQ('"controversial" 的中文意思是？', '有争议的', ['一致的', '明确的', '合理的'], 'contro（相反）+vers（转）+ial → 反转的=有争议的。contra"康戳"+"versial"→康戳的观点有争议💢', '拆解记忆'),
  makeWordQ('"inevitable" 的中文意思是？', '不可避免的', ['可能的', '可选的', '可避免的'], 'in（不）+evitable（可避免的）→ 不可不免。in"因"+"evitable"→因某种原因不可避免😱', '拆解记忆'),
  makeWordQ('"circumstance" 的中文意思是？', '环境；情况', ['圆圈', '周围', '距离'], 'circum（周围）+stance（站）→ 站在周围的情况=环境。circle圆周+stance站姿→周身的站姿环境🌀', '词根记忆'),
  makeWordQ('"contemporary" 的中文意思是？', '当代的；同龄的', ['暂时的', '永恒的', '古老的'], 'con（一起）+tempor（时间）+ary → 同一时间的=当代的。tempo（节奏）+rary→同一节奏的当代人⏰', '拆解记忆'),
]);
q('high', 'word', 3, [
  makeWordQ('熟词生义："culture" 除了"文化"还可以指？', '培养；养殖', ['文明', '教育', '传统'], '细胞"culture"→ 在培养皿里"培养"。文化也是需要培养的🧫', '科学联想'),
  makeWordQ('"nevertheless" 的中文意思是？', '然而；不过', ['因此', '而且', '否则'], 'never（绝不）+the+less（更少）→ 绝不更少=尽管如此仍然。never"耐沃"theless"累斯"→耐沃仍然很累但坚持💪', '拆解记忆'),
  makeWordQ('"unprecedented" 的中文意思是？', '史无前例的', ['常见的', '重复的', '普通的'], 'un（不）+pre（前）+cede（走）+ented → 之前没人走过的=史无前例。pre"普瑞"+"cedented"→普瑞之前没人做到过🏆', '拆解记忆'),
  makeWordQ('"vulnerable" 的中文意思是？', '脆弱的；易受伤的', ['坚强的', '安全的', '坚固的'], 'vulner（伤）+able（能）→ 容易受伤的。vul"五"+"nerable"→五个脆弱的人🫸', '拆解记忆'),
  makeWordQ('"deteriorate" 的中文意思是？', '恶化；变坏', ['改善', '提升', '稳定'], 'deterior（更坏）+ate（动词）→ 变得更坏。de"低"+terior"特里尔"+ate→低到谷底就恶化了📉', '拆解记忆'),
]);
q('high', 'listening', 1, [
  makeListenQ('👂 长对话听力：对话的主要内容是？', '讨论周末计划', ['讨论考试成绩', '讨论午餐吃什么', '讨论天气'], 'A: What are your plans for the weekend? B: I am thinking about going hiking with some friends.', 'hiking"嗨king"→周末和king一起去"嗨"的徒步运动🥾', '谐音记忆'),
  makeListenQ('👂 新闻听力：这条新闻是关于？', '环境保护', ['经济发展', '教育改革', '科技进步'], 'A new study shows that global temperatures have risen by 1.5 degrees Celsius over the past century.', 'global"格楼宝"→ 地球这个"格楼"是我们的宝，要保护环境🌍', '谐音记忆'),
  makeListenQ('👂 讲座听力：演讲者主要表达了什么观点？', '阅读的重要性', ['科技的发展', '健康的生活方式', '旅行的意义'], 'Reading books not only expands our knowledge but also enhances our ability to think critically.', 'critical"亏题口"→ 批判性思维不能"亏题口"，要多阅读多思考📖', '谐音记忆'),
  makeListenQ('👂 对话听力：两人的关系最可能是？', '师生关系', ['父子关系', '同事关系', '朋友关系'], 'Could you please explain this theory again, Professor? I did not quite understand it.', 'professor"普如菲瑟"→学生叫professor，明显是师生关系👨‍🏫', '场景记忆'),
  makeListenQ('👂 短文听力：这段短文的主旨是？', '健康饮食的建议', ['运动的好处', '睡眠的重要性', '学习的方法'], 'A balanced diet rich in fruits and vegetables can significantly reduce the risk of heart disease.', 'balanced"拜愣斯特"→"拜"访"愣"头青"斯特"，他饮食均衡得很😂', '趣味记忆'),
]);

// ==================== 大学 ====================
q('college', 'word', 1, [
  makeWordQ('"significant" 的中文意思是？', '重要的；显著的', ['微小的', '普通的', '无关的'], 'sign（标记）+i+fic（做）+ant → 做了标记的=重要的。sign"赛恩"+"ificant"→赛恩做了显著标记🎯', '拆解记忆'),
  makeWordQ('"consequence" 的中文意思是？', '后果；结果', ['原因', '过程', '开始'], 'con（一起）+sequ（跟随）+ence → 跟随而来的=后果。con"康"+"sequence"→康康偷懒的后果很严重😰', '拆解记忆'),
  makeWordQ('"opportunity" 的中文意思是？', '机会', ['困难', '挑战', '威胁'], 'op（朝向）+port（港口）+unity → 朝向港口的机会=好机会。oppo手机+port港口+unity团结→在港口团结就有机会📱', '潮流记忆'),
  makeWordQ('"approximately" 的中文意思是？', '大约；近似', ['精确地', '完全地', '绝对地'], 'ap（去）+proxim（接近）+ately → 接近的=大约。pro"普洛"+"ximately"→普洛大约知道了🤔', '拆解记忆'),
  makeWordQ('"commercial" 的中文意思是？', '商业的', ['免费的', '公益的', '个人的'], 'commerce（商业）+ial → 商业的。com"康"+"mercial"→康康在做商业广告📺', '拆解记忆'),
]);
q('college', 'word', 2, [
  makeWordQ('"demonstrate" 的中文意思是？', '演示；证明', ['隐藏', '破坏', '忽视'], 'de（完全）+monstrate（展示）→ 完全展示=演示。demo"戴莫"+"strate"→戴莫在用demo演示📊', '拆解记忆'),
  makeWordQ('"contemporary" 的中文意思是？', '当代的', ['古代的', '未来的', '永恒的'], 'con（一起）+tempor（时间）+ary → 同一时代的=当代的。tempo节奏+rary→当代人的节奏很快⚡', '词根记忆'),
  makeWordQ('"interpretation" 的中文意思是？', '解释；口译', ['翻译', '写作', '阅读'], 'inter（相互）+pret（价值）+ation → 赋予相互价值=解释。inter"因特"+"pretation"→因特网的解释很丰富🌐', '拆解记忆'),
  makeWordQ('四六级高频："available" 的用法和意思是？', '可用的；有空的', ['有价值的', '可见的', '可靠的'], 'a（去）+vail（价值）+able（能）→ 能有价值的=可用的。a"阿"+"vail"→阿伟有空吗？稍等我看下available📅', '生活场景'),
  makeWordQ('"perspective" 的中文意思是？', '观点；视角', ['方向', '方法', '目标'], 'per（透过）+spect（看）+ive → 透过...看=视角。per"珀"+"spective"→斯佩克蒂夫从她的视角看问题👀', '拆解记忆'),
]);
q('college', 'listening', 1, [
  makeListenQ('👂 新闻听力：这条新闻最可能出现在哪个频道？', '财经频道', ['体育频道', '娱乐频道', '教育频道'], 'The stock market surged by 3 percent today, marking the largest single-day gain this quarter.', 'stock"斯到克"→ 斯到克市场的股票涨了📈', '谐音记忆'),
  makeListenQ('👂 校园场景：对话中学生在做什么？', '咨询选课', ['退学费', '借书', '找宿舍'], 'I am not sure which courses to take this semester. Could you give me some advice?', 'semester"色麦斯特"→每"色麦斯特"都要选课好纠结😫', '谐音记忆'),
  makeListenQ('👂 四级听力：男士的建议是什么？', '参加社团活动', ['专心学习', '回家休息', '出去旅游'], 'You should consider joining a club. It is a great way to meet new people and develop skills.', 'consider"康希德"→康希德建议参加社团活动👍', '谐音记忆'),
  makeListenQ('👂 职场情景：对话中的女士在做什么？', '面试', ['开会', '演讲', '谈判'], 'I have a degree in marketing and three years of experience in the field.', 'interview"因特维由"→因特维由的面试很顺利💼', '谐音记忆'),
  makeListenQ('👂 六级听力：这段话主要讨论的是？', '人工智能的影响', ['气候变化', '教育改革', '人口问题'], 'Artificial intelligence is transforming industries from healthcare to finance at an unprecedented rate.', 'artificial"阿提菲寿"→人工智能的"阿提菲寿"智能太强了🤖', '谐音记忆'),
]);

// ==================== 研究生 ====================
q('graduate', 'word', 1, [
  makeWordQ('"hypothesis"的中文意思是？', '假设；假说', ['结论', '证据', '理论'], 'hypo（下面）+thesis（放置）→ 放在下面的论点=假设。hypo"嗨抛"+thesis"西斯"→嗨抛出一个假设💡', '拆解记忆'),
  makeWordQ('"paradigm" 的中文意思是？', '范式；典范', ['矛盾', '评论', '图表'], 'para（旁边）+digm（展示）→ 展示在旁边做示范=范式。para"帕拉"+digm"迪格姆"→帕拉的学术范式很经典📐', '拆解记忆'),
  makeWordQ('"empirical" 的中文意思是？', '经验主义的', ['理论的', '假设的', '抽象的'], 'em（在里面）+pir（尝试）+ical → 在尝试中得到的=经验的。em"艾姆"+"pirical"→艾姆的经验研究很扎实📊', '拆解记忆'),
  makeWordQ('"methodology" 的中文意思是？', '方法论', ['理论', '结论', '分析'], 'method（方法）+ology（学科）→ 研究方法的学科=方法论。method"麦色德"+"ology"→麦色德的研究方法论很科学🔬', '拆解记忆'),
  makeWordQ('"synthesis" 的中文意思是？', '综合；合成', ['分析', '分解', '分离'], 'syn（一起）+thesis（放置）→ 放在一起=综合。syn"辛"+thesis"西斯"→辛西斯的综合分析能力很强🧬', '拆解记忆'),
]);
q('graduate', 'word', 2, [
  makeWordQ('考研高频："ambiguous" 的中文意思是？', '模糊的；歧义的', ['清晰的', '明确的', '直接的'], 'ambi（两边）+guous（走）→ 两边走的=模棱两可的。am"艾姆"+"biguous"→艾姆的态度很模糊🤷', '拆解记忆'),
  makeWordQ('"sophisticated" 在中科院考博英语中指？', '复杂精密的', ['简单的', '天真的', '粗鲁的'], '这个词在考研考博中超高频！ soph（智慧）+isticated→有智慧的复杂性。so"索"+"phisticated"→索菲亚的算法很精密🧮', '高频提示'),
  makeWordQ('"heterogeneous" 的中文意思是？', '异质的；多样的', ['同质的', '单一的', '均匀的'], 'hetero（异）+gene（基因）+ous → 不同基因的=异质的。hetero"海特肉"+"geneous"→海特肉的基因组成多样🧬', '拆解记忆'),
  makeWordQ('"epistemology" 的中文意思是？', '认识论', ['方法论', '本体论', '伦理学'], 'epi（在...上）+stem（知识）+ology（学科）→ 关于知识的学科=认识论📖', '词根记忆'),
  makeWordQ('"corroborate" 的中文意思是？', '证实；佐证', ['反驳', '质疑', '猜测'], 'cor（一起）+robor（力量）+ate → 一起给力量=证实。cor"考"+"roborate"→考据来证实这个观点✅', '拆解记忆'),
]);
q('graduate', 'listening', 1, [
  makeListenQ('👂 学术讲座：这段话讨论的是哪个概念？', '全球化', ['城市化', '工业化', '现代化'], 'Globalization has led to increased interconnectedness among nations in terms of economy, culture, and politics.', 'globalization"格楼带来怎"→ 格楼(global)带来(ization)全球化的互联互通🌐', '拆解记忆'),
  makeListenQ('👂 外刊听力：经济学人风格，这段话的观点是？', '科技创新驱动经济增长', ['传统产业更重要', '教育是根本', '资源决定发展'], 'Technological innovation serves as the primary engine for sustainable economic growth in the post-pandemic era.', 'innovation"伊诺威辛"→伊诺的威辛创新驱动经济🚀', '谐音记忆'),
  makeListenQ('👂 学术会议听力：发言人在讨论什么？', '数据隐私保护', ['网络安全', '人工智能', '区块链'], 'The tension between data utilization and personal privacy protection has become a central policy challenge.', 'privacy"普瑞瓦西"→普瑞瓦西的数据隐私很重要🔒', '谐音记忆'),
  makeListenQ('👂 考研听力：这段对话的主要结论是？', '需要更多研究数据', ['实验已经成功', '理论有缺陷', '资金不足'], 'Further research is needed to validate these preliminary findings before we can draw any definitive conclusions.', 'preliminary"普利米那里"→普利米那里的初步研究还需要更多数据📋', '谐音记忆'),
  makeListenQ('👂 学术报告：演讲者使用了哪种论证方法？', '对比分析', ['演绎推理', '归纳总结', '因果分析'], 'Unlike traditional approaches, this new methodology emphasizes qualitative rather than quantitative data.', 'qualitative"跨里特提夫"→跨里(quality)特提夫(ative)定性分析 vs 定量分析⚖️', '拆解记忆'),
]);

// ==================== 博士 ====================
q('phd', 'word', 1, [
  makeWordQ('SCI高频词："ubiquitous" 的中文意思是？', '普遍存在的', ['罕见的', '独特的', '有限的'], 'ubi（哪里）+quit（自由）+ous → 哪里都自由存在=无处不在的。ubi"尤比"+"quitous"→尤比的研究无处不在🌍', '拆解记忆'),
  makeWordQ('"paradigm shift" 是什么意思？', '范式转换', ['理论更新', '数据修正', '方法调整'], 'paradigm（范式）+shift（转变）= 科学革命中的"范式转移"，库恩经典概念🔄', '学术记忆'),
  makeWordQ('"interdisciplinary" 的中文意思是？', '跨学科的', ['专业的', '单一的', '传统的'], 'inter（之间）+disciplinary（学科）→ 学科之间的=跨学科的。inter"因特"+"disciplinary"→因特跨学科研究很前沿🔗', '拆解记忆'),
  makeWordQ('"operationalize" 的中文意思是？', '操作化；使可操作', ['理论化', '概念化', '系统化'], 'operational（操作的）+ize（使）→ 使概念变成可操作的定义=操作化。做研究必须会这个词🔧', '学术记忆'),
  makeWordQ('"triangulation" 研究术语中指？', '三角验证', ['三角测量', '三维建模', '三方合作'], 'triangle（三角）+tion → 用多种方法交叉验证=三角验证，定性研究经典方法📐', '学术记忆'),
]);
q('phd', 'word', 2, [
  makeWordQ('"epistemological" 的中文意思是？', '认识论的', ['方法论的', '本体论的', '伦理学的'], 'epistemology（认识论）+ical → 关于知识本质的=认识论的。博士论文必备词汇🎓', '学术记忆'),
  makeWordQ('SCI高频："ameliorate" 的中文意思是？', '改善；改良', ['恶化', '破坏', '忽略'], 'a（去）+melior（更好）+ate → 使其更好=改善。a"阿"+"meliorate"→阿梅的研究改善了实验条件📈', '拆解记忆'),
  makeWordQ('"generalizability" 的中文意思是？', '普适性；可推广性', ['特殊性', '独特性', '偶然性'], 'general（一般）+izable（可）+ity（名词）→ 结果可推广到一般情况=普适性📊', '拆解记忆'),
  makeWordQ('"conceptual framework" 指？', '概念框架', ['理论模型', '数据分析', '文献综述'], 'concept（概念）+ual+framework（框架）→研究的理论概念框架。论文必备结构🏗️', '学术记忆'),
  makeWordQ('"longitudinal study" 指？', '纵向研究', ['横向研究', '实验研究', '案例研究'], 'long（长）+itude（名词）+inal+study → 长期跟踪同一群体的研究=纵向研究📏', '学术记忆'),
]);
q('phd', 'listening', 1, [
  makeListenQ('👂 学术讲座：发言人在讨论什么研究方法？', '民族志研究', ['实验法', '问卷调查', '数据分析'], 'Ethnographic research involves immersing oneself in a community to understand its culture from an insider perspective.', 'ethnographic"艾斯诺格瑞飞克"→艾斯诺的格瑞飞克民族志研究很深入🔍', '谐音记忆'),
  makeListenQ('👂 国际会议：这段话的关键词是？', '同行评审', ['学术引用', '论文发表', '研究基金'], 'Peer review serves as a quality control mechanism in academic publishing, though it has its limitations.', 'peer"皮尔"→皮尔(peer)的同行评审(review)是学术守门人👨‍⚖️', '谐音记忆'),
  makeListenQ('👂 学术讲座：演讲者在讨论哪个哲学概念？', '本体论', ['认识论', '伦理学', '美学'], 'Ontology deals with questions about what entities exist and how they can be categorized.', 'ontology"安拓了记"→"安拓"研究了存在的本体论本质🤔', '谐音记忆'),
  makeListenQ('👂 论文答辩：委员在问什么？', '研究局限性', ['研究创新点', '研究结论', '文献综述'], 'Could you please discuss the limitations of your current study and how they might affect the generalizability of your findings?', 'limitation"利米特辛"→利米特(limit)特辛(tation)研究局限性，坦诚面对才能进步📝', '谐音记忆'),
  makeListenQ('👂 学术报告：这段话讨论的是？', '学术诚信', ['数据收集', '论文格式', '引用规范'], 'Academic integrity requires proper attribution of sources and honest reporting of research findings.', 'integrity"因泰格瑞提"→英泰格(integer)瑞提(ity)的学术诚信是学者的生命线🎯', '谐音记忆'),
]);

// Generate template questions for higher levels
function generateTemplateQuestions(rankId, vineType, startLevel, count) {
  const wordBases = {
    primary: { words: ['teacher', 'student', 'mother', 'father', 'sister', 'brother', 'friend', 'water', 'milk', 'bread', 'egg', 'chair', 'table', 'window', 'door'], humor: '趣味联想记忆法：' },
    middle: { words: ['adventure', 'fantastic', 'necessary', 'secretary', 'schedule', 'temperature', 'comfortable', 'communicate', 'congratulate', 'environment'], humor: '脑洞拆解记忆：' },
    high: { words: ['comprehension', 'appreciation', 'concentration', 'circumstance', 'accommodation', 'recommendation', 'responsibility', 'transportation', 'communication', 'qualification'], humor: '梗系高效记忆法：' },
    college: { words: ['identification', 'representative', 'characteristic', 'administration', 'implementation', 'infrastructure', 'entrepreneurship', 'sustainability', 'vulnerability', 'accountability'], humor: '轻松解压记忆法：' },
    graduate: { words: ['conceptualization', 'operationalization', 'generalizability', 'representativeness', 'trustworthiness', 'methodological', 'epistemological', 'phenomenological', 'interpretivism', 'positivism'], humor: '逻辑趣味记忆法：' },
    phd: { words: ['multidimensional', 'interdisciplinary', 'transdisciplinary', 'neuroplasticity', 'photoluminescence', 'electroencephalography', 'spectrophotometry', 'chromatographically', 'biotechnological', 'nanotechnology'], humor: '极简学术记忆法：' },
  };
  const base = wordBases[rankId];
  for (let lv = startLevel; lv <= startLevel + count - 1; lv++) {
    if (lv > TOTAL_LEVELS) break;
    const list = QUESTIONS[rankId]?.[vineType]?.[lv];
    if (!list || list.length < 3) {
      const ws = shuffle([...base.words]);
      const qs = [];
      for (let i = 0; i < Math.min(5, ws.length); i++) {
        const w = ws[i];
        if (vineType === 'word') {
          qs.push(makeWordQ(
            `"${w}" 的中文意思是？（词汇闯关）`,
            w + '的正确释义',
            ['错误选项A', '错误选项B', '错误选项C'],
            `${base.humor}将 "${w}" 拆解成一幅有趣的画面，笑着就记住了！😄`,
            '趣味记忆'
          ));
        } else {
          qs.push(makeListenQ(
            `👂 听发音，选择 "${w}" 的正确意思（听力闯关）`,
            w + '的释义',
            ['干扰项A', '干扰项B', '干扰项C'],
            w,
            `${base.humor}用 "${w}" 编一个有趣的小故事，听力+记忆双提升！👂`,
            '听力记忆'
          ));
        }
      }
      if (!QUESTIONS[rankId]) QUESTIONS[rankId] = {};
      if (!QUESTIONS[rankId][vineType]) QUESTIONS[rankId][vineType] = {};
      QUESTIONS[rankId][vineType][lv] = qs;
    }
  }
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

for (const rank of RANKS) {
  generateTemplateQuestions(rank.id, 'word', 4, 12);
  generateTemplateQuestions(rank.id, 'listening', 3, 13);
}
