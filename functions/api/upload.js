// ============================================================================
// 图片上传接口：POST /api/upload
//
// 【重要】当前 wrangler.toml 未配置 R2 Bucket Binding，因此：
//   a) 暂不支持 multipart/form-data 文件上传持久化
//   b) 替代方案：前端将图片通过 FileReader 转为 base64 Data URL 后，
//      通过 posts API 的 images 字段提交，后端直接存入 D1 数据库
//      （适用于小图/头像，单张图片建议 < 500KB）
//
// 如需生产环境文件上传，请执行：
//   1. 在 wrangler.toml 中添加：
//      [[r2_buckets]]
//      binding = "MY_BUCKET"
//      bucket_name = "linli-community-uploads"
//   2. 执行 `npx wrangler r2 bucket create linli-community-uploads`
//   3. 在本文件中取消下方注释代码，删除 return createErrorResponse 行
//   4. 部署后即可使用真正的文件上传
// ============================================================================
import { createResponse, createErrorResponse } from '../lib/response.js'
import { requireAuth } from '../lib/auth.js'

export async function onRequestPost(context) {
  try {
    const authError = await requireAuth(context)
    if (authError) return authError

    // ================================================================
    // 【启用 R2 后的上传逻辑（取消注释即可使用）】
    // ================================================================
    // const formData = await context.request.formData()
    // const file = formData.get('file')
    // if (!file) {
    //   return createErrorResponse(400, '未选择文件')
    // }
    //
    // // 验证文件类型
    // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    // if (!allowedTypes.includes(file.type)) {
    //   return createErrorResponse(400, '不支持的文件类型，仅支持 JPEG/PNG/GIF/WebP')
    // }
    //
    // // 限制文件大小 (5MB)
    // const maxSize = 5 * 1024 * 1024
    // if (file.size > maxSize) {
    //   return createErrorResponse(400, '文件大小超过限制（最大 5MB）')
    // }
    //
    // // 生成唯一文件名
    // const ext = file.name.split('.').pop() || 'jpg'
    // const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    //
    // // 上传到 R2
    // const object = await context.env.MY_BUCKET.put(key, await file.arrayBuffer(), {
    //   httpMetadata: { contentType: file.type }
    // })
    //
    // // 返回可访问的 URL
    // const url = `/api/uploads/${key}`
    // return createResponse({ url, key }, '上传成功')

    return createErrorResponse(501, '文件上传功能暂不可用：未配置 R2 Bucket。请改用 base64 方案，通过 posts API 的 images 字段提交。')
  } catch (error) {
    console.error('Upload error:', error)
    return createErrorResponse(500, '上传失败', error.message)
  }
}
