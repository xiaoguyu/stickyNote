import util from './utils/utils';

function execEditorCommand(name, args?: string): void {
  document.execCommand(name, false, args);
}

class Option {
  label: string;
  value: string | boolean;
  constructor(label: string, value: string | boolean) {
    this.label = label;
    this.value = value;
  }
}

const selectRender = (commandName, options: Option[] = [], title = '') => {
  return `
      <select class="tool" name="${commandName}" id="${commandName}" title="${title}">
          ${options.map(
            (e) => `<option class="${commandName}-option" value="${e.value}">${e.label}</option>`
          )}
      </select>
  `;
};

const addEventListener = (commandName) => {
  const eventNameMap = {
    fontName: 'change',
    fontSize: 'change',
    backColor: 'change',
    foreColor: 'change',
    styleWithCSS: 'change',
    contentReadOnly: 'change',
    heading: 'change'
  };
  const needInputUrl = ['insertImage', 'createLink'];
  const eventName = eventNameMap[commandName] || 'click';
  const dom = <HTMLSelectElement>document.getElementById(commandName);
  dom &&
    dom.addEventListener(eventName, () => {
      if (eventName === 'click') {
        if (needInputUrl.includes(commandName)) {
          const value = window.prompt('请输入链接');
          value ? execEditorCommand(commandName, value) : execEditorCommand(commandName);
        } else {
          execEditorCommand(commandName);
        }
      } else if (eventName === 'change') {
        const className = `${commandName}-option`;
        const optionSelectedIndex = document.getElementsByClassName(className);
        const value = (<HTMLSelectElement>optionSelectedIndex[dom.selectedIndex]).value;
        execEditorCommand(commandName, value);
      }
    });
};

const commandMap = {
  undo: {
    name: '撤销',
    command: 'undo'
  },
  redo: {
    name: '重做',
    command: 'redo'
  },
  fontName: {
    name: '字体名',
    command: 'fontName',
    render: () => {
      const options = [
        { label: '微软雅黑', value: 'Microsoft YaHei' },
        { label: '新罗马', value: 'Times New Roman' },
        { label: '宋体', value: 'SimSun' },
        { label: '平方', value: 'PingFang SC' },
        { label: '华文楷体', value: 'STKaiti' },
        { label: 'Arial', value: 'Arial' },
        { label: 'Calibri', value: 'Calibri' },
        { label: 'Comic Sans MS', value: 'Comic Sans MS' },
        { label: 'Verdana', value: 'Verdana' }
      ];
      return selectRender('fontName', options, '字体名');
    }
  },
  fontSize: {
    name: '字体大小',
    command: 'fontSize',
    render: () => {
      const options = [
        { label: '特小', value: '1' },
        { label: '小', value: '2' },
        { label: '正常', value: '3' },
        { label: '略大', value: '4' },
        { label: '大', value: '5' },
        { label: '很大', value: '6' },
        { label: '极大', value: '7' }
      ];
      return selectRender('fontSize', options, '字体大小');
    }
  },
  heading: {
    name: '标题',
    command: 'heading',
    render: () => {
      const options = [
        { label: 'H1', value: 'H1' },
        { label: 'H2', value: 'H2' },
        { label: 'H3', value: 'H3' },
        { label: 'H4', value: 'H4' },
        { label: 'H5', value: 'H5' },
        { label: 'H6', value: 'H6' }
      ];
      return selectRender('heading', options, '标题');
    }
  },
  bold: {
    name: '加粗',
    command: 'bold'
  },
  italic: {
    name: '斜体',
    command: 'italic'
  },
  underline: {
    name: '下划线',
    command: 'underline'
  },
  strikeThrough: {
    name: '删除线',
    command: 'strikeThrough'
  },
  backColor: {
    name: '背景颜色',
    command: 'backColor',
    render: () => {
      const options = [
        { label: '黑', value: 'black' },
        { label: '红', value: 'red' },
        { label: '橙', value: 'orange' },
        { label: '蓝', value: 'blue' },
        { label: '绿', value: 'green' },
        { label: '白', value: 'white' },
        { label: '灰', value: '#999' },
        { label: '浅灰', value: '#ddd' }
      ];
      return selectRender('backColor', options, '背景颜色');
    }
  },
  foreColor: {
    name: '字体颜色',
    command: 'foreColor',
    render: () => {
      const options = [
        { label: '黑', value: 'black' },
        { label: '红', value: 'red' },
        { label: '橙', value: 'orange' },
        { label: '蓝', value: 'blue' },
        { label: '绿', value: 'green' },
        { label: '白', value: 'white' },
        { label: '灰', value: '#999' },
        { label: '浅灰', value: '#ddd' }
      ];
      return selectRender('foreColor', options, '字体颜色');
    }
  },
  superscript: {
    name: '上标',
    command: 'superscript'
  },
  subscript: {
    name: '下标',
    command: 'subscript'
  },
  justifyCenter: {
    name: '居中对齐',
    command: 'justifyCenter'
  },
  justifyFull: {
    name: '两端对齐',
    command: 'justifyFull'
  },
  justifyLeft: {
    name: '左对齐',
    command: 'justifyLeft'
  },
  justifyRight: {
    name: '右对齐',
    command: 'justifyRight'
  },
  removeFormat: {
    name: '清除样式',
    command: 'removeFormat'
  },
  insertHorizontalRule: {
    name: '分割线',
    command: 'insertHorizontalRule'
  },
  insertUnorderedList: {
    name: '无序列表',
    command: 'insertUnorderedList'
  },
  insertOrderedList: {
    name: '有序列表',
    command: 'insertOrderedList'
  },
  increaseFontSize: {
    name: '字体变大',
    command: 'increaseFontSize'
  },
  decreaseFontSize: {
    name: '字体变小',
    command: 'decreaseFontSize'
  },
  styleWithCSS: {
    name: '标记方式',
    command: 'styleWithCSS',
    render: () => {
      const options = [
        { label: 'html标签', value: false },
        { label: 'css样式', value: true }
      ];
      return selectRender('styleWithCSS', options, '标记方式(使用html标签 还是css样式来生成标记)');
    }
  },
  createLink: {
    name: '插入链接',
    command: 'createLink'
  },
  insertImage: {
    name: '插入图片',
    command: 'insertImage'
  },
  contentReadOnly: {
    name: '区域是否可以编辑',
    command: 'contentReadOnly',
    render: () => {
      const options = [
        { label: '是', value: true },
        { label: '否', value: false }
      ];
      return selectRender('contentReadOnly', options, '区域是否可以编辑');
    }
  }
};

const commands = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList'];

const commandZone = document.getElementById('commandZone');
const editor = document.getElementById('editor');

const htmlList = commands.map((commandName) => {
  const command = commandMap[commandName];
  if (!command) {
    return '';
  }
  if (command.render) {
    return command.render();
  }
  return `
      <img class="icon" id="${commandName}" title="${command.name}" 
        src="${util.getAssetsFile('icons/' + commandName + '.svg')}"/>
  `;
});
if (commandZone) {
  commandZone.innerHTML = htmlList.join('\n');
}
if (editor) {
  let timer: NodeJS.Timeout;
  editor.oninput = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // 将数据传mian存储
      window.electronApi.saveContent(editor.innerHTML);
    }, 200);
  };
  // 编辑框获取焦点
  editor.focus();
}

setTimeout(() => {
  commands.forEach((commandName) => addEventListener(commandName));
}, 100);
