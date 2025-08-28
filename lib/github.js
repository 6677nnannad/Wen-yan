// GitHub配置
const GITHUB_OWNER = '6677nnannad';      // 您的GitHub用户名
const GITHUB_REPO = 'Wen-yan';           // 仓库名
const GITHUB_PATH = 'wenan';             // 指定目录
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 从环境变量获取token

// 上传图片到GitHub
export async function uploadToGitHub(filePath, fileContent, originalFileName) {
  try {
    // 构建API URL
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    
    // 将文件内容转换为base64
    const base64Content = Buffer.from(fileContent).toString('base64');
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify({
        message: `上传图片: ${originalFileName}`,
        content: base64Content,
        branch: 'main'
      })
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        imageUrl: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${filePath}`
      };
    } else {
      console.error('GitHub API错误:', result);
      return { success: false, error: result.message };
    }

  } catch (error) {
    console.error('上传到GitHub失败:', error);
    return { success: false, error: error.message };
  }
}

// 获取图片列表
export async function getImagesList() {
  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Vercel-Serverless-Function'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API返回错误: ${response.status}`);
    }

    const files = await response.json();
    
    // 过滤出图片文件并构建返回数据
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = files
      .filter(file => 
        !file.name.startsWith('.') && 
        imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      )
      .map(file => ({
        name: file.name,
        url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${GITHUB_PATH}/${file.name}`,
        size: file.size,
        uploadTime: file.name.split('.')[0] // 从文件名提取时间戳
      }));

    return images;

  } catch (error) {
    console.error('获取图片列表失败:', error);
    throw error;
  }
}
