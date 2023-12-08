// ==UserScript==
// @name         抖音插件
// @namespace    https://github.com/QYG2297248353/tampermonkey_douyin
// @version      v1.0.0
// @description  自动跳过广告
// @author       新疆萌森软件开发工作室
// @match        *://*.douyin.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @run-at       document-end
// @grant        GM_log
// ==/UserScript==

(function () {
    'use strict';

    const nodeClass = "u0N5WOYm"

    // 存储之前的所有 MutationObserver
    var previousObservers = [];

    // 异步函数，用于延迟指定的毫秒数
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取节点DOM
    async function findConsecutiveChildElements(containerClass) {
        var container = document.querySelector("." + containerClass);
        var childElements = container.children;
        var consecutiveCount = 0;
        var result = [];

        for (var i = 0; i < childElements.length; i++) {
            if (childElements[i].children.length > 0) {
                consecutiveCount++;
                result.push(childElements[i]);

                if (consecutiveCount === 3) {
                    // 如果之前有观察器，则先停止它们
                    previousObservers.forEach(observer => {
                        observer.disconnect();
                    });

                    // 针对每个找到的节点设置观察器
                    result.forEach(node => {
                        setupMutationObserver(node);
                    });

                    // 中间节点
                    var middleNode = result[1];

                    // 节点文本
                    var nodeText = middleNode.innerText;
                    GM_log("节点文本：" + nodeText);

                    // 判断是否存在 “广告” 字样
                    if (nodeText.indexOf("广告") !== -1) {
                        GM_log("跳过广告")
                    }

                    // 退出循环
                    break;
                }
            } else {
                // Reset consecutive count and result if no sub-elements found
                consecutiveCount = 0;
                result = [];
            }
        }

        // 如果没有找到节点，则抛出异常
        GM_log("consecutiveCount：" + consecutiveCount);
        if (consecutiveCount !== 3) {
            throw new Error("没有找到节点");
        }
    }

    // 设置 MutationObserver 的函数
    function setupMutationObserver(targetNode) {
        // 观察者的选项（要观察哪些突变）
        var config = { childList: true, subtree: false };

        // 创建一个链接到回调函数的观察者实例
        var observer = new MutationObserver(handleMutation);

        // 开始观察目标节点的配置突变
        observer.observe(targetNode, config);

        // 存储当前观察器，以便在下次设置新的观察器时可以停止它
        previousObservers.push(observer);
    }

    // 观察到突变时要调用的函数
    function handleMutation(mutationsList) {
        for (var mutation of mutationsList) {
            // 处理变化
            if (mutation.type === 'childList') {
                findConsecutiveChildElements(nodeClass);
            }
        }
    }

    // 异步循环执行函数
    async function asyncLoop() {
        while (true) {
            try {
                await findConsecutiveChildElements(nodeClass);
                break
            } catch (error) {
                GM_log("查找节点失败，正在重试");
                await delay(1000);
            }
        }
    }

    // 异步循环执行函数
    asyncLoop();

    GM_log("抖音插件已启动");
})();