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
    // 置顶按钮
    const ontopDiv = document.getElementById('ontop-div');
    if (ontopDiv) {
      ontopDiv.onclick = () => {
        flgTop = !flgTop;
        window.electronApi.setOntop(flgTop);
        if (flgTop) {
          (<HTMLImageElement>ontopDiv).src = './assets/icons/top-selected.svg';
        } else {
          (<HTMLImageElement>ontopDiv).src = './assets/icons/top.svg';
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

init();
