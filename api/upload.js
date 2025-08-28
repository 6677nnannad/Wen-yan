// 文件位置：api/upload.js
// 这个文件处理图片上传功能

import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 禁用默认的body解析，因为我们需要处理multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  // 只处理POST请求（上传）
  if (req.method === 'POST') {
    try {
      // 解析上传的文件
      const form = new IncomingForm({
        maxFileSize: 10 * 1024 * 1024, // 10MB限制
        allowEmptyFiles: false,
      });

      const [fields, files] = await form.parse(req);
      const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image;

      if (!uploadedFile) {
        return res.status(400).json({ error: '没有上传文件' });
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(uploadedFile.mimetype)) {
        return res.status(400).json({ error: '不支持的文件格式，请上传图片文件' });
      }

      // 生成唯一文件名
      const fileExtension = path.extname(uploadedFile.originalFilename || '');
      const fileName = `${uuidv4()}${fileExtension}`;
      
      // 确保images目录存在
      const imagesDir = path.join(process.cwd(), 'public', 'images');
      try {
        await fs.access(imagesDir);
      } catch {
        await fs.mkdir(imagesDir, { recursive: true });
      }

      // 移动文件到目标位置
      const targetPath = path.join(imagesDir, fileName);
      await fs.copyFile(uploadedFile.filepath, targetPath);

      // 保存图片信息到JSON文件
      const metaPath = path.join(process.cwd(), 'data', 'images.json');
      const dataDir = path.join(process.cwd(), 'data');
      
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      let imagesList = [];
      try {
        const data = await fs.readFile(metaPath, 'utf8');
        imagesList = JSON.parse(data);
      } catch {
        // 文件不存在，创建新的数组
      }

      const imageInfo = {
        id: uuidv4(),
        name: uploadedFile.originalFilename || fileName,
        fileName: fileName,
        url: `/images/${fileName}`,
        size: uploadedFile.size,
        type: uploadedFile.mimetype,
        uploadTime: new Date().toISOString(),
      };

      imagesList.unshift(imageInfo); // 添加到开头，最新的在前面
      await fs.writeFile(metaPath, JSON.stringify(imagesList, null, 2));

      res.status(200).json({
        success: true,
        message: '上传成功',
        image: imageInfo
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: '上传失败：' + error.message });
    }
  } else {
    res.status(405).json({ error: '不支持的请求方法' });
  }
}
