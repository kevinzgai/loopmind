# Chart AI 项目规则

## 后端开发规范

### API 响应格式标准

**所有后端 API 接口必须使用统一的响应格式**

#### 标准响应格式

```javascript
{
  "code": 0,        // 状态码：0 表示成功，非 0 表示错误
  "data": {},       // 返回的数据，成功时为具体数据，失败时为 null
  "message": ""     // 提示信息
}
```

#### 错误码定义

- `0` - 成功
- `1001` - 参数错误（缺少必填字段）
- `1002` - 验证错误（密码不一致等）
- `1003` - 认证错误（密码错误、用户不存在、权限不足等）
- `1004` - Token 错误（Token 无效、Token 过期等）
- `1005` - 数据冲突（用户已存在等）
- `1006` - 资源不存在（用户不存在等）
- `-1` - 默认错误（未知错误）

#### 使用方法

```javascript
import { success, error, paginated } from '../utils/response.js';

// 成功响应
return success(res, { user }, '获取用户信息成功');

// 错误响应
return error(res, '用户名和密码不能为空', 1001, 400);

// 分页数据响应
return paginated(res, list, total, page, pageSize, '获取列表成功');
```

#### 前端适配

前端 `apiService.js` 已自动适配此格式：
- 成功时：返回 `data` 字段
- 失败时：抛出错误，错误消息为 `message` 字段

## 前端开发规范

### UI 组件使用规范

**禁止使用浏览器原生弹窗**

禁止使用：`alert()`, `confirm()`, `window.alert()`, `window.confirm()`

**替代方案：**

1. **消息提示**：使用页面内的消息组件
   ```vue
   <!-- 成功消息 -->
   <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
     <CheckCircle class="w-5 h-5" />
     {{ message }}
   </div>
   
   <!-- 错误消息 -->
   <div class="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 rounded-lg flex items-center gap-3 text-rose-700 dark:text-rose-400">
     <XCircle class="w-5 h-5" />
     {{ error }}
   </div>
   ```

2. **确认操作**：使用自定义 Modal 或 Dialog 组件（参考 `src/views/settings/SettingsPage.vue`）

### 原因说明

- 浏览器原生弹窗会阻塞页面交互，用户体验差
- 原生弹窗样式无法自定义，与项目 UI 风格不一致
