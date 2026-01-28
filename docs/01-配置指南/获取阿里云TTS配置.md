# 🔑 如何获取阿里云 TTS 完整配置

## 📋 需要的三个配置

阿里云 TTS 需要以下三个配置参数：

1. **AccessKey ID** - 访问密钥 ID（类似用户名）
2. **AccessKey Secret** - 访问密钥（类似密码）- 你已提供
3. **AppKey** - 应用密钥（项目标识）

---

## ✅ 你已提供的配置

```
ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret
```

这个看起来是 **AccessKey Secret**（访问密钥）。

---

## 🔍 还需要获取的配置

### 1. AccessKey ID（访问密钥 ID）

**获取步骤：**

1. 登录阿里云控制台
2. 点击右上角头像，选择「AccessKey 管理」
3. 或直接访问：https://ram.console.aliyun.com/manage/ak
4. 在 AccessKey 列表中，找到对应的 AccessKey
5. **AccessKey ID** 通常是一串以 `LTAI` 开头的字符串
   - 格式示例：`LTAI5tXXXXXXXXXXXXXX`

**提示：** 如果你有 AccessKey Secret，那么一定有对应的 AccessKey ID。它们是成对出现的。

### 2. AppKey（应用密钥）

**获取步骤：**

1. 访问阿里云智能语音交互控制台
   - https://nls-portal.console.aliyun.com/
2. 点击「项目管理」
3. 如果没有项目，点击「创建项目」
   - 项目名称：AI Chat TTS
   - 选择服务：语音合成
4. 在项目列表中，点击项目名称
5. 在「基本信息」中找到 **AppKey**
   - 格式示例：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（32位字符）

---

## 🎯 快速检查方法

### 方法 1：查看阿里云控制台

1. **AccessKey 管理页面**
   - https://ram.console.aliyun.com/manage/ak
   - 可以看到所有的 AccessKey ID
   - 找到对应的 AccessKey ID

2. **智能语音交互控制台**
   - https://nls-portal.console.aliyun.com/
   - 项目管理 → 选择项目 → 查看 AppKey

### 方法 2：查看之前的记录

如果你之前保存过配置信息：
- 查看邮件
- 查看下载的配置文件
- 查看笔记或文档

---

## 📝 配置格式示例

完整的配置应该是这样的：

```env
# 阿里云 TTS 配置
ALI_TTS_ACCESS_KEY_ID=LTAI5tXXXXXXXXXXXXXX
ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret
ALI_TTS_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔐 安全提示

1. **AccessKey Secret 只显示一次**
   - 创建时会显示，之后不再显示
   - 如果忘记，需要重新创建

2. **不要泄露配置信息**
   - 不要提交到 Git
   - 不要分享给他人
   - 不要在公开场合展示

3. **定期更换**
   - 建议定期更换 AccessKey
   - 如果泄露，立即禁用并重新创建

---

## 🚀 配置完成后

将三个配置填入 `.env` 文件：

```env
ALI_TTS_ACCESS_KEY_ID=你的AccessKeyID
ALI_TTS_ACCESS_KEY_SECRET=your_access_key_secret
ALI_TTS_APP_KEY=你的AppKey
```

然后重启后端服务即可使用！

---

## ❓ 如果找不到配置

### 重新创建 AccessKey

1. 访问 https://ram.console.aliyun.com/manage/ak
2. 点击「创建 AccessKey」
3. 完成安全验证
4. **立即保存** AccessKey ID 和 AccessKey Secret

### 重新创建项目

1. 访问 https://nls-portal.console.aliyun.com/
2. 创建新项目
3. 获取新的 AppKey

---

## 📞 需要帮助？

如果你能提供：
1. AccessKey ID（以 LTAI 开头）
2. AppKey（32位字符串）

我就可以帮你完成配置！

当前已有：
- ✅ AccessKey Secret: your_access_key_secret
- ❌ AccessKey ID: 待提供
- ❌ AppKey: 待提供

---

**提示：** 如果你不确定如何获取，可以截图阿里云控制台的相关页面（注意遮挡敏感信息），我可以帮你指导。
