// api/upload.js
export default async function handler(request, response) {
  // 1. 设置返回给前端的数据格式为 JSON
  response.setHeader('Content-Type', 'application/json');

  // 2. 检查请求方法是否是 POST，如果不是则返回错误
  if (request.method !== 'POST') {
    return response.status(405).json({ error: '只允许 POST 请求' });
  }

  try {
    // 3. 打印日志，告诉我们函数开始运行了（这会在 Vercel 日志中看到）
    console.log('开始处理图片上传请求...');

    // 4. 告诉前端“上传成功”，并返回一个示例图片链接
    // 这里我们先固定返回一个成功消息，后续再教你怎么传真实图片
    response.status(200).json({
      success: true,
      message: '图片上传功能已连接成功！',
      imageUrl: 'https://placekitten.com/200/300' // 这是一只随机小猫的图片，用于测试
    });

  } catch (error) {
    // 5. 如果发生错误，打印错误日志并返回错误信息
    console.error('上传出错:', error);
    response.status(500).json({ error: '服务器内部错误' });
  }
}
