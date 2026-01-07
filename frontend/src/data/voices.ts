// 阿里云 TTS 音色列表
// 数据来源：https://help.aliyun.com/zh/isi/developer-reference/overview-of-speech-synthesis

export interface Voice {
  id: string
  name: string
  type: string
  quality: string
  emotions?: string[]
}

export interface VoiceCategory {
  category: string
  voices: Voice[]
}

export const voiceCategories: VoiceCategory[] = [
  {
    category: '通用场景',
    voices: [
      { id: 'xiaoyun', name: '小云', type: '标准女声', quality: 'lite' },
      { id: 'xiaogang', name: '小刚', type: '标准男声', quality: 'lite' },
      { id: 'ruoxi', name: '若兮', type: '温柔女声', quality: '标准' },
      { id: 'siqi', name: '思琪', type: '温柔女声', quality: '标准' },
      { id: 'sijia', name: '思佳', type: '标准女声', quality: '标准' },
      { id: 'sicheng', name: '思诚', type: '标准男声', quality: '标准' },
      { id: 'ninger', name: '宁儿', type: '标准女声', quality: '标准' },
      { id: 'ruilin', name: '瑞琳', type: '标准女声', quality: '标准' },
      { id: 'zhitian', name: '知甜', type: '甜美女声', quality: '精品' },
      { id: 'zhiyue', name: '知悦', type: '普通话女声', quality: '标准' },
      { id: 'zhiyuan', name: '知媛', type: '普通话女声', quality: '标准' },
      { id: 'zhida', name: '知达', type: '普通话男声', quality: '标准' },
      { id: 'stella', name: 'Stella', type: '知性女声', quality: '标准' },
      { id: 'stanley', name: 'Stanley', type: '沉稳男声', quality: '标准' },
      { id: 'kenny', name: 'Kenny', type: '沉稳男声', quality: '标准' },
      { id: 'rosa', name: 'Rosa', type: '自然女声', quality: '标准' }
    ]
  },
  {
    category: '客服场景',
    voices: [
      { id: 'siyue', name: '思悦', type: '温柔女声', quality: '标准' },
      { id: 'aimei', name: '艾美', type: '甜美女声', quality: '标准' },
      { id: 'aiyue', name: '艾悦', type: '温柔女声', quality: '标准' },
      { id: 'aiyu', name: '艾雨', type: '自然女声', quality: '标准' },
      { id: 'aiya', name: '艾雅', type: '严厉女声', quality: '标准' },
      { id: 'aijing', name: '艾婧', type: '严厉女声', quality: '标准' },
      { id: 'xiaomei', name: '小美', type: '甜美女声', quality: '标准' },
      { id: 'sijing', name: '思婧', type: '严厉女声', quality: '标准' },
      { id: 'aina', name: '艾娜', type: '浙普女声', quality: '标准' },
      { id: 'yina', name: '伊娜', type: '浙普女声', quality: '标准' },
      { id: 'aiqi', name: '艾琪', type: '温柔女声', quality: '标准' },
      { id: 'aijia', name: '艾佳', type: '标准女声', quality: '标准' },
      { id: 'aishuo', name: '艾硕', type: '自然男声', quality: '标准' },
      { id: 'zhiya', name: '知雅', type: '普通话女声', quality: '标准' },
      { id: 'zhishuo', name: '知硕', type: '普通话男声', quality: '标准' },
      { id: 'aixia', name: '艾夏', type: '普通话女声', quality: '标准' }
    ]
  },
  {
    category: '数字人场景',
    voices: [
      { id: 'zhixiaobai', name: '知小白', type: '对话女声', quality: '标准' },
      { id: 'zhixiaoxia', name: '知小夏', type: '对话女声', quality: '标准' },
      { id: 'zhixiaomei', name: '知小妹', type: '直播女声', quality: '标准' },
      { id: 'zhigui', name: '知柜', type: '直播女声', quality: '标准' },
      { id: 'abin', name: '阿斌', type: '广东普通话', quality: '标准' },
      { id: 'cally', name: 'Cally', type: '美式英文女声', quality: '标准' }
    ]
  },
  {
    category: '直播场景',
    voices: [
      { id: 'guijie', name: '柜姐', type: '亲切女声', quality: '标准' },
      { id: 'xiaoxian', name: '小仙', type: '亲切女声', quality: '标准' },
      { id: 'maoxiaomei', name: '猫小美', type: '活力女声', quality: '标准' },
      { id: 'aifei', name: '艾飞', type: '激昂解说', quality: '标准' },
      { id: 'ailun', name: '艾伦', type: '悬疑解说', quality: '标准' },
      { id: 'yaqun', name: '亚群', type: '卖场广播', quality: '标准' },
      { id: 'qiaowei', name: '巧薇', type: '卖场广播', quality: '标准' },
      { id: 'laotie', name: '老铁', type: '东北老铁', quality: '标准' },
      { id: 'laomei', name: '老妹', type: '吆喝女声', quality: '标准' },
      { id: 'zhimao', name: '知猫', type: '普通话女声', quality: '标准' }
    ]
  },
  {
    category: '童声场景',
    voices: [
      { id: 'sitong', name: '思彤', type: '儿童音', quality: '标准' },
      { id: 'xiaobei', name: '小北', type: '萝莉女声', quality: '标准' },
      { id: 'aitong', name: '艾彤', type: '儿童音', quality: '标准' },
      { id: 'aiwei', name: '艾薇', type: '萝莉女声', quality: '标准' },
      { id: 'aibao', name: '艾宝', type: '萝莉女声', quality: '标准' },
      { id: 'aiying', name: '艾颖', type: '软萌童声', quality: '精品' },
      { id: 'jielidou', name: '杰力豆', type: '治愈童声', quality: '标准' },
      { id: 'yuer', name: '悦儿', type: '儿童剧女声', quality: '标准' },
      { id: 'mashu', name: '马树', type: '儿童剧男声', quality: '标准' },
      { id: 'zhibei_emo', name: '知贝', type: '多情感童声', quality: '标准' }
    ]
  },
  {
    category: '文学场景',
    voices: [
      { id: 'aiyuan', name: '艾媛', type: '知心姐姐', quality: '精品' },
      { id: 'aixiang', name: '艾祥', type: '磁性男声', quality: '精品' },
      { id: 'aimo', name: '艾墨', type: '情感男声', quality: '精品' },
      { id: 'aiye', name: '艾晔', type: '青年男声', quality: '精品' },
      { id: 'aiting', name: '艾婷', type: '电台女声', quality: '精品' },
      { id: 'aifan', name: '艾凡', type: '情感女声', quality: '精品' },
      { id: 'ainan', name: '艾楠', type: '广告男声', quality: '精品' },
      { id: 'aihao', name: '艾浩', type: '资讯男声', quality: '精品' },
      { id: 'aiming', name: '艾茗', type: '诙谐男声', quality: '精品' },
      { id: 'aixiao', name: '艾笑', type: '资讯女声', quality: '精品' },
      { id: 'aichu', name: '艾厨', type: '舌尖男声', quality: '精品' },
      { id: 'aiqian', name: '艾倩', type: '资讯女声', quality: '精品' },
      { id: 'aishu', name: '艾树', type: '资讯男声', quality: '精品' },
      { id: 'airu', name: '艾茹', type: '新闻女声', quality: '精品' }
    ]
  },
  {
    category: '超高清场景',
    voices: [
      { id: 'zhiqi', name: '知琪', type: '温柔女声', quality: '精品' },
      { id: 'zhichu', name: '知厨', type: '舌尖男声', quality: '精品' },
      { id: 'zhixiang', name: '知祥', type: '磁性男声', quality: '精品' },
      { id: 'zhijia', name: '知佳', type: '标准女声', quality: '精品' },
      { id: 'zhinan', name: '知楠', type: '广告男声', quality: '精品' },
      { id: 'zhiqian', name: '知倩', type: '资讯女声', quality: '精品' },
      { id: 'zhiru', name: '知茹', type: '新闻女声', quality: '精品' },
      { id: 'zhide', name: '知德', type: '新闻男声', quality: '精品' },
      { id: 'zhifei', name: '知飞', type: '激昂解说', quality: '精品' },
      { id: 'zhilun', name: '知伦', type: '悬疑解说', quality: '精品' },
      { id: 'zhiwei', name: '知薇', type: '萝莉女声', quality: '精品' }
    ]
  },
  {
    category: '多情感音色',
    voices: [
      { id: 'zhifeng_emo', name: '知锋', type: '多情感男声', quality: '标准', emotions: ['angry', 'fear', 'happy', 'neutral', 'sad', 'surprise'] },
      { id: 'zhibing_emo', name: '知冰', type: '多情感男声', quality: '标准', emotions: ['angry', 'fear', 'happy', 'neutral', 'sad', 'surprise'] },
      { id: 'zhimiao_emo', name: '知妙', type: '多情感女声', quality: '标准', emotions: ['serious', 'sad', 'disgust', 'jealousy', 'embarrassed', 'happy', 'fear', 'surprise', 'neutral', 'frustrated', 'affectionate', 'gentle', 'angry', 'newscast', 'customer-service', 'story', 'living'] },
      { id: 'zhimi_emo', name: '知米', type: '多情感女声', quality: '标准', emotions: ['angry', 'fear', 'happy', 'hate', 'neutral', 'sad', 'surprise'] },
      { id: 'zhiyan_emo', name: '知燕', type: '多情感女声', quality: '标准', emotions: ['neutral', 'happy', 'angry', 'sad', 'fear', 'hate', 'surprise', 'arousal'] },
      { id: 'zhitian_emo', name: '知甜', type: '多情感女声', quality: '标准', emotions: ['neutral', 'happy', 'angry', 'sad', 'fear', 'hate', 'surprise'] }
    ]
  },
  {
    category: '方言音色',
    voices: [
      { id: 'shanshan', name: '姗姗', type: '粤语女声', quality: '标准' },
      { id: 'jiajia', name: '佳佳', type: '粤语女声', quality: '标准' },
      { id: 'taozi', name: '桃子', type: '粤语女声', quality: '标准' },
      { id: 'kelly', name: 'Kelly', type: '香港粤语女声', quality: '标准' },
      { id: 'chuangirl', name: '小玥', type: '四川话女声', quality: '标准' },
      { id: 'qingqing', name: '青青', type: '中国台湾话女声', quality: '标准' },
      { id: 'zhiqing', name: '知青', type: '中国台湾话女声', quality: '精品' },
      { id: 'cuijie', name: '翠姐', type: '东北话女声', quality: '标准' },
      { id: 'dahu', name: '大虎', type: '东北话男声', quality: '标准' },
      { id: 'xiaoze', name: '小泽', type: '湖南重口音男声', quality: '标准' },
      { id: 'aikan', name: '艾侃', type: '天津话男声', quality: '标准' }
    ]
  },
  {
    category: '英文音色',
    voices: [
      { id: 'harry', name: 'Harry', type: '英音男声', quality: '标准' },
      { id: 'abby', name: 'Abby', type: '美音女声', quality: '标准' },
      { id: 'andy', name: 'Andy', type: '美音男声', quality: '标准' },
      { id: 'eric', name: 'Eric', type: '英音男声', quality: '标准' },
      { id: 'emily', name: 'Emily', type: '英音女声', quality: '标准' },
      { id: 'luna', name: 'Luna', type: '英音女声', quality: '标准' },
      { id: 'luca', name: 'Luca', type: '英音男声', quality: '标准' },
      { id: 'wendy', name: 'Wendy', type: '英音女声', quality: '标准' },
      { id: 'william', name: 'William', type: '英音男声', quality: '标准' },
      { id: 'olivia', name: 'Olivia', type: '英音女声', quality: '标准' },
      { id: 'lydia', name: 'Lydia', type: '英中双语女声', quality: '标准' },
      { id: 'annie', name: 'Annie', type: '美语女声', quality: '标准' },
      { id: 'betty', name: 'Betty', type: '美式英文女声', quality: '标准' },
      { id: 'beth', name: 'Beth', type: '美式英文女声', quality: '标准' },
      { id: 'cindy', name: 'Cindy', type: '美式英文女声', quality: '标准' },
      { id: 'donna', name: 'Donna', type: '美式英文女声', quality: '标准' },
      { id: 'eva', name: 'Eva', type: '美式英文女声', quality: '标准' },
      { id: 'brian', name: 'Brian', type: '美式英文男声', quality: '标准' },
      { id: 'david', name: 'David', type: '美式英文男声', quality: '标准' },
      { id: 'ava', name: 'Ava', type: '美语女声', quality: '标准' },
      { id: 'becca', name: 'Becca', type: '美语客服女声', quality: '标准' }
    ]
  },
  {
    category: '其他语言',
    voices: [
      { id: 'tomoka', name: '智香', type: '日语女声', quality: '标准' },
      { id: 'tomoya', name: '智也', type: '日语男声', quality: '标准' },
      { id: 'kyong', name: 'Kyong', type: '韩语女声', quality: '标准' },
      { id: 'indah', name: 'Indah', type: '印尼语女声', quality: '标准' },
      { id: 'farah', name: 'Farah', type: '马来语女声', quality: '标准' },
      { id: 'tala', name: 'Tala', type: '菲律宾语女声', quality: '标准' },
      { id: 'tien', name: 'Tien', type: '越南语女声', quality: '标准' },
      { id: 'waan', name: 'Waan', type: '泰语女声', quality: '标准' },
      { id: 'masha', name: 'Masha', type: '俄语女声', quality: '标准' },
      { id: 'camila', name: 'Camila', type: '西班牙语女声', quality: '标准' },
      { id: 'perla', name: 'Perla', type: '意大利语女声', quality: '标准' },
      { id: 'clara', name: 'Clara', type: '法语女声', quality: '标准' },
      { id: 'hanna', name: 'Hanna', type: '德语女声', quality: '标准' }
    ]
  }
]

// 获取所有音色的扁平列表
export function getAllVoices(): Voice[] {
  return voiceCategories.flatMap(cat => cat.voices)
}

// 根据 ID 查找音色
export function getVoiceById(id: string): Voice | undefined {
  return getAllVoices().find(v => v.id === id)
}

// 获取推荐音色（常用）
export function getRecommendedVoices(): Voice[] {
  return [
    'xiaoyun', 'xiaogang', 'ruoxi', 'siqi', 'aimei', 
    'siyue', 'zhitian', 'aixiang', 'aimo', 'zhiqi'
  ].map(id => getVoiceById(id)).filter((v): v is Voice => v !== undefined)
}
