// 文件位置：api/images.js
// 这个文件处理获取所有图片列表的功能

import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // 设置CORS头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只处理GET请求（获取图片列表）
  if (req.method === 'GET') {
    try {
      const metaPath = path.join(process.cwd(), 'data', 'images.json');
      
      let imagesList = [];
      try {
        const data = await fs.readFile(metaPath, 'utf8');
        imagesList = JSON.parse(data);
      } catch {
        // 文件不存在或为空，返回空数组
      }

      // 验证图片文件是否仍然存在
      const validImages = [];
      for (const image of imagesList) {
        try {
          const imagePath = path.join(process.cwd(), 'public', 'images', image.fileName);
          await fs.access(imagePath);
          validImages.push({
            ...image,
            url: `https://wen-yan13.vercel.app${image.url}`
          });
        } catch {
          // 文件不存在，跳过
          console.log(`Image file not found: ${image.fileName}`);
        }
      }

      // 如果有文件被清理，更新JSON文件
      if (validImages.length !== imagesList.length) {
        await fs.writeFile(metaPath, JSON.stringify(validImages, null, 2));
      }

      res.status(200).json({
        success: true,
        images: validImages,
        count: validImages.length
      });

    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ error: '获取图片列表失败：' + error.message });
    }
  } else {
    res.status(405).json({ error: '不支持的请求方法' });
  }
}
