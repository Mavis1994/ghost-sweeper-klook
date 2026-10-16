# Lark 多维表格 Webhook 写回配置

## 1. 建表字段（建议）
工号(文本) · 通关用时秒(数字) · 通关时间(文本) · runId(文本) · 棋盘(数字) · 幽灵数(数字)

## 2. 创建自动化
多维表格右上角「自动化」→ 新建 → 触发条件选「接收 Webhook」。
在示例数据里粘贴下面 JSON，让 Lark 识别参数：

{"employeeId":"A00123","runId":"uuid-sample","elapsedSeconds":95,"boardSize":12,"ghosts":20,"completedAt":"2026-10-16 15:30:00"}

## 3. 添加动作
动作选「新增记录」，选目标表，把字段映射到上面的 Webhook 参数
（employeeId→工号，elapsedSeconds→通关用时秒，completedAt→通关时间，runId→runId ...）。
保存并启用自动化。

## 4. 填入地址
复制 Webhook 地址，填到 config.js 的 registrationEndpoint，重新部署。

## 注意
- Webhook 地址等同写入口令，不要公开传播，被滥用时在自动化里重新生成。
- 若浏览器跨域读不到回执，页面会自动用 no-cors 发送，此时无法确认写入结果，请上线后用真实通关测试一次并检查表格。
