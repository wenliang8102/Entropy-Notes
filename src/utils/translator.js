/**
 * 翻译工具函数 - 将后端返回的英文错误消息翻译为中文
 */

// 错误消息翻译映射表
const errorMessageMap = {
    // 认证相关错误
    'Please provide both username and password.': '请提供用户名和密码。',
    'User already exists.': '用户已存在。',
    'User registered successfully!': '用户注册成功！',
    'Invalid credentials.': '用户名或密码错误。',
    'Login successful!': '登录成功！',
    'No token, authorization denied': '未提供令牌，授权被拒绝。',
    'Token is not valid': '令牌无效。',

    // 笔记相关错误
    'Note not found': '笔记未找到。',
    'Not authorized': '未授权。',
    'Conflict: The note has been updated by another source.': '冲突：笔记已被其他来源更新。',
    'Note removed successfully': '笔记删除成功。',

    // 通用错误
    'Server error': '服务器错误。',
    'Server Error': '服务器错误。',

    // 保留已有的中文消息（已经是中文的不再翻译）
    '登录失败，响应格式不正确': '登录失败，响应格式不正确。',
    '登录时发生未知错误': '登录时发生未知错误。',
    '注册时发生未知错误': '注册时发生未知错误。',
    '注册成功！请现在登录。': '注册成功！请现在登录。',
};

/**
 * 翻译错误消息
 * @param {string} message - 原始错误消息
 * @returns {string} 翻译后的中文消息
 */
export function translateMessage(message) {
    if (!message || typeof message !== 'string') {
        return message || '未知错误';
    }

    // 先去除首尾空格
    const trimmedMessage = message.trim();

    // 检查是否有精确匹配
    if (errorMessageMap[trimmedMessage]) {
        return errorMessageMap[trimmedMessage];
    }

    // 检查是否有部分匹配（用于包含前缀或后缀的情况）
    for (const [key, value] of Object.entries(errorMessageMap)) {
        if (trimmedMessage.includes(key)) {
            return value;
        }
    }

    // 如果没有匹配，返回原始消息
    return trimmedMessage;
}

/**
 * 批量翻译消息数组
 * @param {string[]} messages - 消息数组
 * @returns {string[]} 翻译后的消息数组
 */
export function translateMessages(messages) {
    if (!Array.isArray(messages)) {
        return messages;
    }
    return messages.map(msg => translateMessage(msg));
}
