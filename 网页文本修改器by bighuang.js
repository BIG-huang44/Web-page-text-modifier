// ==UserScript==
// @name         网页文本修改器
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  允许通过右键菜单修改网页上选中的文本
// @author       You
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 添加自定义样式
    GM_addStyle(`
        .text-edit-popup {
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
        }
        .text-edit-textarea {
            min-width: 200px;
            min-height: 100px;
            margin-bottom: 10px;
        }
        .text-edit-buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
    `);

    // 创建编辑弹窗
    function createEditPopup(x, y, originalText, targetElement) {
        const popup = document.createElement('div');
        popup.className = 'text-edit-popup';
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';

        const textarea = document.createElement('textarea');
        textarea.className = 'text-edit-textarea';
        textarea.value = originalText;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'text-edit-buttons';

        const saveButton = document.createElement('button');
        saveButton.textContent = '保存';
        saveButton.onclick = () => {
            targetElement.textContent = textarea.value;
            document.body.removeChild(popup);
        };

        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.onclick = () => {
            document.body.removeChild(popup);
        };

        buttonsDiv.appendChild(saveButton);
        buttonsDiv.appendChild(cancelButton);
        popup.appendChild(textarea);
        popup.appendChild(buttonsDiv);

        return popup;
    }

    // 处理选中文本的函数
    function handleSelectedText() {
        const selection = window.getSelection();
        if (selection.toString().trim()) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const targetElement = container.nodeType === 3 ? container.parentNode : container;

            const rect = range.getBoundingClientRect();
            const x = rect.left + window.scrollX;
            const y = rect.bottom + window.scrollY;

            const popup = createEditPopup(x, y, selection.toString(), targetElement);
            document.body.appendChild(popup);
            return true;
        }
        return false;
    }

    // 注册 Tampermonkey 菜单命令
    GM_registerMenuCommand("修改选中文本", function() {
        if (!handleSelectedText()) {
            GM_notification({
                text: "请先选择要修改的文本",
                timeout: 2000
            });
        }
    });

    // 添加快捷键支持
    document.addEventListener('keydown', function(e) {
        // 支持 Windows(Ctrl+E) 和 Mac(Command+E)
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            handleSelectedText();
        }
    });
})();