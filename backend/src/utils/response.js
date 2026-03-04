/**
 * 统一响应格式工具
 * 所有接口返回格式: { code, data, message }
 */

/**
 * 成功响应
 * @param {Object} res - Express response 对象
 * @param {*} data - 返回的数据
 * @param {string} message - 成功消息
 * @param {number} statusCode - HTTP 状态码，默认 200
 */
export function success(res, data = null, message = '操作成功', statusCode = 200) {
  return res.status(statusCode).json({
    code: 0,
    data,
    message
  });
}

/**
 * 错误响应
 * @param {Object} res - Express response 对象
 * @param {string} message - 错误消息
 * @param {number} code - 错误码，默认 -1
 * @param {number} statusCode - HTTP 状态码，默认 400
 */
export function error(res, message = '操作失败', code = -1, statusCode = 400) {
  return res.status(statusCode).json({
    code,
    data: null,
    message
  });
}

/**
 * 分页数据响应
 * @param {Object} res - Express response 对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页大小
 * @param {string} message - 成功消息
 */
export function paginated(res, list, total, page, pageSize, message = '获取成功') {
  return res.status(200).json({
    code: 0,
    data: {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    },
    message
  });
}

export default {
  success,
  error,
  paginated
};
