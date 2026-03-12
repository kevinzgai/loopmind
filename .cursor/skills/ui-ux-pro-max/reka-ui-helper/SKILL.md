---
name: reka-ui-helper
description: Reka UI 组件库文档助手。提供 Reka UI (Vue 无障碍组件库) 所有组件的详细使用说明、API 参考和示例代码。支持查询 55+ 个组件包括表单、日期、颜色、通用组件等。
---

# Reka UI 组件库助手

Reka UI 是一个 Vue 的无障碍组件库，提供了一套完整的、符合 WAI-ARIA 标准的 UI 组件。

## 何时使用此技能

当用户询问以下问题时激活此技能：
- "Reka UI 的 XXX 组件怎么用"
- "Reka UI checkbox/accordion/select 等组件的用法"
- "Vue 无障碍组件"
- "Reka UI API 文档"
- "如何使用 Reka UI 的 XXX 功能"

## 组件分类

### 表单组件 (Form)
- **checkbox** - 复选框，支持不确定状态
- **combobox** - 组合框，带自动完成功能的输入框
- **editable** - 可编辑文本区域
- **listbox** - 列表框，用于选择列表项
- **number-field** - 数字输入框
- **label** - 标签组件
- **pin-input** - 验证码/PIN 码输入
- **radio-group** - 单选按钮组
- **select** - 下拉选择框
- **slider** - 滑块
- **switch** - 开关
- **tags-input** - 标签输入
- **toggle** - 切换按钮
- **toggle-group** - 切换按钮组
- **autocomplete** - 自动完成输入

### 日期组件 (Dates)
- **calendar** - 日历
- **range-calendar** - 范围日历
- **date-field** - 日期输入
- **date-picker** - 日期选择器
- **date-range-field** - 日期范围输入
- **date-range-picker** - 日期范围选择器
- **time-field** - 时间输入
- **time-range-field** - 时间范围输入
- **month-picker** - 月份选择器
- **month-range-picker** - 月份范围选择器
- **year-picker** - 年份选择器
- **year-range-picker** - 年份范围选择器

### 颜色组件 (Colors)
- **color-area** - 颜色区域选择器
- **color-field** - 颜色输入框
- **color-slider** - 颜色滑块
- **color-swatch** - 颜色样本
- **color-swatch-picker** - 颜色样本选择器

### 通用组件 (General)
- **accordion** - 手风琴，可折叠内容
- **alert-dialog** - 警告对话框
- **aspect-ratio** - 宽高比容器
- **avatar** - 头像
- **collapsible** - 可折叠容器
- **context-menu** - 上下文菜单
- **dialog** - 对话框
- **dropdown-menu** - 下拉菜单
- **hover-card** - 悬停卡片
- **menubar** - 菜单栏
- **navigation-menu** - 导航菜单
- **pagination** - 分页
- **popover** - 气泡弹窗
- **progress** - 进度条
- **scroll-area** - 滚动区域
- **separator** - 分隔线
- **splitter** - 分割器
- **stepper** - 步骤条
- **tabs** - 标签页
- **toast** - 通知
- **toolbar** - 工具栏
- **tooltip** - 提示
- **tree** - 树形组件

## 使用方法

当用户询问某个组件时：

1. 从 `references/` 目录读取对应的组件文档
2. 提供组件的功能说明、安装方法、基本用法
3. 详细说明 API 参数、事件、插槽
4. 提供常见使用示例

## 文档文件位置

所有组件文档保存在 `references/` 目录下：
- `references/checkbox.md` - 复选框文档
- `references/accordion.md` - 手风琴文档
- `references/select.md` - 选择框文档
- `references/color-picker.md` - 颜色选择器
- ... 等等

## 通用特性

所有 Reka UI 组件都支持：
- **无障碍访问** - 符合 WAI-ARIA 标准
- **键盘导航** - 完整的键盘支持
- **受控/非受控模式** - 灵活的状态管理
- **Composition** - 支持 asChild 属性进行组件组合
- **CSS 变量** - 提供 CSS 自定义属性
- **数据属性** - 通过 data-* 属性进行样式定制

## 安装

```bash
npm add reka-ui
# 或
pnpm add reka-ui
# 或
yarn add reka-ui
```

## 基本用法示例

```vue
<script setup>
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'
</script>

<template>
  <CheckboxRoot>
    <CheckboxIndicator />
  </CheckboxRoot>
</template>
```
