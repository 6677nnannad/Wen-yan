import { uploadToGitHub } from '../lib/github.js';

export default async function handler(req, res) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允许POST请求' });
  }

  try {
    // 检查是否有文件上传
    if (!req.body || !req.body.file) {
      return res.status(400).json({ error: '没有接收到文件' });
    }

    // 生成唯一文件名（使用时间戳）
    const timestamp = Date.now();
    const fileExtension = req.body.fileName.split('.').pop();
    const fileName = `${timestamp}.${fileExtension}`;
    
    // 指定GitHub目录路径
    const githubPath = `wenan/${fileName}`;
    
    // 上传到GitHub
    const result = await uploadToGitHub(
      githubPath,
      req.body.file,
      req.body.fileName
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: '图片上传成功',
        imageUrl: result.imageUrl,
        fileName: fileName
      });
    } else {
      res.status(500).json({
        success: false,
        error: '上传到GitHub失败'
      });
    }

  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误: ' + error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // 允许最大10MB的文件
    }
  }
};
