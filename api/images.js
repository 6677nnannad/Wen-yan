import { getImagesList } from '../lib/github.js';

export default async function handler(req, res) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只允许GET请求' });
  }

  try {
    // 从GitHub获取图片列表
    const images = await getImagesList();
    
    res.status(200).json({
      success: true,
      images: images,
      count: images.length
    });

  } catch (error) {
    console.error('获取图片列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取图片列表失败: ' + error.message
    });
  }
}
