import { WinStore, WIN_ARR_KEY } from '../../utils/utils';
import { DateFormat } from '../../utils/DateFormat';

/*
 * 渲染列表数据,
 * refresh:用来判断是否需要强制刷新
 */
let oldSearchStr: string;
async function loadList(refresh = false) {
  // 获取搜索框内容
  const searchInput = <HTMLInputElement>document.getElementById('search-input');
  const searchStr = searchInput?.value ? searchInput?.value : '';
  if (!refresh && searchStr === oldSearchStr) {
    return;
  }
  oldSearchStr = searchStr;

  const winArr: WinStore[] = <WinStore[]>window.electronApi.store.get(WIN_ARR_KEY);
  const contentList = winArr.map((_win) => {
    let flg = false;
    if (searchStr) {
      if (_win.content.indexOf(searchStr) >= 0) {
        flg = true;
      }
    } else {
      flg = true;
    }
    if (flg) {
      return `
      <div class="content-div ${_win.flgView ? 'content-view' : 'content-noview'}" id="${_win.uid}">
        <div class="mask"></div>
        <div class="time">${DateFormat.format(_win.updateTime, 'yyyy-MM-dd hh:mm:ss')}</div>
        <div class="content">${_win.content}</div>
      </div>
    `;
    }
    return '';
  });

  const contentListDiv = document.getElementById('content-list');
  if (contentListDiv) {
    contentListDiv.innerHTML = contentList.join('\n');
  }

  const contentDivs = document.getElementsByClassName('content-div');
  for (let i = 0; i < contentDivs.length; i++) {
    const contentDiv = <HTMLElement>contentDivs[i];
    // 双击显示主页面
    contentDiv.ondblclick = () => {
      window.electronApi.createTab(contentDiv.id);
      loadList(true);
    };
    // 右击弹出菜单
    contentDiv.onauxclick = (event) => {
      // 阻止document.onauxclick
      event.stopPropagation();
      const auxclickMenu = document.getElementById('auxclick-menu');
      if (auxclickMenu) {
        auxclickMenu.style.display = 'block';
        auxclickMenu.style.left = event.x + 'px';
        auxclickMenu.style.top = event.y - 15 + 'px';

        const flgView = contentDiv.classList.contains('content-view');
        const liStr = `
          <li id="view-li" uid="${contentDiv.id}" flgViewed="${flgView ? 1 : 0}">
          ${flgView ? '关闭' : '显示'}笔记</li>
          <li id="delete-li" uid="${contentDiv.id}">删除笔记</li>
        `;
        auxclickMenu.innerHTML = liStr;
      }
      // 右击菜单显示、关闭
      const viewLi = document.getElementById('view-li');
      if (viewLi) {
        viewLi.onclick = () => {
          const uid = viewLi.getAttribute('uid');
          if (uid) {
            const flgViewed = viewLi.getAttribute('flgViewed') === '1';
            window.electronApi.viewTab(!flgViewed, uid);
          }
        };
      }
      // 右击菜单删除
      const deleteLi = document.getElementById('delete-li');
      if (deleteLi) {
        deleteLi.onclick = () => {
          const uid = deleteLi.getAttribute('uid');
          window.electronApi.closeTab(uid);
        };
      }
    };
  }
}
// 页面单机隐藏右击菜单
document.onclick = () => {
  const auxclickMenu = document.getElementById('auxclick-menu');
  if (auxclickMenu) {
    auxclickMenu.style.display = 'none';
  }
};
document.addEventListener('click', () => {
  const auxclickMenu = document.getElementById('auxclick-menu');
  if (auxclickMenu) {
    auxclickMenu.style.display = 'none';
  }
});

document.onauxclick = () => {
  const auxclickMenu = document.getElementById('auxclick-menu');
  if (auxclickMenu) {
    auxclickMenu.style.display = 'none';
  }
};

export function init(): void {
  loadList();

  // 搜索图标点击
  const searchIcon = document.getElementById('search-icon');
  if (searchIcon) {
    searchIcon.onclick = () => {
      loadList();
    };
  }
  // 搜索input回车
  const searchInput = <HTMLInputElement>document.getElementById('search-input');
  if (searchInput) {
    searchInput.onkeydown = (event) => {
      if (event.key === 'Enter') {
        loadList();
      }
    };
  }
  // 新增按钮
  const addDiv = document.getElementById('add-div');
  if (addDiv) {
    addDiv.onclick = () => {
      window.electronApi.createTab();
    };
  }
  // 关闭按钮
  const closeDiv = document.getElementById('close-div');
  if (closeDiv) {
    closeDiv.onclick = () => {
      window.close();
    };
  }
}
init();

// main -> rander，渲染内容
window.electronApi.rerender(() => {
  loadList(true);
});
