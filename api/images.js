// 图片获取API - 负责从GitHub获取图片列表
export default async function handler(req, res) {
  // 设置CORS头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只允许GET请求', success: false });
  }

  try {
    // 从GitHub获取图片列表
    const images = await getImagesFromGitHub();
    
    res.status(200).json({
      success: true,
      images: images,
      count: images.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取图片错误:', error);
    res.status(500).json({
      success: false,
      error: '获取图片列表失败: ' + error.message
    });
  }
}

// 从GitHub获取图片列表
async function getImagesFromGitHub() {
  try {
    const GITHUB_OWNER = '6677nnannad';
    const GITHUB_REPO = 'Wen-yan';
    const GITHUB_PATH = 'wenan';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Wenyan-Image-Server'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status}`);
    }

    const files = await response.json();

    // 过滤出图片文件
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const images = files
      .filter(file => file.type === 'file' && 
        imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext)))
      .map(file => ({
        name: file.name,
        url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${GITHUB_PATH}/${file.name}`,
        size: file.size,
        uploadTime: file.name.split('.')[0], // 从文件名提取时间戳
        githubUrl: file.html_url
      }))
      .sort((a, b) => b.uploadTime - a.uploadTime); // 按时间倒序排列

    return images;

  } catch (error) {
    console.error('GitHub获取失败:', error);
    throw error;
  }
}
