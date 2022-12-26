import { Rectangle } from 'electron';

// 用于存储一个窗口数据的对象
class WinStore {
  // uuid，手动生成
  uid: string;
  // 窗口位置和大小信息
  bounds: Rectangle;
  // 内容
  content = '';
  // 是否显示
  flgView: boolean;
  // 创建时间
  createTime: Date = new Date();

  constructor(uid: string, bounds: Rectangle, flgView: boolean) {
    this.uid = uid;
    this.bounds = bounds;
    this.flgView = flgView;
  }
}

function uuid(len: number, radix: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid: string[] = [];
  let i = 0;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

export { WinStore, uuid };
