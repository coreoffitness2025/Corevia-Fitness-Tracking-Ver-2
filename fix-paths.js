const fs = require('fs');
const path = require('path');

// dist/index.html 파일 경로 수정
function fixIndexHtmlPaths() {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // 절대 경로를 상대 경로로 변경
    content = content.replace(/src="\/assets\//g, 'src="./assets/');
    content = content.replace(/href="\/assets\//g, 'href="./assets/');
    
    fs.writeFileSync(indexPath, content);
    console.log('✅ 성공적으로 dist/index.html의 경로를 수정했습니다.');
  } catch (err) {
    console.error('❌ dist/index.html 파일 수정 중 오류 발생:', err);
  }
}

// 실행
fixIndexHtmlPaths(); 