// 文件位置：api/image/[id].js
// 这个文件处理获取单个图片信息和删除图片的功能
// 注意：文件名必须是 [id].js，包括方括号

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

  const { id } = req.query;

  // 处理GET请求（获取单个图片信息）
  if (req.method === 'GET') {
    try {
      const metaPath = path.join(process.cwd(), 'data', 'images.json');
      
      let imagesList = [];
      try {
        const data = await fs.readFile(metaPath, 'utf8');
        imagesList = JSON.parse(data);
      } catch {
        return res.status(404).json({ error: '图片不存在' });
      }

      const image = imagesList.find(img => img.id === id);
      if (!image) {
        return res.status(404).json({ error: '图片不存在' });
      }

      res.status(200).json({
        success: true,
        image: {
          ...image,
          url: `https://wen-yan13.vercel.app${image.url}`
        }
      });

    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ error: '获取图片信息失败：' + error.message });
    }
  } 
  
  // 处理DELETE请求（删除图片）
  else if (req.method === 'DELETE') {
    try {
      const metaPath = path.join(process.cwd(), 'data', 'images.json');
      
      let imagesList = [];
      try {
        const data = await fs.readFile(metaPath, 'utf8');
        imagesList = JSON.parse(data);
      } catch {
        return res.status(404).json({ error: '图片不存在' });
      }

      const imageIndex = imagesList.findIndex(img => img.id === id);
      if (imageIndex === -1) {
        return res.status(404).json({ error: '图片不存在' });
      }

      const image = imagesList[imageIndex];
      
      // 删除物理文件
      try {
        const imagePath = path.join(process.cwd(), 'public', 'images', image.fileName);
        await fs.unlink(imagePath);
      } catch (error) {
        console.log('File already deleted or not found:', error.message);
      }

      // 从列表中移除
      imagesList.splice(imageIndex, 1);
      await fs.writeFile(metaPath, JSON.stringify(imagesList, null, 2));

      res.status(200).json({
        success: true,
        message: '图片删除成功'
      });

    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: '删除图片失败：' + error.message });
    }
  } 
  
  else {
    res.status(405).json({ error: '不支持的请求方法' });
  }
}
