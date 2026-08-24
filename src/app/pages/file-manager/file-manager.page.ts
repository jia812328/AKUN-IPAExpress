import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';
import { Location } from '@angular/common';

interface FileItem {
  name: string;
  path: string;
  size: string;
  isDir: boolean;
  ext: string;
  isHidden: boolean;
  date: string;
}

@Component({
  selector: 'app-file-manager',
  templateUrl: 'file-manager.page.html',
  styleUrls: ['file-manager.page.scss'],
  standalone: false,
})
export class FileManagerPage {
  currentPath = '/storage/emulated/0';
  items: FileItem[] = [];
  filteredItems: FileItem[] = [];
  searchQuery = '';
  loading = false;
  showHidden = false;

  private allFolders: string[] = [
    // 系统标准目录
    'Android', 'DCIM', 'Download', 'Documents', 'Music', 'Pictures', 'Movies',
    'Podcasts', 'Ringtones', 'Alarms', 'Notifications', 'bluetooth', 'WiFi',
    // 应用数据目录
    'Android/data', 'Android/obb', 'Android/media',
    // 社交/通讯
    'WhatsApp', 'Telegram', 'WeChat', 'QQ', 'Tencent', 'SinaWeibo',
    // 购物/支付
    'Alipay', 'taobao', 'jd', 'pinduoduo', 'meituan',
    // 地图/出行
    'BaiduMap', 'AutoNavi', 'didi', 'gaode',
    // 视频/音乐
    'TikTok', 'bilibili', 'Kugou', 'QQMusic', 'NetEaseMusic', 'YouKu', 'iQiyi',
    // 工具
    'baidu', 'BaiduNetdisk', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo',
    // 其他
    'temp', 'cache', 'backups', 'export', 'logs', 'crash', 'debug',
    'fonts', 'icons', 'themes', 'wallpapers', 'screenshots',
    '.thumbnails', '.Trash', 'recycle',
    'UCDownloads', '360Downloads', 'QQBrowser',
    'DingTalk', 'Feishu', 'WeWork', 'WPSOffice',
    'Camera', 'Panorama', 'Burst', 'Portrait', 'TimeLapse', 'SlowMotion',
    'Editor', 'Collage', 'Filters', 'Stickers',
    'Miui', 'MIUI', 'theme', 'system', 'mt2',
    'Xender', 'ShareIt', 'ESFileExplorer',
    'AndroidStudio', 'Unity', 'Godot',
    'Videos', 'Recordings', 'Audio', 'VoiceRecorder',
    'eBooks', 'Books', 'Comics', 'Manga',
    'apk', 'backup', 'Obb', 'Data',
    'Download/Browser', 'Download/WeChat', 'Download/QQ', 'Download/Telegram',
    'Download/Torrent', 'Download/CloudMusic',
    'Pictures/Screenshots', 'Pictures/WeiXin', 'Pictures/QQ', 'Pictures/Blur',
    'Music/网易云音乐', 'Music/QQ音乐', 'Music/酷狗', 'Music/Downloads',
    'Movies/剪映', 'Movies/快影', 'Movies/Export',
  ];

  private extensions = ['ipa', 'apk', 'dylib', 'deb', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg',
    'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', '3gp', 'webm',
    'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'ape',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso',
    'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf',
    'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'vue', 'scss', 'less',
    'py', 'java', 'cpp', 'c', 'h', 'swift', 'kt', 'go', 'rs', 'rb', 'php',
    'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1',
    'p12', 'mobileprovision', 'cer', 'crt', 'key', 'pem', 'der',
    'db', 'sqlite', 'sql', 'csv', 'tsv',
    'ttf', 'otf', 'woff', 'woff2', 'eot',
    'dmg', 'app', 'exe', 'msi', 'deb', 'rpm',
    'log', 'tmp', 'bak', 'old', 'orig', 'swp',
    'part', 'crdownload', 'download', 'torrent',
    'srt', 'ass', 'vtt', 'sup', 'idx', 'sub',
    'plist', 'entitlements', 'framework', 'xcworkspace', 'xcodeproj',
    '/', '文件夹'
  ];

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private location: Location
  ) {
    this.loadDirectory('/storage/emulated/0');
  }

  get folderCount(): number { return this.items.filter(i => i.isDir).length; }
  get fileCount(): number { return this.items.filter(i => !i.isDir).length; }

  goBack() { this.location.back(); }

  generateFilesForPath(path: string): FileItem[] {
    const result: FileItem[] = [];
    const depth = path.split('/').length - 4; // 减去 /storage/emulated/0 的4层

    // 每个目录至少显示一些文件夹和文件
    // 根据路径深度决定数量
    const maxItems = Math.max(8, 30 - depth * 2);

    // 1. 添加子文件夹（从 allFolders 中匹配）
    const prefix = path === '/storage/emulated/0' ? '' : path.replace('/storage/emulated/0/', '') + '/';
    const subFolders = this.allFolders.filter(f =>
      f.startsWith(prefix) && f !== prefix && !f.substring(prefix.length).includes('/')
    ).map(f => {
      const name = f.substring(prefix.length);
      return { name, path: path + '/' + name };
    });

    // 如果没找到匹配的子文件夹，自动生成一些
    if (subFolders.length < 3) {
      const defaultNames = ['temp', 'cache', 'backup', 'export', 'data', 'logs', 'config', 'resources', 'assets', 'media', 'docs', 'images', 'videos', 'music', 'downloads', 'uploads', 'projects', 'archive', 'trash', 'share', 'sync', 'work', 'personal', 'study', 'games', 'tools', 'apps', 'plugins', 'themes', 'fonts', 'icons', 'sounds', 'records', 'captures', 'screenshots', 'photos', 'camera', 'saved', 'favorites', 'bookmarks', 'history', 'recent', 'templates', 'samples', 'examples', 'demo', 'test', 'tests', 'debug', 'release', 'build', 'dist', 'src', 'lib', 'node_modules', 'vendor', 'public', 'private', 'conf', 'config', 'settings', 'preferences', 'keychains', 'certificates', 'profiles', 'provision', 'signatures', 'entitlements', 'frameworks', 'libraries', 'bundles', 'packages', 'archives', 'compressed', 'extracted', 'imported', 'exported', 'pending', 'processed', 'completed', 'failed', 'errors', 'success', 'inbox', 'outbox', 'sent', 'received', 'shared', 'uploaded', 'downloaded', 'synced', 'local', 'remote', 'cloud', 'offline', 'online', 'cache'];

      for (let i = 0; i < 5 && subFolders.length < 8; i++) {
        const name = defaultNames[Math.floor(Math.random() * defaultNames.length)];
        if (!subFolders.find(s => s.name === name)) {
          subFolders.push({ name, path: path + '/' + name });
        }
      }
    }

    for (const folder of subFolders.slice(0, 12)) {
      result.push({
        name: folder.name,
        path: folder.path,
        size: '',
        isDir: true,
        ext: '文件夹',
        isHidden: folder.name.startsWith('.'),
        date: this.randomDate()
      });
    }

    // 2. 生成文件
    const fileCount = Math.max(5, maxItems - result.length);
    const usedNames = new Set<string>();

    for (let i = 0; i < fileCount; i++) {
      const ext = this.extensions[Math.floor(Math.random() * this.extensions.length)];
      const name = this.randomFileName(ext);
      if (usedNames.has(name)) continue;
      usedNames.add(name);

      result.push({
        name,
        path: path + '/' + name,
        size: this.randomSize(ext),
        isDir: false,
        ext,
        isHidden: name.startsWith('.'),
        date: this.randomDate()
      });
    }

    // 确保路径是 /storage/emulated/0 时包含常见目录
    if (path === '/storage/emulated/0') {
      const mustHave = ['Android', 'DCIM', 'Download', 'Documents', 'Music', 'Pictures', 'Movies', 'WhatsApp', 'Telegram', 'WeChat', 'QQ', 'Tencent', 'Alipay', 'baidu', 'bluetooth', '26imgui'];
      for (const dir of mustHave) {
        if (!result.find(r => r.name === dir)) {
          result.push({
            name: dir,
            path: '/storage/emulated/0/' + dir,
            size: '',
            isDir: true,
            ext: '文件夹',
            isHidden: false,
            date: this.randomDate()
          });
        }
      }
    }

    // 排序：文件夹在前，文件在后
    result.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  private randomFileName(ext: string): string {
    const prefixes = ['com.', 'app', 'data', 'file', 'doc', 'photo', 'img', 'vid', 'audio', 'music',
      'backup', 'export', 'config', 'setting', 'temp', 'cache', 'log', 'error', 'debug', 'info',
      'report', 'summary', 'detail', 'preview', 'thumbnail', 'cover', 'poster', 'banner', 'icon',
      'avatar', 'profile', 'bg', 'wallpaper', 'screenshot', 'screen', 'record', 'capture', 'shot',
      'download', 'upload', 'sync', 'share', 'link', 'file', 'archive', 'package', 'bundle',
      'certificate', 'key', 'profile', 'signature', 'license', 'agreement', 'contract', 'invoice',
      'receipt', 'voucher', 'ticket', 'coupon', 'card', 'pass', 'wallet', 'account', 'user',
      'system', 'kernel', 'driver', 'module', 'plugin', 'extension', 'addon', 'theme', 'skin',
      'font', 'glyph', 'emoji', 'sticker', 'gif', 'meme', 'template', 'sample', 'example',
      'project', 'source', 'code', 'script', 'binary', 'exec', 'lib', 'framework', 'engine',
      'game', 'app', 'tool', 'utility', 'widget', 'component', 'element', 'view', 'page',
      'index', 'main', 'home', 'login', 'signup', 'profile', 'settings', 'config', 'help',
      'readme', 'changelog', 'license', 'credits', 'notice', 'disclaimer', 'policy',
      'spring', 'summer', 'autumn', 'winter', 'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
      'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
      'v1', 'v2', 'v3', 'v4', 'v5', '1.0', '2.0', '3.0', '4.0', '5.0',
      '2024', '2023', '2022', '2021', '2020', '2019',
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(Math.random() * 9999);
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    if (ext === 'ipa') return ['WeChat', 'TikTok', 'QQ', 'YouTube', 'Twitter', 'Instagram', 'Facebook', 'WhatsApp', 'Telegram', 'Shadowrocket', 'Quantumult', 'Surge', 'Stash', 'Loon', 'SingBox'][Math.floor(Math.random() * 15)] + '_v' + (Math.random() * 10).toFixed(1) + '.ipa';
    if (ext === 'dylib') return ['CydiaSubstrate', 'PreferenceLoader', 'AppSync', 'Flex3', 'Reveal2', 'SSLKillSwitch', 'DYLibrary', 'libhooker', 'Substitute', 'TweakInject'][Math.floor(Math.random() * 10)] + '.dylib';
    if (ext === 'mobileprovision') return 'embedded_' + this.randomHex(8) + '.mobileprovision';
    if (ext === 'p12') return 'Cert_' + this.randomHex(6) + '.p12';
    if (ext === 'apk') return ['WeChat', 'QQ', 'Alipay', 'Taobao', 'Douyin', 'Meituan', 'Xiaohongshu', 'Bilibili', 'DiDi', 'NetEaseMusic'][Math.floor(Math.random() * 10)] + '_v' + (Math.random() * 10).toFixed(1) + '.apk';
    if (ext === 'jpg' || ext === 'jpeg') return 'IMG_' + date.getFullYear() + month + day + '_' + String(Math.floor(Math.random() * 900000) + 100000) + '.' + ext;
    if (ext === 'png') return 'Screenshot_' + date.getFullYear() + month + day + '_' + String(Math.floor(Math.random() * 90000) + 10000) + '.png';
    if (ext === 'mp4') return 'VID_' + date.getFullYear() + month + day + '_' + String(Math.floor(Math.random() * 900000) + 100000) + '.mp4';
    if (ext === 'mp3') return 'track_' + String(Math.floor(Math.random() * 99) + 1) + '.mp3';
    if (ext === 'pdf') return ['report', 'document', 'contract', 'manual', 'guide', 'ebook', 'catalog', 'brochure', 'invoice', 'receipt'][Math.floor(Math.random() * 10)] + '_' + date.getFullYear() + '.pdf';
    if (['doc', 'docx'].includes(ext)) return ['工作报告', '项目计划', '会议纪要', '需求文档', '设计文档', '技术方案', '周报', '月报', '总结', '简历'][Math.floor(Math.random() * 10)] + '_' + date.getFullYear() + '.' + ext;
    if (['xls', 'xlsx'].includes(ext)) return ['财务报表', '数据统计', '预算表', '考勤表', '库存表', '销售记录', '客户名单', '项目进度', '评分表', '排班表'][Math.floor(Math.random() * 10)] + '_' + date.getFullYear() + '.' + ext;
    if (ext === 'zip') return ['archive', 'backup', 'data', 'files', 'photos', 'documents', 'projects', 'export', 'dump', '压缩包'][Math.floor(Math.random() * 10)] + '_' + date.getFullYear() + '.zip';
    if (ext === 'json') return ['config', 'data', 'manifest', 'package', 'info', 'settings', 'preferences', 'state', 'cache', 'index'][Math.floor(Math.random() * 10)] + '.json';
    if (ext === 'txt') return ['notes', 'readme', 'changelog', 'todo', '备忘录', '日记', '草稿', '清单', '记录', '笔记'][Math.floor(Math.random() * 10)] + '.txt';
    if (ext === 'md') return ['README', 'CHANGELOG', 'TODO', 'NOTES', 'SUMMARY', 'INDEX', 'SETUP', 'GUIDE', 'MANUAL', 'HELP'][Math.floor(Math.random() * 10)] + '.md';

    return prefix + '_' + num + '.' + ext;
  }

  private randomHex(len: number): string {
    return Array.from({length: len}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  private randomSize(ext: string): string {
    if (ext === '文件夹' || ext === '/') return '';
    if (['mp4', 'mov', 'mkv', 'avi'].includes(ext)) {
      const mb = Math.floor(Math.random() * 2000) + 50;
      return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb + ' MB';
    }
    if (['ipa', 'apk'].includes(ext)) return (Math.floor(Math.random() * 300) + 10) + ' MB';
    if (['dylib', 'deb'].includes(ext)) return (Math.floor(Math.random() * 5000) + 100) + ' KB';
    if (['zip', 'rar', '7z', 'iso'].includes(ext)) return (Math.floor(Math.random() * 500) + 5) + ' MB';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return (Math.floor(Math.random() * 10) + 0.1).toFixed(1) + ' MB';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(ext)) return (Math.floor(Math.random() * 50) + 2) + ' MB';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return (Math.floor(Math.random() * 20) + 0.5).toFixed(1) + ' MB';
    if (['p12', 'mobileprovision', 'cer', 'key'].includes(ext)) return (Math.floor(Math.random() * 10) + 1) + ' KB';
    if (['json', 'xml', 'txt', 'md', 'csv'].includes(ext)) return (Math.floor(Math.random() * 500) + 1) + ' KB';
    if (['html', 'css', 'js', 'ts', 'py', 'java', 'cpp', 'go', 'rs'].includes(ext)) return (Math.floor(Math.random() * 200) + 1) + ' KB';
    if (['log', 'tmp', 'bak', 'cache'].includes(ext)) return (Math.floor(Math.random() * 100) + 0.5).toFixed(1) + ' MB';
    const kb = Math.floor(Math.random() * 5000) + 10;
    return kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
  }

  private randomDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    return d.toLocaleDateString('zh-CN');
  }

  loadDirectory(path: string) {
    this.loading = true;
    this.currentPath = path;
    setTimeout(() => {
      this.items = this.generateFilesForPath(path);
      this.filteredItems = [...this.items];
      this.loading = false;
    }, 300);
  }

  navigateTo(path: string) { this.loadDirectory(path); }
  goHome() { this.loadDirectory('/storage/emulated/0'); }

  openItem(item: FileItem) {
    if (item.isDir) {
      this.loadDirectory(item.path);
    } else {
      this.alertCtrl.create({
        header: item.name,
        message: `路径: ${item.path}<br>大小: ${item.size}`,
        buttons: [
          { text: '详细信息', handler: () => {
            this.alertCtrl.create({
              header: '文件详情',
              message: `文件名: ${item.name}<br>路径: ${item.path}<br>大小: ${item.size}<br>类型: ${item.ext.toUpperCase()}<br>修改日期: ${item.date}`,
              buttons: ['关闭']
            }).then(a => a.present());
          }},
          { text: '复制路径', handler: () => navigator.clipboard?.writeText(item.path) },
          { text: '分享', handler: () => {} },
          { text: '删除', role: 'destructive', handler: () => {
            this.items = this.items.filter(i => i.name !== item.name);
            this.filteredItems = [...this.items];
          }},
          { text: '取消', role: 'cancel' }
        ]
      }).then(a => a.present());
    }
  }

  showActions(event: any, item: FileItem, index: number) {
    event.stopPropagation();
    const buttons: any[] = [
      { text: '详细信息', handler: () => {
        this.alertCtrl.create({
          header: '文件详情',
          message: `文件名: ${item.name}<br>路径: ${item.path}<br>大小: ${item.size}<br>类型: ${item.ext.toUpperCase()}<br>修改日期: ${item.date}`,
          buttons: ['关闭']
        }).then(a => a.present());
      }},
      { text: '复制路径', handler: () => navigator.clipboard?.writeText(item.path) },
      { text: '重命名', handler: () => {
        this.alertCtrl.create({
          header: '重命名',
          inputs: [{ name: 'name', type: 'text', value: item.name }],
          buttons: ['取消', { text: '确定', handler: (data) => {
            if (data.name) { item.name = data.name; this.filteredItems = [...this.items]; }
          }}]
        }).then(a => a.present());
      }},
    ];
    if (!item.isDir) {
      buttons.push({ text: '分享', handler: () => {} });
    }
    buttons.push(
      { text: '删除', role: 'destructive', handler: () => {
        this.items.splice(index, 1);
        this.filteredItems = [...this.items];
      }},
      { text: '取消', role: 'cancel' }
    );

    this.alertCtrl.create({
      header: item.name,
      buttons: buttons
    }).then(a => a.present());
  }

  filterFiles() {
    const q = this.searchQuery.toLowerCase();
    this.filteredItems = q ? this.items.filter(i => i.name.toLowerCase().includes(q)) : [...this.items];
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['ipa'].includes(ext)) return 'cube-outline';
    if (['dylib', 'deb'].includes(ext)) return 'code-slash-outline';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image-outline';
    if (['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', '3gp', 'webm'].includes(ext)) return 'videocam-outline';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'ape'].includes(ext)) return 'musical-notes-outline';
    if (['pdf'].includes(ext)) return 'document-outline';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(ext)) return 'archive-outline';
    if (['txt', 'md', 'json', 'xml', 'yml', 'yaml', 'toml', 'ini', 'cfg', 'conf', 'csv', 'tsv'].includes(ext)) return 'document-text-outline';
    if (['apk'].includes(ext)) return 'phone-portrait-outline';
    if (['p12', 'mobileprovision', 'cer', 'crt', 'key', 'pem', 'der'].includes(ext)) return 'key-outline';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'document-outline';
    if (['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'vue', 'scss', 'less'].includes(ext)) return 'code-outline';
    if (['py', 'java', 'cpp', 'c', 'h', 'swift', 'kt', 'go', 'rs', 'rb', 'php', 'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1'].includes(ext)) return 'terminal-outline';
    if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) return 'text-outline';
    if (['db', 'sqlite', 'sql'].includes(ext)) return 'server-outline';
    if (['log', 'tmp', 'bak', 'cache', 'old', 'orig'].includes(ext)) return 'warning-outline';
    if (['srt', 'ass', 'vtt', 'sup', 'idx', 'sub'].includes(ext)) return 'chatbubbles-outline';
    if (['plist', 'entitlements', 'framework', 'xcworkspace', 'xcodeproj'].includes(ext)) return 'construct-outline';
    return 'document-outline';
  }

  getFileColor(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'ipa') return 'rgba(0,122,255,0.15)';
    if (ext === 'dylib') return 'rgba(191,90,242,0.15)';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'rgba(52,199,89,0.15)';
    if (['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', '3gp', 'webm'].includes(ext)) return 'rgba(255,69,58,0.15)';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'ape'].includes(ext)) return 'rgba(255,149,0,0.15)';
    if (['zip', 'rar', '7z', 'iso'].includes(ext)) return 'rgba(255,149,0,0.15)';
    if (ext === 'apk') return 'rgba(0,200,83,0.15)';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'rgba(255,59,48,0.15)';
    if (['p12', 'mobileprovision', 'cer', 'crt', 'key', 'pem', 'der'].includes(ext)) return 'rgba(255,149,0,0.15)';
    if (['html', 'css', 'js', 'ts', 'py', 'java', 'cpp', 'go', 'rs', 'swift', 'kt'].includes(ext)) return 'rgba(0,122,255,0.15)';
    if (['log', 'tmp', 'bak', 'cache'].includes(ext)) return 'rgba(142,142,147,0.15)';
    return 'rgba(142,142,147,0.15)';
  }

  getFileIconColor(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'ipa') return '#007aff';
    if (ext === 'dylib') return '#bf5af2';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return '#34c759';
    if (['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', '3gp', 'webm'].includes(ext)) return '#ff453a';
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'ape'].includes(ext)) return '#ff9500';
    if (['zip', 'rar', '7z', 'iso'].includes(ext)) return '#ff9500';
    if (ext === 'apk') return '#00c853';
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return '#ff3b30';
    if (['p12', 'mobileprovision', 'cer', 'crt', 'key', 'pem', 'der'].includes(ext)) return '#ff9500';
    if (['html', 'css', 'js', 'ts', 'py', 'java', 'cpp', 'go', 'rs', 'swift', 'kt'].includes(ext)) return '#007aff';
    if (['log', 'tmp', 'bak', 'cache'].includes(ext)) return '#8e8e93';
    return '#8e8e93';
  }
}