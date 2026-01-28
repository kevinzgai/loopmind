/*
 * @Author: neno 605899155@qq.com
 * @Date: 2026-01-28 20:42:55
 * @LastEditors: neno 605899155@qq.com
 * @LastEditTime: 2026-01-28 22:20:47
 * @FilePath: /chart-ai/frontend/src/data/voices.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 硅基流动 TTS 音色列表
// 模型：FunAudioLLM/CosyVoice2-0.5B
// 文档：https://docs.siliconflow.cn/cn/userguide/capabilities/text-to-speech

export const voiceCategories = [
  {
    category: "男生音色",
    voices: [
      {
        id: "alex",
        name: "Alex",
        type: "沉稳男声",
        description: "沉稳、专业的男声",
      },
      {
        id: "benjamin",
        name: "Benjamin",
        type: "低沉男声",
        description: "低沉、有磁性的男声",
      },
      {
        id: "charles",
        name: "Charles",
        type: "磁性男声",
        description: "磁性、吸引人的男声",
      },
      {
        id: "david",
        name: "David",
        type: "欢快男声",
        description: "欢快、活泼的男声",
      },
    ],
  },
  {
    category: "女生音色",
    voices: [
      {
        id: "anna",
        name: "Anna",
        type: "沉稳女声",
        description: "沉稳、专业的女声",
      },
      {
        id: "bella",
        name: "Bella",
        type: "激情女声",
        description: "激情、充满活力的女声",
      },
      {
        id: "claire",
        name: "Claire",
        type: "温柔女声",
        description: "温柔、亲切的女声",
      },
      {
        id: "diana",
        name: "Diana",
        type: "欢快女声",
        description: "欢快、可爱的女声",
      },
    ],
  },
];

// 获取所有音色的扁平列表
export function getAllVoices() {
  return voiceCategories.flatMap((cat) => cat.voices);
}

// 根据 ID 查找音色
export function getVoiceById(id) {
  return getAllVoices().find((v) => v.id === id);
}

// 获取推荐音色（常用）
export function getRecommendedVoices() {
  return ["anna", "alex", "claire", "charles"]
    .map((id) => getVoiceById(id))
    .filter(Boolean);
}
