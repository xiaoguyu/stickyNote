import util from './utils/utils';
let flgTop = false;

export function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    // 可以用于初始化

    // 新增按钮
    const addDiv = document.getElementById('add-div');
    if (addDiv) {
      addDiv.onclick = () => {
        window.electronApi.createTab();
      };
    }
    // 打开历史页面按钮
    const historyDiv = document.getElementById('history-div');
    if (historyDiv) {
      historyDiv.onclick = () => {
        window.electronApi.openHistory();
      };
    }
    // 置顶按钮
    const ontopDiv = document.getElementById('ontop-div');
    if (ontopDiv) {
      ontopDiv.onclick = () => {
        flgTop = !flgTop;
        window.electronApi.setOntop(flgTop);
        if (flgTop) {
          (<HTMLImageElement>ontopDiv).src = util.getAssetsFile('icons/top-selected.svg');
        } else {
          (<HTMLImageElement>ontopDiv).src = util.getAssetsFile('icons/top.svg');
        }
      };
    }
    // 关闭按钮
    const closeDiv = document.getElementById('close-div');
    if (closeDiv) {
      closeDiv.onclick = () => {
        window.close();
      };
    }
  });
}

// main -> rander，渲染内容
window.electronApi.onEditorContainer((_event, value) => {
  const editor = document.getElementById('editor');
  if (editor && value) {
    editor.innerHTML = value;
  }
});

window.electronApi.getFocus((_event, flgFocus) => {
  const container = document.getElementById('container');
  const commandZone = document.getElementById('commandZone');

  if (flgFocus) {
    if (container) {
      container.style.bottom = '31px';
    }
    if (commandZone) {
      commandZone.style.display = 'flex';
    }
  } else {
    if (container) {
      container.style.bottom = '0px';
    }
    if (commandZone) {
      commandZone.style.display = 'none';
    }
  }
});

init();
