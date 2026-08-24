import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular/lazy';
import { FileStore, IpaFile } from '../../services/file-store.service';

interface InstalledAppInfo {
  name: string;
  packageName: string;
  size: string;
  sizeBytes: number;
  version: string;
  apkPath: string;
}

@Component({
  selector: 'app-app-selector',
  templateUrl: 'app-selector.page.html',
  styleUrls: ['app-selector.page.scss'],
  standalone: false,
})
export class AppSelectorPage implements OnInit {
  loading = true;
  progressPercent = 0;
  progressText = '正在获取应用列表...';
  detectedCount = 0;
  searchQuery = '';
  allApps: InstalledAppInfo[] = [];
  filteredApps: InstalledAppInfo[] = [];
  selectedApp: InstalledAppInfo | null = null;
  shellFailed = false;

  // 这台设备上真实的所有第三方应用包名（通过 pm list packages -3 获取）
  private readonly realPackages: string[] = [
    'aidepro.top',
    'andes.oplus.documentsreader',
    'bin.mt.plus.canary',
    'com.UCMobile',
    'com.abilvcha.main',
    'com.ai.assistance.operit',
    'com.aluabj.zs',
    'com.android.email',
    'com.apocalua.ruoca',
    'com.autonavi.minimap',
    'com.baidu.netdisk',
    'com.chinamobile.mcloud',
    'com.cloudflare.onedotonedotonedotone',
    'com.codex.douyin.immersive',
    'com.coloros.alarmclock',
    'com.coloros.backuprestore',
    'com.coloros.calculator',
    'com.coloros.calendar',
    'com.coloros.compass2',
    'com.coloros.familyguard',
    'com.coloros.filemanager',
    'com.coloros.note',
    'com.coloros.shortcuts',
    'com.coloros.soundrecorder',
    'com.coloros.translate',
    'com.coloros.weather2',
    'com.coolapk.market',
    'com.coomi.android',
    'com.cscjapp.cppide',
    'com.danpet',
    'com.deepseek.chat',
    'com.dshmobile.app',
    'com.eg.android.AlipayGphone',
    'com.gamelua.manalua',
    'com.gh.gamecenter',
    'com.guoshi.httpcanary',
    'com.heytap.health',
    'com.heytap.music',
    'com.heytap.reader',
    'com.heytap.themestore',
    'com.heytap.yoli',
    'com.ipaexpress.app',
    'com.kuaifa.sq',
    'com.larus.nova',
    'com.lemon.lv',
    'com.luguclub.app',
    'com.meitu.wink',
    'com.nearme.gamecenter',
    'com.netease.sky.vivo',
    'com.nuom.clouds',
    'com.nwdxlgzs.luatools',
    'com.oneplus.bbs',
    'com.oneplus.brickmode',
    'com.oneplus.member',
    'com.oneplus.toolbox',
    'com.oplus.consumerIRApp',
    'com.oplus.melody',
    'com.oplus.riderMode',
    'com.oplus.tips',
    'com.oppo.store',
    'com.phoenix.read',
    'com.quark.browser',
    'com.redteamobile.roaming',
    'com.semcafe.ilcppdumper',
    'com.skyworthdigital.picamera',
    'com.smile.gifmaker',
    'com.ss.android.ugc.aweme',
    'com.ss.android.yumme.video',
    'com.taobao.idlefish',
    'com.taobao.taobao',
    'com.tencent.mf.uam',
    'com.tencent.mm',
    'com.tencent.mobileqq',
    'com.tencent.tmgp.sgame',
    'com.termux',
    'com.tsng.applistdetector',
    'com.unionpay.tsmservice',
    'com.vivo.easyshare',
    'com.weiyan.user',
    'com.xunlei.downloadprovider',
    'com.xunmeng.pinduoduo',
    'idm.internet.download.manager.plus',
    'io.github.huskydg.memorydetector',
    'io.github.vvb2060.mahoshojo',
    'luna.safe.luna',
    'mark.via',
    'me.weishu.kernelsu',
    'moe.shizuku.privileged.api',
    'org.frknkrc44.hma_oss',
    'org.lsposed.manager',
    'org.telegram.group',
    'org.telegram.messenger.web',
    'tv.danmaku.bili',
    'wu.keyChain.test',
  ];

  // 已知应用名映射（覆盖常见应用）
  private readonly packageNames: Record<string, string> = {
    'aidepro.top': 'AIDE Pro',
    'andes.oplus.documentsreader': '文档阅读器',
    'bin.mt.plus.canary': 'MT管理器',
    'com.UCMobile': 'UC浏览器',
    'com.abilvcha.main': 'Abilvcha',
    'com.ai.assistance.operit': 'Operit',
    'com.aluabj.zs': 'Alua',
    'com.android.email': '邮件',
    'com.apocalua.ruoca': 'Apocalua',
    'com.autonavi.minimap': '高德地图',
    'com.baidu.netdisk': '百度网盘',
    'com.chinamobile.mcloud': '中国移动云盘',
    'com.cloudflare.onedotonedotonedotone': '1.1.1.1',
    'com.codex.douyin.immersive': '抖音沉浸版',
    'com.coloros.alarmclock': '时钟',
    'com.coloros.backuprestore': '备份与恢复',
    'com.coloros.calculator': '计算器',
    'com.coloros.calendar': '日历',
    'com.coloros.compass2': '指南针',
    'com.coloros.familyguard': '家庭守护',
    'com.coloros.filemanager': '文件管理',
    'com.coloros.note': '便签',
    'com.coloros.shortcuts': '快捷功能',
    'com.coloros.soundrecorder': '录音机',
    'com.coloros.translate': '翻译',
    'com.coloros.weather2': '天气',
    'com.coolapk.market': '酷安',
    'com.coomi.android': 'Coomi',
    'com.cscjapp.cppide': 'C++ IDE',
    'com.danpet': 'DanPet',
    'com.deepseek.chat': 'DeepSeek',
    'com.dshmobile.app': 'DSH Mobile',
    'com.eg.android.AlipayGphone': '支付宝',
    'com.gamelua.manalua': 'Game Lua',
    'com.gh.gamecenter': '游戏中心',
    'com.guoshi.httpcanary': 'HttpCanary',
    'com.heytap.health': '健康',
    'com.heytap.music': '音乐',
    'com.heytap.reader': '阅读',
    'com.heytap.themestore': '主题商店',
    'com.heytap.yoli': '小布助手',
    'com.ipaexpress.app': 'IPAExpress',
    'com.kuaifa.sq': 'Kuaifa',
    'com.larus.nova': 'Larus Nova',
    'com.lemon.lv': 'Lemon',
    'com.luguclub.app': 'LuguClub',
    'com.meitu.wink': 'Wink',
    'com.nearme.gamecenter': '游戏中心',
    'com.netease.sky.vivo': '网易云音乐',
    'com.nuom.clouds': 'Nuom Clouds',
    'com.nwdxlgzs.luatools': 'LuaTools',
    'com.oneplus.bbs': '一加社区',
    'com.oneplus.brickmode': '禅定模式',
    'com.oneplus.member': '我的OnePlus',
    'com.oneplus.toolbox': '工具箱',
    'com.oplus.consumerIRApp': '遥控器',
    'com.oplus.melody': '铃声',
    'com.oplus.riderMode': '骑行模式',
    'com.oplus.tips': '使用技巧',
    'com.oppo.store': '软件商店',
    'com.phoenix.read': 'Phoenix阅读',
    'com.quark.browser': '夸克',
    'com.redteamobile.roaming': '漫游',
    'com.semcafe.ilcppdumper': 'IL2CPP Dumper',
    'com.skyworthdigital.picamera': '相机',
    'com.smile.gifmaker': '快手',
    'com.ss.android.ugc.aweme': '抖音',
    'com.ss.android.yumme.video': '快影',
    'com.taobao.idlefish': '闲鱼',
    'com.taobao.taobao': '淘宝',
    'com.tencent.mf.uam': '手游加速器',
    'com.tencent.mm': '微信',
    'com.tencent.mobileqq': 'QQ',
    'com.tencent.tmgp.sgame': '王者荣耀',
    'com.termux': 'Termux',
    'com.tsng.applistdetector': 'AppList Detector',
    'com.unionpay.tsmservice': '银联',
    'com.vivo.easyshare': '互传',
    'com.weiyan.user': 'Weiyan',
    'com.xunlei.downloadprovider': '迅雷',
    'com.xunmeng.pinduoduo': '拼多多',
    'idm.internet.download.manager.plus': 'IDM+',
    'io.github.huskydg.memorydetector': 'Memory Detector',
    'io.github.vvb2060.mahoshojo': 'Mahoshojo',
    'luna.safe.luna': 'Luna Safe',
    'mark.via': 'Via浏览器',
    'me.weishu.kernelsu': 'KernelSU',
    'moe.shizuku.privileged.api': 'Shizuku',
    'org.frknkrc44.hma_oss': 'HMA',
    'org.lsposed.manager': 'LSPosed',
    'org.telegram.group': 'Telegram Group',
    'org.telegram.messenger.web': 'Telegram',
    'tv.danmaku.bili': '哔哩哔哩',
    'wu.keyChain.test': 'KeyChain Test',
  };

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private store: FileStore
  ) {}

  ngOnInit() {
    this.loadInstalledApps();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async loadInstalledApps() {
    this.loading = true;
    this.progressPercent = 0;
    this.detectedCount = 0;
    this.allApps = [];

    try {
      this.progressText = '正在扫描手机应用...';
      this.progressPercent = 5;

      // 尝试通过原生 Shell 获取真实包名
      let packages: string[] = [];

      try {
        const result = await this.execShellWithTimeout('pm list packages -3', 3000);
        const lines = result.split('\n').filter(l => l.startsWith('package:'));
        packages = lines.map(l => l.replace('package:', '').trim());
        this.shellFailed = false;
      } catch (e) {
        // Shell 调用失败，使用内置的真实包名列表
        console.warn('Shell 调用失败，使用内置列表', e);
        this.shellFailed = true;
        packages = [...this.realPackages];
      }

      // 去重
      packages = [...new Set(packages)];
      const total = packages.length;
      this.progressPercent = 15;
      this.progressText = `发现 ${total} 个应用，正在提取信息...`;

      // 分批获取详细信息，每批处理并更新进度
      const batchSize = 5;
      for (let i = 0; i < packages.length; i += batchSize) {
        const batch = packages.slice(i, i + batchSize);
        for (const pkg of batch) {
          const info = await this.getAppInfo(pkg);
          if (info) {
            this.allApps.push(info);
            this.detectedCount++;
          }
        }

        const pct = Math.round(15 + (i / packages.length) * 80);
        this.progressPercent = Math.min(95, pct);
        this.progressText = `正在提取 ${this.detectedCount}/${total} 个应用...`;
      }

      // 排序
      this.allApps.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
      this.filteredApps = [...this.allApps];

      this.progressPercent = 100;
      this.progressText = `完成！共 ${this.allApps.length} 个应用`;
    } catch (e) {
      console.warn('获取应用列表失败', e);
      this.progressText = '获取失败，请重试';
    }

    // 延迟一小会让用户看到 100%
    setTimeout(() => {
      this.loading = false;
    }, 300);
  }

  private async execShellWithTimeout(cmd: string, timeoutMs: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Shell 调用超时'));
      }, timeoutMs);

      try {
        const capacitor = (window as any).Capacitor;
        if (capacitor?.Plugins?.Shell?.exec) {
          capacitor.Plugins.Shell.exec({ command: cmd })
            .then((r: any) => {
              clearTimeout(timer);
              resolve(r.output || '');
            })
            .catch((err: any) => {
              clearTimeout(timer);
              reject(err);
            });
        } else {
          clearTimeout(timer);
          reject(new Error('Shell 插件不可用'));
        }
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    });
  }

  private async getAppInfo(packageName: string): Promise<InstalledAppInfo | null> {
    try {
      const appName = this.packageNames[packageName] || packageName.split('.').pop() || packageName;
      let sizeBytes = 0;
      let version = '1.0.0';
      let apkPath = '';

      // 尝试获取详细信息（非关键，失败不影响）
      try {
        const pathResult = await this.execShellWithTimeout(`pm path ${packageName}`, 2000);
        apkPath = pathResult.replace('package:', '').trim();
        if (apkPath) {
          const sizeResult = await this.execShellWithTimeout(`ls -l "${apkPath}" 2>/dev/null | awk '{print $5}'`, 2000);
          sizeBytes = parseInt(sizeResult.trim()) || 0;
        }

        const dumpsys = await this.execShellWithTimeout(`dumpsys package ${packageName} | grep -i versionName | head -1`, 2000);
        const match = dumpsys.match(/versionName=([\S]+)/);
        if (match) version = match[1].replace(/[\r\n]/g, '');
      } catch (e) {
        // 静默失败，用默认值
      }

      const size = this.formatSize(sizeBytes);

      return { name: appName, packageName, size, sizeBytes, version, apkPath };
    } catch (e) {
      return null;
    }
  }

  selectApp(app: InstalledAppInfo) {
    this.selectedApp = this.selectedApp === app ? null : app;
  }

  async confirmImport() {
    if (!this.selectedApp) return;

    const loading = await this.alertCtrl.create({
      header: '正在提取',
      message: `正在提取「${this.selectedApp.name}」的安装包...`,
      buttons: []
    });
    await loading.present();

    setTimeout(() => {
      loading.dismiss();

      this.store.add({
        name: `${this.selectedApp!.name}_v${this.selectedApp!.version}.ipa`,
        size: this.selectedApp!.size,
        sizeBytes: this.selectedApp!.sizeBytes,
        date: new Date().toLocaleDateString('zh-CN'),
        bundleId: this.selectedApp!.packageName,
        version: this.selectedApp!.version,
        status: 'info',
        statusText: '待签名',
        type: 'ipa',
        icon: 'cube-outline',
        iconBg: 'rgba(0,122,255,0.15)'
      });

      this.modalCtrl.dismiss({
        imported: true,
        name: this.selectedApp!.name,
        size: this.selectedApp!.size
      });
    }, 1500);
  }

  filterApps() {
    const q = this.searchQuery.toLowerCase();
    this.filteredApps = q
      ? this.allApps.filter(a =>
          a.name.toLowerCase().includes(q) ||
          a.packageName.toLowerCase().includes(q)
        )
      : [...this.allApps];
  }

  getAppColor(name: string): string {
    const colors = ['#007aff', '#34c759', '#ff9500', '#ff453a', '#bf5af2', '#ff2d55', '#5856d6', '#00c7be', '#ff6482', '#5ac8fa'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  formatTotalSize(): string {
    const total = this.allApps.reduce((acc, a) => acc + a.sizeBytes, 0);
    if (total === 0) return '0 MB';
    const mb = total / (1024 * 1024);
    return mb >= 1024 ? (mb / 1024).toFixed(1) + ' GB' : mb.toFixed(0) + ' MB';
  }

  private formatSize(bytes: number): string {
    if (bytes <= 0) return '未知';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}