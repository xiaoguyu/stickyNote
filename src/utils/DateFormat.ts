/**
 * 日期格式化
 * @author Yiur
 * @since 2022年11月7日
 * @link https://blog.csdn.net/Yiur_csdn/article/details/127749090
 */
export class DateFormat {
  public static format(datetime: Date | string, formatting: string): string {
    let timestamp: Date = datetime as Date;
    if (typeof datetime === 'string') {
      timestamp = new Date(Date.parse(datetime));
    }
    const fullYear: string = timestamp.getFullYear().toString();
    const month: string = timestamp.getMonth().toString();
    const date: string = timestamp.getDate().toString();
    const hours: string = timestamp.getHours().toString();
    const minutes: string = timestamp.getMinutes().toString();
    const seconds: string = timestamp.getSeconds().toString();
    const milliseconds: string = timestamp.getMilliseconds().toString();
    formatting = this.parse(formatting, /[y|Y]+/, fullYear);
    formatting = this.parse(formatting, /[M]+/, month, '00');
    formatting = this.parse(formatting, /[d|D]+/, date, '00');
    formatting = this.parse(formatting, /[h|H]+/, hours, '0');
    formatting = this.parse(formatting, /[m]+/, minutes, '00');
    formatting = this.parse(formatting, /[s]+/, seconds, '00');
    formatting = this.parse(formatting, /[S]+/, milliseconds, '000');
    return formatting;
  }

  private static parse(formatting: string, pattern: RegExp, val: string, min?: string): string {
    while (pattern.test(formatting)) {
      pattern.exec(formatting)?.forEach((value) => {
        const length = value.length;
        const valLen = val.length;
        const number = valLen - length;
        let element = val.substring(number);
        if (min) {
          element = min.substring(element.length) + element;
        }
        formatting = formatting.replace(value, element);
      });
    }
    return formatting;
  }
}
